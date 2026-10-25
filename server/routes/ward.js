import { Router } from 'express';
import Admission from '../models/Admission.js';
import Session from '../models/Session.js';

const router = Router();

function startOfDay(d) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

router.get('/overview', async (req, res) => {
  try {
    if (req.user.role !== 'parent') {
      return res.status(403).json({ message: 'Parent access required' });
    }

    const admission = await Admission.findById(req.user.admissionId).lean();
    if (!admission) {
      return res.status(404).json({ message: 'No admission linked to this account' });
    }

    const today = startOfDay(new Date());

    const [sessions, todaySessions, scoreAgg] = await Promise.all([
      Session.find({ admission: admission._id }).sort({ date: 1 }).lean(),
      Session.find({ admission: admission._id, date: { $gte: today } }).sort({ date: -1 }).lean(),
      Session.aggregate([
        {
          $match: {
            admission: admission._id,
            attended: true,
            score: { $ne: null }
          }
        },
        {
          $group: {
            _id: null,
            avg: { $avg: '$score' },
            best: { $max: '$score' },
            count: { $sum: 1 }
          }
        }
      ])
    ]);

    const attended = sessions.filter((s) => s.attended).length;
    const missed = sessions.length - attended;

    res.json({
      admission,
      approvalStatus: admission.approvalStatus,
      today: todaySessions,
      sessions,
      progression: sessions.map((s) => ({
        date: s.date,
        topic: s.topic,
        attended: s.attended,
        score: s.score
      })),
      stats: {
        totalSessions: sessions.length,
        attended,
        missed,
        avgScore: scoreAgg[0] ? Math.round(scoreAgg[0].avg * 10) / 10 : null,
        bestScore: scoreAgg[0] ? scoreAgg[0].best : null,
        scoredSessions: scoreAgg[0] ? scoreAgg[0].count : 0
      }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
