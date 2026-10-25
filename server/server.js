import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { connectDB } from './config/db.js';
import authRoutes from './routes/auth.js';
import admissionRoutes from './routes/admissions.js';
import settingsRoutes from './routes/settings.js';
import registrationRoutes from './routes/registration.js';
import wardRoutes from './routes/ward.js';
import { requireAuth } from './middleware/auth.js';

const app = express();

app.use(cors());
app.use(express.json({ limit: '8mb' }));

app.get('/api/health', (req, res) =>
  res.json({
    ok: true,
    whatsapp:
      process.env.WHATSAPP_TOKEN && process.env.WHATSAPP_PHONE_NUMBER_ID
        ? 'cloud-api'
        : 'wa.me'
  })
);

app.use('/api/auth', authRoutes);
app.use('/api/registrations', registrationRoutes);
app.use('/api/admissions', admissionRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/ward', requireAuth, wardRoutes);

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ message: err.message || 'Server error' });
});

const PORT = process.env.PORT || 5000;

connectDB()
  .then(() => {
    app.listen(PORT, () => console.log(`API running on http://localhost:${PORT}`));
  })
  .catch((err) => {
    console.error('MongoDB connection failed:', err.message);
    process.exit(1);
  });
