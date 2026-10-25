import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    phone: { type: String, trim: true, default: '' },
    password: { type: String, required: true, select: false },
    role: { type: String, enum: ['official', 'admin', 'parent'], default: 'official' },
    active: { type: Boolean, default: true },
    admissionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Admission', default: null }
  },
  { timestamps: true }
);

export default mongoose.model('User', userSchema);
