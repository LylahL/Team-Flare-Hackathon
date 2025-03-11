import nodemailer from 'nodemailer';
import fs from 'fs';
import path from 'path';
import handlebars from 'handlebars';
import dotenv from 'dotenv';

dotenv.config();

interface EmailOptions {
  to: string | string[];
  subject: string;
  template: string;
  context: Record<string, any>;
  attachments?: Array<{
    filename: string;
    path: string;
    contentType?: string;
  }>;
}

class EmailService {
  private transporter: nodemailer.Transporter;
  private templatesDir: string;

  constructor() {
    // Initialize email transporter
    this.transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: parseInt(process.env.EMAIL_PORT || '587'),
      secure: process.env.EMAIL_SECURE === 'true',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    // Set templates directory
    this.templatesDir = path.join(__dirname, '../templates/emails');
  }

  /**
   * Load and compile an email template
   */
  private async compileTemplate(templateName: string, context: Record<string, any>): Promise<string> {
    const templatePath = path.join(this.templatesDir, `${templateName}.hbs`);
    const templateSource = fs.readFileSync(templatePath, 'utf-8');
    const template = handlebars.compile(templateSource);
    return template(context);
  }

  /**
   * Send an email using a template
   */
  async sendTemplateEmail(options: EmailOptions): Promise<void> {
    try {
      const html = await this.compileTemplate(options.template, options.context);

      const mailOptions = {
        from: process.env.EMAIL_FROM || 'Immigration App <noreply@immigrationapp.com>',
        to: Array.isArray(options.to) ? options.to.join(',') : options.to,
        subject: options.subject,
        html,
        attachments: options.attachments || [],
      };

      await this.transporter.sendMail(mailOptions);
      console.log(`Email sent to ${options.to}`);
    } catch (error) {
      console.error('Failed to send email:', error);
      throw new Error(`Failed to send email: ${error}`);
    }
  }

  /**
   * Send document share notification
   */
  async sendDocumentShareNotification(
    to: string | string[],
    documentName: string,
    sharedByName: string,
    shareLink: string,
    expiresAt: Date,
    message: string = ''
  ): Promise<void> {
    await this.sendTemplateEmail({
      to,
      subject: `${sharedByName} shared a document with you: ${documentName}`,
      template: 'document-share',
      context: {
        documentName,
        sharedByName,
        shareLink,
        expiresAt: expiresAt.toLocaleDateString(),
        message: message || 'No message included.',
        appName: process.env.APP_NAME || 'Immigration App',
        appUrl: process.env.CLIENT_URL || 'http://localhost:3000',
      },
    });
  }

  /**
   * Send notification when a document share has been revoked
   */
  async sendShareRevokedNotification(
    to: string | string[],
    documentName: string,
    revokedByName: string
  ): Promise<void> {
    await this.sendTemplateEmail({
      to,
      subject: `Access to shared document revoked: ${documentName}`,
      template: 'share-revoked',
      context: {
        documentName,
        revokedByName,
        appName: process.env.APP_NAME || 'Immigration App',
        appUrl: process.env.CLIENT_URL || 'http://localhost:3000',
      },
    });
  }

  /**
   * Send notification when a document is about to expire
   */
  async sendShareExpirationReminder(
    to: string | string[],
    documentName: string,
    expiresAt: Date
  ): Promise<void> {
    await this.sendTemplateEmail({
      to,
      subject: `Shared document access expiring soon: ${documentName}`,
      template: 'share-expiration',
      context: {
        documentName,
        expiresAt: expiresAt.toLocaleDateString(),
        appName: process.env.APP_NAME || 'Immigration App',
        appUrl: process.env.CLIENT_URL || 'http://localhost:3000',
      },
    });
  }
}

export default new EmailService();

