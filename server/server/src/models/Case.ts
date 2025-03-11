import mongoose, { Document, Schema } from 'mongoose';

export enum CaseStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  APPROVED = 'approved',
  DENIED = 'denied',
  ADDITIONAL_INFO_REQUESTED = 'additional_info_requested',
  ON_HOLD = 'on_hold',
  CLOSED = 'closed'
}

export enum CaseType {
  ASYLUM = 'asylum',
  FAMILY_BASED = 'family_based',
  EMPLOYMENT_BASED = 'employment_based',
  NATURALIZATION = 'naturalization',
  DACA = 'daca',
  VISA = 'visa',
  GREEN_CARD = 'green_card',
  DEPORTATION_DEFENSE = 'deportation_defense',
  OTHER = 'other'
}

export interface ICase extends Document {
  caseNumber: string;
  title: string;
  clientId: mongoose.Types.ObjectId;
  assignedTo?: mongoose.Types.ObjectId;
  caseType: CaseType;
  status: CaseStatus;
  description: string;
  priority: number;
  documents: mongoose.Types.ObjectId[];
  notes: {
    content: string;
    createdBy: mongoose.Types.ObjectId;
    createdAt: Date;
  }[];
  deadlines: {
    title: string;
    date: Date;
    description?: string;
    isCompleted: boolean;
  }[];
  applicationDate: Date;
  hearingDates?: Date[];
  createdAt: Date;
  updatedAt: Date;
}

const CaseSchema: Schema = new Schema(
  {
    caseNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },
    title: {
      type: String,
      required: [true, 'Please provide a case title'],
      trim: true
    },
    clientId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Please provide a client for this case']
    },
    assignedTo: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    },
    caseType: {
      type: String,
      enum: Object.values(CaseType),
      required: [true, 'Please specify the case type']
    },
    status: {
      type: String,
      enum: Object.values(CaseStatus),
      default: CaseStatus.PENDING
    },
    description: {
      type: String,
      required: [true, 'Please provide a case description']
    },
    priority: {
      type: Number,
      default: 3,
      min: 1,
      max: 5
    },
    documents: [{
      type: Schema.Types.ObjectId,
      ref: 'Document'
    }],
    notes: [{
      content: {
        type: String,
        required: true
      },
      createdBy: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
      },
      createdAt: {
        type: Date,
        default: Date.now
      }
    }],
    deadlines: [{
      title: {
        type: String,
        required: true
      },
      date: {
        type: Date,
        required: true
      },
      description: {
        type: String
      },
      isCompleted: {
        type: Boolean,
        default: false
      }
    }],
    applicationDate: {
      type: Date,
      required: true
    },
    hearingDates: [{
      type: Date
    }]
  },
  {
    timestamps: true
  }
);

// Generate a unique case number before saving if not provided
CaseSchema.pre<ICase>('save', async function(next) {
  if (!this.isNew) {
    return next();
  }
  
  if (!this.caseNumber) {
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const randomStr = Math.random().toString(36).substring(2, 8).toUpperCase();
    this.caseNumber = `CASE-${dateStr}-${randomStr}`;
  }
  
  next();
});

export default mongoose.model<ICase>('Case', CaseSchema);

