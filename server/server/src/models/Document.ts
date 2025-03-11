import mongoose, { Document, Schema } from 'mongoose';

export enum DocumentType {
  PASSPORT = 'passport',
  VISA = 'visa',
  BIRTH_CERTIFICATE = 'birth_certificate',
  MARRIAGE_CERTIFICATE = 'marriage_certificate',
  COURT_RECORD = 'court_record',
  MEDICAL_RECORD = 'medical_record',
  EMPLOYMENT_LETTER = 'employment_letter',
  FINANCIAL_DOCUMENT = 'financial_document',
  PETITION = 'petition',
  APPLICATION_FORM = 'application_form',
  AFFIDAVIT = 'affidavit',
  EVIDENCE = 'evidence',
  OTHER = 'other'
}

export interface IDocument extends Document {
  name: string;
  description?: string;
  fileUrl: string;
  fileType: string;
  fileSize: number;
  documentType: DocumentType;
  uploadedBy: mongoose.Types.ObjectId;
  caseId?: mongoose.Types.ObjectId;
  userId?: mongoose.Types.ObjectId;
  isVerified: boolean;
  verifiedBy?: mongoose.Types.ObjectId;
  verifiedAt?: Date;
  expiryDate?: Date;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

const DocumentSchema: Schema = new Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide a document name'],
      trim: true
    },
    description: {
      type: String,
      trim: true
    },
    fileUrl: {
      type: String,
      required: [true, 'Please provide a file URL'],
      trim: true
    },
    fileType: {
      type: String,
      required: [true, 'Please provide a file type']
    },
    fileSize: {
      type: Number,
      required: [true, 'Please provide a file size']
    },
    documentType: {
      type: String,
      enum: Object.values(DocumentType),
      required: [true, 'Please specify the document type']
    },
    uploadedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Please specify who uploaded this document']
    },
    caseId: {
      type: Schema.Types.ObjectId,
      ref: 'Case'
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    },
    isVerified: {
      type: Boolean,
      default: false
    },
    verifiedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    },
    verifiedAt: {
      type: Date
    },
    expiryDate: {
      type: Date
    },
    tags: [{
      type: String,
      trim: true
    }]
  },
  {
    timestamps: true
  }
);

// Validation to ensure that a document is associated with either a case or a user
DocumentSchema.pre<IDocument>('save', function(next) {
  if (!this.caseId && !this.userId) {
    return next(new Error('Document must be associated with either a case or a user'));
  }
  next();
});

// Update verification information when document is verified
DocumentSchema.methods.verify = async function(userId: mongoose.Types.ObjectId) {
  this.isVerified = true;
  this.verifiedBy = userId;
  this.verifiedAt = new Date();
  return await this.save();
};

export default mongoose.model<IDocument>('Document', DocumentSchema);

