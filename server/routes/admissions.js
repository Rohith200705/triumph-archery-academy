import { Router } from 'express';
import bcrypt from 'bcryptjs';
import Admission from '../models/Admission.js';
import Session from '../models/Session.js';
import User from '../models/User.js';
import { requireAuth, requireStaff } from '../middleware/auth.js';
import { sendWhatsAppDocument, waMeLink } from './whatsapp.js';

const router = Router();
router.use(requireAuth, requireStaff);

router.get('/', async (req, res) => {
  try {
    const {
      search = '',
      program = '',
      ageGroup = '',
      weekendBatch = '',
      gender = '',
      previousExperience = '',
      status = '',
      approval = '',
      dateFrom = '',
      dateTo = '',
      page = 1,
      limit = 10,
      sort = '-createdAt'
    } = req.query;

    const q = {};
    if (search) {
      const rx = new RegExp(String(search).replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
      q.$or = [
        { archerName: rx },
        { parentName: rx },
        { contactNumber: rx },
        { applicationNo: rx },
        { email: rx }
      ];
    }
    if (program) q.program = program;
    if (ageGroup) q.ageGroup = ageGroup;
    if (weekendBatch) q.weekendBatch = weekendBatch;
    if (gender) q.gender = gender;
    if (previousExperience) q.previousExperience = previousExperience;
    if (status) q.status = status;
    if (approval) q.approvalStatus = approval;
    if (dateFrom || dateTo) {
      q.createdAt = {};
      if (dateFrom) q.createdAt.$gte = new Date(dateFrom);
      if (dateTo) {
        const d = new Date(dateTo);
        d.setHours(23, 59, 59, 999);
        q.createdAt.$lte = d;
      }
    }

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 10));

    const [items, total] = await Promise.all([
      Admission.find(q)
        .select('-photo')
        .sort(sort)
        .skip((pageNum - 1) * limitNum)
        .limit(limitNum)
        .lean(),
      Admission.countDocuments(q)
    ]);

    res.json({ items, total, page: pageNum, pages: Math.ceil(total / limitNum) || 1 });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/stats', async (req, res) => {
  try {
    const [
      total,
      sent,
      pendingApproval,
      rejected,
      thisMonth,
      byProgram,
      byBatch,
      byAgeGroup,
      recent
    ] = await Promise.all([
      Admission.countDocuments(),
      Admission.countDocuments({ status: 'Sent to WhatsApp' }),
      Admission.countDocuments({ approvalStatus: 'Pending' }),
      Admission.countDocuments({ approvalStatus: 'Rejected' }),
      Admission.countDocuments({
        createdAt: { $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) }
      }),
      Admission.aggregate([
        { $group: { _id: '$program', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ]),
      Admission.aggregate([
        { $group: { _id: '$weekendBatch', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ]),
      Admission.aggregate([
        { $group: { _id: '$ageGroup', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ]),
      Admission.find().select('-photo').sort('-createdAt').limit(6).lean()
    ]);

    res.json({
      total,
      sent,
      pending: total - sent,
      pendingApproval,
      rejected,
      thisMonth,
      byProgram,
      byBatch,
      byAgeGroup,
      recent
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const doc = await Admission.findById(req.params.id).lean();
    if (!doc) return res.status(404).json({ message: 'Admission not found' });
    res.json(doc);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const body = req.body || {};
    if (!body.archerName || !body.contactNumber) {
      return res.status(400).json({ message: 'Archer name and contact number are required' });
    }

    const doc = await Admission.create({
      ...body,
      applicationNo: await nextApplicationNo(),
      status: 'Submitted',
      approvalStatus: body.approvalStatus || 'Approved',
      createdBy: req.user._id,
      createdByName: req.user.name
    });
    res.status(201).json(doc);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

async function nextApplicationNo() {
  const year = new Date().getFullYear();
  const prefix = `TAA-${year}-`;
  const last = await Admission.findOne({ applicationNo: new RegExp(`^${prefix}`) })
    .sort({ applicationNo: -1 })
    .select('applicationNo');
  const seq = last ? parseInt(last.applicationNo.replace(prefix, ''), 10) + 1 : 1;
  return `${prefix}${String(seq).padStart(4, '0')}`;
}

router.put('/:id', async (req, res) => {
  try {
    const doc = await Admission.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    if (!doc) return res.status(404).json({ message: 'Admission not found' });
    res.json(doc);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const doc = await Admission.findByIdAndDelete(req.params.id);
    if (!doc) return res.status(404).json({ message: 'Admission not found' });
    await Promise.all([
      Session.deleteMany({ admission: doc._id }),
      User.deleteMany({ admissionId: doc._id, role: 'parent' })
    ]);
    res.json({ message: 'Admission deleted' });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.post('/:id/approve', async (req, res) => {
  try {
    const doc = await Admission.findById(req.params.id);
    if (!doc) return res.status(404).json({ message: 'Admission not found' });

    doc.approvalStatus = 'Approved';
    doc.approvalNote = req.body?.note || '';
    doc.approvedAt = new Date();
    doc.approvedByName = req.user.name;
    await doc.save();

    await User.updateMany({ admissionId: doc._id, role: 'parent' }, { active: true });

    res.json(doc);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.post('/:id/reject', async (req, res) => {
  try {
    const doc = await Admission.findById(req.params.id);
    if (!doc) return res.status(404).json({ message: 'Admission not found' });

    doc.approvalStatus = 'Rejected';
    doc.approvalNote = req.body?.note || '';
    doc.approvedAt = new Date();
    doc.approvedByName = req.user.name;
    await doc.save();

    await User.updateMany({ admissionId: doc._id, role: 'parent' }, { active: false });

    res.json(doc);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.post('/:id/parent-account', async (req, res) => {
  try {
    const admission = await Admission.findById(req.params.id);
    if (!admission) return res.status(404).json({ message: 'Admission not found' });

    const { email, password, name } = req.body || {};
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }
    if (String(password).length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }

    const normalizedEmail = String(email).toLowerCase().trim();
    const existing = await User.findOne({ email: normalizedEmail });
    if (existing) {
      return res.status(409).json({ message: 'This email already has an account' });
    }

    const user = await User.create({
      name: name || `${admission.archerName} (Guardian)`,
      email: normalizedEmail,
      phone: admission.contactNumber,
      password: await bcrypt.hash(String(password), 10),
      role: 'parent',
      active: admission.approvalStatus !== 'Rejected',
      admissionId: admission._id
    });

    res.status(201).json({
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      active: user.active
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.get('/:id/sessions', async (req, res) => {
  try {
    const sessions = await Session.find({ admission: req.params.id }).sort({ date: -1 }).lean();
    res.json(sessions);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/:id/sessions', async (req, res) => {
  try {
    const admission = await Admission.findById(req.params.id);
    if (!admission) return res.status(404).json({ message: 'Admission not found' });

    const { date, topic, attended, score, notes } = req.body || {};
    if (!date) return res.status(400).json({ message: 'Date is required' });

    const isPresent = attended !== false;
    const session = await Session.create({
      admission: admission._id,
      date: new Date(date),
      topic: topic || '',
      attended: isPresent,
      score: !isPresent
        ? null
        : score === '' || score === null || score === undefined
        ? null
        : Number(score),
      notes: notes || '',
      createdBy: req.user._id,
      createdByName: req.user.name
    });
    res.status(201).json(session);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.delete('/:id/sessions/:sessionId', async (req, res) => {
  try {
    const session = await Session.findOneAndDelete({
      _id: req.params.sessionId,
      admission: req.params.id
    });
    if (!session) return res.status(404).json({ message: 'Session not found' });
    res.json({ message: 'Session deleted' });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.post('/:id/send', async (req, res) => {
  try {
    const admission = await Admission.findById(req.params.id);
    if (!admission) return res.status(404).json({ message: 'Admission not found' });

    const { whatsappNumber, message, pdfBase64, mode } = req.body || {};
    const to = whatsappNumber || admission.contactNumber;
    if (!to) return res.status(400).json({ message: 'A WhatsApp number is required' });

    const caption =
      message ||
      `Hello ${admission.parentName || admission.archerName},\n\n` +
        `Application ${admission.applicationNo} for ${admission.archerName} has been registered at Triumph Archery Academy.\n` +
        `Program: ${admission.program || '-'} | Batch: ${admission.weekendBatch || '-'}\n\n` +
        `Please find the completed admission form attached.\n\n` +
        `AIM · FOCUS · TRIUMPH`;

    const configured = !!(process.env.WHATSAPP_TOKEN && process.env.WHATSAPP_PHONE_NUMBER_ID);

    if (mode === 'cloud-api' || (configured && mode !== 'wa.me')) {
      if (!pdfBase64) {
        return res.status(400).json({ message: 'PDF is required to send through the WhatsApp API' });
      }
      try {
        await sendWhatsAppDocument({
          to,
          caption,
          pdfBuffer: Buffer.from(pdfBase64, 'base64'),
          filename: `${admission.applicationNo}-${admission.archerName}.pdf`
        });
      } catch (err) {
        if (err.code === 'NOT_CONFIGURED') {
          return res.status(503).json({
            message: 'WhatsApp Cloud API keys are not set. Use the WhatsApp link instead.',
            code: 'NOT_CONFIGURED'
          });
        }
        return res.status(502).json({ message: err.message, code: 'API_ERROR' });
      }

      admission.whatsappNumber = to;
      admission.status = 'Sent to WhatsApp';
      admission.sentAt = new Date();
      admission.sendMode = 'cloud-api';
      await admission.save();
      return res.json({ ok: true, mode: 'cloud-api', admission });
    }

    admission.whatsappNumber = to;
    admission.status = 'Sent to WhatsApp';
    admission.sentAt = new Date();
    admission.sendMode = 'wa.me';
    await admission.save();

    res.json({ ok: true, mode: 'wa.me', link: waMeLink(to, caption), admission });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
