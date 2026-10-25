import mongoose from 'mongoose';

const admissionSchema = new mongoose.Schema(
  {
    applicationNo: { type: String, unique: true, sparse: true },

    archerName: { type: String, required: true, trim: true },
    dob: { type: String, default: '' },
    gender: { type: String, enum: ['', 'Male', 'Female', 'Other'], default: '' },
    photo: { type: String, default: '' },

    parentName: { type: String, default: '', trim: true },
    contactNumber: { type: String, required: true, trim: true },
    alternateContact: { type: String, default: '', trim: true },
    email: { type: String, default: '', trim: true },

    addressLine1: { type: String, default: '' },
    addressLine2: { type: String, default: '' },

    program: {
      type: String,
      enum: ['', 'Beginner', 'Intermediate', 'Advanced', 'Competitive'],
      default: ''
    },
    ageGroup: {
      type: String,
      enum: [
        '',
        'Kid (6-12 years)',
        'Youth (12-18 years)',
        'Adult (18+ years)',
        'Under 6',
        '6+ Years',
        'Youth',
        'Adult',
        'All Levels'
      ],
      default: ''
    },
    weekendBatch: {
      type: String,
      enum: [
        '',
        'Morning (Friday, Saturday, Sunday)',
        'Evening (Friday, Saturday, Sunday)',
        'Saturday Morning',
        'Saturday Evening',
        'Sunday Morning',
        'Sunday Evening',
        'Both Weekends',
        'Flexible'
      ],
      default: ''
    },

    previousExperience: { type: String, enum: ['', 'Yes', 'No'], default: '' },
    experienceDetail: { type: String, default: '' },
    medicalConditions: { type: String, default: '' },

    emergencyContactName: { type: String, default: '' },
    emergencyContactNumber: { type: String, default: '' },

    declarationAgreed: { type: Boolean, default: false },
    signatureDate: { type: String, default: '' },

    approvalStatus: {
      type: String,
      enum: ['Pending', 'Approved', 'Rejected'],
      default: 'Pending'
    },
    approvalNote: { type: String, default: '' },
    approvedAt: { type: Date, default: null },
    approvedByName: { type: String, default: '' },

    whatsappNumber: { type: String, default: '', trim: true },
    status: { type: String, enum: ['Submitted', 'Sent to WhatsApp'], default: 'Submitted' },
    sentAt: { type: Date, default: null },
    sendMode: { type: String, enum: ['', 'cloud-api', 'wa.me'], default: '' },

    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true },
    createdByName: { type: String, default: '' }
  },
  { timestamps: true }
);

admissionSchema.index({ archerName: 'text', parentName: 'text', contactNumber: 'text' });

export default mongoose.model('Admission', admissionSchema);
