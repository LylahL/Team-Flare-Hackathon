import { Request, Response, NextFunction } from 'express';
import DocumentShare from '../models/DocumentShare';

/**
 * Middleware to validate document share access
 * Checks if the share token is valid, not expired, and not revoked
 */
export const validateShareAccess = async (req: Request, res: Response, next: NextFunction) => {
  const { token } = req.params;
  
  if (!token) {
    return res.status(401).json({ message: 'Access token is required' });
  }
  
  try {
    // Find the share record by token
    const share = await DocumentShare.findOne({ 
      accessToken: token,
      isRevoked: false,
      expiresAt: { $gt: new Date() }
    });
    
    if (!share) {
      return res.status(403).json({ 
        message: 'Invalid or expired share link. Please request a new share.' 
      });
    }
    
    // Track access
    share.accessCount += 1;
    share.lastAccessed = new Date();
    await share.save();
    
    // Attach share info to request for downstream handlers
    req.documentShare = share;
    
    next();
  } catch (error) {
    console.error('Share validation error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

/**
 * Middleware to check permissions for document operations
 */
export const checkSharePermissions = (requiredPermission: 'view' | 'edit' | 'download') => {
  return (req: Request, res: Response, next: NextFunction) => {
    const share = req.documentShare;
    
    if (!share) {
      return res.status(403).json({ message: 'No share access found' });
    }
    
    // Check if the user has at least the required permission
    const permissionLevels = {
      'view': 0,
      'download': 1,
      'edit': 2
    };
    
    const userPermissionLevel = permissionLevels[share.permissions];
    const requiredPermissionLevel = permissionLevels[requiredPermission];
    
    if (userPermissionLevel < requiredPermissionLevel) {
      return res.status(403).json({ 
        message: `You don't have ${requiredPermission} permission for this document` 
      });
    }
    
    next();
  };
};

// Extend Express Request type
declare global {
  namespace Express {
    interface Request {
      documentShare?: any;
    }
  }
}

import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import { DocumentShare, IDocumentShare } from '../models/DocumentShare';
import { User } from '../models/User';
import { sendShareRevokedEmail } from '../services/emailService';

/**
 * Middleware to validate document sharing permissions
 * Checks if:
 * - The share exists
 * - The share has not expired
 * - The access limit has not been reached
 * - The user has permission to access the document
 */
export const validateShareAccess = async (
  req: Request,
  res: Response,
  NextFunction: NextFunction
) => {
  try {
    const shareId = req.params.shareId || req.query.shareId as string;
    
    if (!shareId || !mongoose.Types.ObjectId.isValid(shareId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid share ID'
      });
    }

    // Find the share by ID
    const share = await DocumentShare.findById(shareId);
    
    if (!share) {
      return res.status(404).json({
        success: false,
        message: 'Share not found or has been revoked'
      });
    }

    // Check if share is expired
    if (share.expiresAt && new Date(share.expiresAt) < new Date()) {
      // Mark share as expired
      await DocumentShare.findByIdAndUpdate(shareId, { 
        isActive: false,
        revokedAt: new Date(),
        revocationReason: 'Share expired'
      });

      // Send notification email if configured
      if (share.notifyOnRevoke) {
        const recipient = await User.findById(share.sharedWith);
        const sender = await User.findById(share.sharedBy);
        if (recipient && sender) {
          await sendShareRevokedEmail(
            recipient.email, 
            recipient.firstName, 
            share.documentName, 
            share.documentType,
            share.caseReference,
            sender.firstName + ' ' + sender.lastName,
            'Share expired'
          );
        }
      }

      return res.status(403).json({
        success: false,
        message: 'Share has expired'
      });
    }

    // Check if access limit has been reached
    if (share.accessLimit && share.accessCount >= share.accessLimit) {
      // Mark share as expired due to access limit
      await DocumentShare.findByIdAndUpdate(shareId, { 
        isActive: false,
        revokedAt: new Date(),
        revocationReason: 'Access limit reached'
      });

      // Send notification email if configured
      if (share.notifyOnRevoke) {
        const recipient = await User.findById(share.sharedWith);
        const sender = await User.findById(share.sharedBy);
        if (recipient && sender) {
          await sendShareRevokedEmail(
            recipient.email, 
            recipient.firstName, 
            share.documentName, 
            share.documentType,
            share.caseReference,
            sender.firstName + ' ' + sender.lastName,
            'Access limit reached'
          );
        }
      }

      return res.status(403).json({
        success: false,
        message: 'Access limit reached for this document'
      });
    }

    // If email-based sharing, check if user is authenticated and matches shared email
    if (share.sharedWith) {
      const userId = req.user?.id;
      
      if (!userId || userId.toString() !== share.sharedWith.toString()) {
        return res.status(403).json({
          success: false,
          message: 'You do not have permission to access this document'
        });
      }
    }

    // Increment access count
    await DocumentShare.findByIdAndUpdate(shareId, { 
      $inc: { accessCount: 1 },
      lastAccessedAt: new Date()
    });

    // Attach share to request for use in controller
    req.documentShare = share;
    
    NextFunction();
  } catch (error) {
    console.error('Share validation error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error validating share access'
    });
  }
};

/**
 * Middleware to validate if a user has permission to revoke a share
 * Only the user who created the share or an admin can revoke it
 */
export const validateRevokePermission = async (
  req: Request,
  res: Response,
  NextFunction: NextFunction
) => {
  try {
    const shareId = req.params.shareId;
    const userId = req.user?.id;
    
    if (!shareId || !mongoose.Types.ObjectId.isValid(shareId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid share ID'
      });
    }

    // Find the share by ID
    const share = await DocumentShare.findById(shareId);
    
    if (!share) {
      return res.status(404).json({
        success: false,
        message: 'Share not found or already revoked'
      });
    }

    // Check if user is the one who shared the document or an admin
    if (share.sharedBy.toString() !== userId && req.user?.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to revoke this share'
      });
    }

    // Attach share to request for use in controller
    req.documentShare = share;
    
    NextFunction();
  } catch (error) {
    console.error('Revoke permission validation error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error validating revoke permission'
    });
  }
};

