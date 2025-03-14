const { expect } = require('chai');
const config = require('../src/config/config');
const path = require('path');
const fs = require('fs');

describe('Configuration Module', () => {
  describe('Environment Variables', () => {
    const originalEnv = process.env;

    beforeEach(() => {
      // Make a copy of the environment
      process.env = { ...originalEnv };
    });

    afterEach(() => {
      // Restore original environment
      process.env = originalEnv;
    });

    it('should use default port when PORT is not defined', () => {
      delete process.env.PORT;
      // Require config again to trigger the recalculation
      const freshConfig = require('../src/config/config');
      expect(freshConfig.port).to.equal(5000);
    });

    it('should use environment PORT when defined', () => {
      process.env.PORT = '4000';
      // Require config again to trigger the recalculation
      const freshConfig = require('../src/config/config');
      expect(freshConfig.port).to.equal(4000);
    });

    it('should use default MongoDB URI in test environment', () => {
      process.env.NODE_ENV = 'test';
      process.env.MONGO_URI = '';
      // Require config again to trigger the recalculation
      const freshConfig = require('../src/config/config');
      expect(freshConfig.mongoose.url).to.include('mongodb://');
      expect(freshConfig.mongoose.url).to.include('test');
    });

    it('should set the correct JWT settings', () => {
      expect(config.jwt).to.have.property('secret');
      expect(config.jwt).to.have.property('expiresIn');
      expect(config.jwt.secret).to.be.a('string');
    });
  });

  describe('Email Configuration', () => {
    it('should have email service configuration', () => {
      expect(config.email).to.have.property('service');
      expect(config.email).to.have.property('auth');
      expect(config.email.auth).to.have.property('user');
      expect(config.email.auth).to.have.property('pass');
    });

    it('should have email templates configuration', () => {
      expect(config.email).to.have.property('templates');
      expect(config.email.templates).to.have.property('welcome');
      expect(config.email.templates).to.have.property('resetPassword');
      expect(config.email.templates).to.have.property('verifyEmail');
    });

    it('should have valid paths for email templates', () => {
      // Check if the template paths exist
      const templatesDir = path.resolve(__dirname, '../src/templates');
      
      if (fs.existsSync(templatesDir)) {
        const welcomeTemplatePath = path.resolve(templatesDir, 'welcome.html');
        const resetPasswordTemplatePath = path.resolve(templatesDir, 'reset-password.html');
        const verifyEmailTemplatePath = path.resolve(templatesDir, 'verify-email.html');
        
        expect(fs.existsSync(welcomeTemplatePath)).to.be.true;
        expect(fs.existsSync(resetPasswordTemplatePath)).to.be.true;
        expect(fs.existsSync(verifyEmailTemplatePath)).to.be.true;
      }
    });
  });

  describe('File Upload Configuration', () => {
    it('should have file upload configuration', () => {
      expect(config.upload).to.have.property('limits');
      expect(config.upload.limits).to.have.property('fileSize');
      expect(config.upload).to.have.property('fileTypes');
    });
  });

  describe('Security Configuration', () => {
    it('should have rate limiting configuration', () => {
      expect(config.rateLimit).to.have.property('windowMs');
      expect(config.rateLimit).to.have.property('max');
    });

    it('should have CORS configuration', () => {
      expect(config.cors).to.have.property('origin');
      expect(config.cors).to.have.property('methods');
    });
  });
});

