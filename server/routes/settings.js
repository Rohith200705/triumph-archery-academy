import { Router } from 'express';
import Setting from '../models/Setting.js';
import { requireAuth, requireAdmin } from '../middleware/auth.js';

const router = Router();
router.use(requireAuth);

const FIELDS = ['academyName', 'motto', 'formTitle', 'footer', 'declarationText'];

router.get('/', async (req, res) => {
  try {
    res.json(await Setting.getForm());
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.put('/', requireAdmin, async (req, res) => {
  try {
    const doc = await Setting.getForm();
    for (const f of FIELDS) {
      if (typeof req.body?.[f] === 'string') doc[f] = req.body[f].trim();
    }
    await doc.save();
    res.json(doc);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

export default router;
