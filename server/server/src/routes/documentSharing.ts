import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import { authenticate } from '../middleware/auth';
import Document from '../models/Document';
import User from '../models/User';
import DocumentShare from '../models/DocumentShare';
import emailService from '../services/emailService';

const router = express.Router();

/**
 * @route   POST /api/documents/:id/share/link
 * @desc    Generate a sharing link for a document
 * @access  Private (Authentication required)
 */
router.post('/documents/:id/share/link', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const { expiresInDays = 7, permissions = 'view' } = req.body;
    const userId = req.user.id;

    // Check if document exists and user has access
    const document = await Document.findById(id);
    if (!document) {
      return res.status(404).json({ message: 'Document not found' });
    }

    // Check if user has permission to share this document
    if (document.uploadedBy.toString() !== userId && !req.user.isAdmin) {
      return res.status(403).json({ message: 'You do not have permission to share this document' });
    }

    // Calculate expiration date
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + expiresInDays);

    // Create share record
    const shareId = uuidv4();
    const newShare = new DocumentShare({
      documentId: id,
      shareId,
      sharedBy: userId,
      permissions,
      expiresAt,
      shareType: 'link',
    });

    await newShare.save();

    // Generate share link
    const baseUrl = process.env.CLIENT_URL || 'http://localhost:3000';
    const shareLink = `${baseUrl}/documents/shared/${shareId}`;

    return res.status(201).json({
      shareId,
      shareLink,
      expiresAt,
      permissions,
    });
  } catch (error) {
    console.error('Error generating share link:', error);
    return res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @route   POST /api/documents/:id/share/email
 * @desc    Share document with specific recipients via email
 * @access  Private (Authentication required)
 */
router.post('/documents/:id/share/email', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const { emails, expiresInDays = 7, message = '', permissions = 'view' } = req.body;
    const userId = req.user.id;

    if (!emails || !Array.isArray(emails) || emails.length === 0) {
      return res.status(400).json({ message: 'At least one email address is required' });
    }

    // Check if document exists
    const document = await Document.findById(id);
    if (!document) {
      return res.status(404).json({ message: 'Document not found' });
    }

    // Check if user has permission to share this document
    if (document.uploadedBy.toString() !== userId && !req.user.isAdmin) {
      return res.status(403).json({ message: 'You do not have permission to share this document' });
    }

    // Get user info for the email
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Calculate expiration date
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + expiresInDays);

    // Create a share record for each recipient
    const shareResults = await Promise.all(
      emails.map(async (email) => {
        const shareId = uuidv4();
        const newShare = new DocumentShare({
          documentId: id,
          shareId,
          sharedBy: userId,
          sharedWith: email,
          permissions,
          expiresAt,
          shareType: 'email',
        });

        await newShare.save();

        // Generate share link
        const baseUrl = process.env.CLIENT_URL || 'http://localhost:3000';
        const shareLink = `${baseUrl}/documents/shared/${shareId}`;

        // Send email notification
        await emailService.sendDocumentShareNotification(
          email,
          document.fileName,
          `${user.firstName} ${user.lastName}`,
          shareLink,
          expiresAt,
          message
        );

        return {
          email,
          shareId,
          shareLink,
          expiresAt,
        };
      })
    );

    return res.status(200).json({
      message: 'Document shared successfully',
      shares: shareResults,
    });
  } catch (error) {
    console.error('Error sharing document via email:', error);
    return res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @route   GET /api/documents/:id/shares
 * @desc    Get all active shares for a document
 * @access  Private (Authentication required)
 */
router.get('/documents/:id/shares', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Check if document exists
    const document = await Document.findById(id);
    if (!document) {
      return res.status(404).json({ message: 'Document not found' });
    }

    // Check if user has permission to view shares for this document
    if (document.uploadedBy.toString() !== userId && !req.user.isAdmin) {
      return res.status(403).json({ message: 'You do not have permission to view shares for this document' });
    }

    // Find all active shares for this document
    const shares = await DocumentShare.find({
      documentId: id,
      expiresAt: {

