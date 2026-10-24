import { Router } from 'express';
import Admission from '../models/Admission.js';
import { requireAuth } from '../middleware/auth.js';
import { sendWhatsAppDocument, waMeLink } from './whatsapp.js';

const router = Router();
router.use(requireAuth);

const ENUMS = {
  program: ['', 'Beginner', 'Intermediate', 'Advanced', 'Competitive'],
  ageGroup: ['', '6+ Years', 'Youth', 'Adult', 'All Levels'],
  weekendBatch: [
    '',
    'Saturday Morning',
    'Saturday Evening',
    'Sunday Morning',
    'Sunday Evening',
    'Both Weekends',
    'Flexible'
  ],
  gender: ['', 'Male', 'Female', 'Other'],
  previousExperience: ['', 'Yes', 'No']
};

async function nextApplicationNo() {
  const year = new Date().getFullYear();
  const prefix = `TAA-${year}-`;
  const last = await Admission.findOne({ applicationNo: new RegExp(`^${prefix}`) })
    .sort({ applicationNo: -1 })
    .select('applicationNo');
  const seq = last ? parseInt(last.applicationNo.replace(prefix, ''), 10) + 1 : 1;
  return `${prefix}${String(seq).padStart(4, '0')}`;
}

router.get('/meta', (req, res) => res.json(ENUMS));

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
      createdBy: req.user._id,
      createdByName: req.user.name
    });
    res.status(201).json(doc);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

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
    const [total, sent, thisMonth, byProgram, byBatch, byAgeGroup, recent] = await Promise.all([
      Admission.countDocuments(),
      Admission.countDocuments({ status: 'Sent to WhatsApp' }),
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

    res.json({ total, sent, pending: total - sent, thisMonth, byProgram, byBatch, byAgeGroup, recent });
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
    res.json({ message: 'Admission deleted' });
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
