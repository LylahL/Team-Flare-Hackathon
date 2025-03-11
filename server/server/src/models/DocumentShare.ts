import mongoose, { Schema, Document } from 'mongoose';

export interface IDocumentShare extends Document {
  documentId: mongoose.Types.ObjectId;
  sharedBy: mongoose.Types.ObjectId;
  sharedWith: string; // Email address
  accessToken: string;
  permissions: 'view' | 'edit' | 'download';
  createdAt: Date;
  expiresAt: Date;
  lastAccessed?: Date;
  accessCount: number;
  isRevoked: boolean;
  shareType: 'email' | 'link';
}

const DocumentShareSchema: Schema = new Schema({
  documentId: {
    type: Schema.Types.ObjectId,
    ref: 'Document',
    required: true
  },
  sharedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  sharedWith: {
    type: String,
    required: true,
    trim: true,
    lowercase: true
  },
  accessToken: {
    type: String,
    required: true,
    unique: true
  },
  permissions: {
    type: String,
    enum: ['view', 'edit', 'download'],
    default: 'view'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  expiresAt: {
    type: Date,
    required: true
  },
  lastAccessed: {
    type: Date
  },
  accessCount: {
    type: Number,
    default: 0
  },
  isRevoked: {
    type: Boolean,
    default: false
  },
  shareType: {
    type: String,
    enum: ['email', 'link'],
    required: true
  }
});

// Create compound indexes for better query performance
DocumentShareSchema.index({ documentId: 1, sharedWith: 1 });
DocumentShareSchema.index({ accessToken: 1 });
DocumentShareSchema.index({ sharedBy: 1 });
DocumentShareSchema.index({ expiresAt: 1 });
DocumentShareSchema.index({ isRevoked: 1, expiresAt: 1 });

export default mongoose.model<IDocumentShare>('DocumentShare', DocumentShareSchema);

import mongoose, { Document, Schema } from 'mongoose';
import { IUser } from './User';

export interface IDocumentShare extends Document {
  documentId: mongoose.Types.ObjectId;
  documentName: string;
  documentType: string;
  caseReference: string;
  sharedBy: mongoose.Types.ObjectId;
  sharedWith: mongoose.Types.ObjectId | null;
  sharedEmail: string | null;
  accessToken: string;
  isActive: boolean;
  createdAt: Date;
  expiresAt: Date | null;
  accessLimit: number | null;
  accessCount: number;
  lastAccessedAt: Date | null;
  revokedAt: Date | null;
  revocationReason: string | null;
  notifyOnRevoke: boolean;
  notifyOnAccess: boolean;
  permissions: {
    download: boolean;
    print: boolean;
    comment: boolean;
  };
}

const DocumentShareSchema: Schema = new Schema({
  documentId: {
    type: Schema.Types.ObjectId,
    ref: 'Document',
    required: true
  },
  documentName: {
    type: String,
    required: true
  },
  documentType: {
    type: String,
    required: true
  },
  caseReference: {
    type: String,
    required: true
  },
  sharedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  sharedWith: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  sharedEmail: {
    type: String,
    default: null
  },
  accessToken: {
    type: String,
    required: true,
    unique: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  expiresAt: {
    type: Date,
    default: null
  },
  accessLimit: {
    type: Number,
    default: null
  },
  accessCount: {
    type: Number,
    default: 0
  },
  lastAccessedAt: {
    type: Date,
    default: null
  },
  revokedAt: {
    type: Date,
    default: null
  },
  revocationReason: {
    type: String,
    default: null
  },
  notifyOnRevoke: {
    type: Boolean,
    default: true
  },
  notifyOnAccess: {
    type: Boolean,
    default: false
  },
  permissions: {
    download: {
      type: Boolean,
      default: true
    },
    print: {
      type: Boolean,
      default: true
    },
    comment: {
      type: Boolean,
      default: false
    }
  }
});

// Create compound index for efficient querying
DocumentShareSchema.index({

