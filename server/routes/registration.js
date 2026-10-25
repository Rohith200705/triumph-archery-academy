import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import Admission from '../models/Admission.js';
import User from '../models/User.js';

const router = Router();

async function nextApplicationNo() {
  const year = new Date().getFullYear();
  const prefix = `TAA-${year}-`;
  const last = await Admission.findOne({ applicationNo: new RegExp(`^${prefix}`) })
    .sort({ applicationNo: -1 })
    .select('applicationNo');
  const seq = last ? parseInt(last.applicationNo.replace(prefix, ''), 10) + 1 : 1;
  return `${prefix}${String(seq).padStart(4, '0')}`;
}

router.post('/register', async (req, res) => {
  try {
    const body = req.body || {};
    const { archerName, contactNumber, email, password } = body;

    if (!archerName || !contactNumber || !email || !password) {
      return res
        .status(400)
        .json({ message: 'Archer name, contact number, email and password are required' });
    }
    if (String(password).length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }

    const normalizedEmail = String(email).toLowerCase().trim();
    const existing = await User.findOne({ email: normalizedEmail });
    if (existing) {
      return res.status(409).json({ message: 'This email already has an account. Please log in.' });
    }

    const applicationNo = await nextApplicationNo();

    const admission = await Admission.create({
      ...body,
      email: normalizedEmail,
      applicationNo,
      status: 'Submitted',
      approvalStatus: 'Pending',
      createdByName: 'Online Registration'
    });

    const user = await User.create({
      name: body.parentName || `${archerName} (Guardian)`,
      email: normalizedEmail,
      phone: contactNumber,
      password: await bcrypt.hash(String(password), 10),
      role: 'parent',
      active: true,
      admissionId: admission._id
    });

    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN || '7d'
    });

    res.status(201).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        admissionId: admission._id
      },
      admission: {
        _id: admission._id,
        applicationNo: admission.applicationNo,
        approvalStatus: admission.approvalStatus
      }
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

export default router;
