import mongoose from 'mongoose';

const sessionSchema = new mongoose.Schema(
  {
    admission: { type: mongoose.Schema.Types.ObjectId, ref: 'Admission', required: true, index: true },
    date: { type: Date, required: true, index: true },
    topic: { type: String, default: '', trim: true },
    attended: { type: Boolean, default: true },
    score: { type: Number, default: null },
    notes: { type: String, default: '' },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    createdByName: { type: String, default: '' }
  },
  { timestamps: true }
);

sessionSchema.index({ admission: 1, date: -1 });

export default mongoose.model('Session', sessionSchema);
