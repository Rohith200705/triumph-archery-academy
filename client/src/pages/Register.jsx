import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api, setSession } from '../api.js';
import PhotoCapture from '../components/PhotoCapture.jsx';
import { useSettings } from '../lib/settings.js';

const EMPTY = {
  archerName: '',
  dob: '',
  gender: '',
  photo: '',
  parentName: '',
  contactNumber: '',
  alternateContact: '',
  email: '',
  addressLine1: '',
  addressLine2: '',
  program: '',
  ageGroup: '',
  ageGroupOther: '',
  weekendBatch: '',
  previousExperience: '',
  experienceDetail: '',
  medicalConditions: '',
  emergencyContactName: '',
  emergencyContactNumber: '',
  declarationAgreed: false,
  signatureDate: '',
  password: ''
};

const PROGRAMS = ['Beginner', 'Intermediate', 'Advanced', 'Competitive'];
const AGE_GROUPS = ['Kid (6-12 years)', 'Youth (12-18 years)', 'Adult (18+ years)', 'Other'];
const BATCHES = ['Morning (Friday, Saturday, Sunday)', 'Evening (Friday, Saturday, Sunday)'];

export default function Register({ onLogin }) {
  const nav = useNavigate();
  const settings = useSettings();
  const [form, setForm] = useState(EMPTY);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(null);

  const set = (k) => (e) =>
    setForm({ ...form, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value });
  const setVal = (k, v) => setForm({ ...form, [k]: v });

  async function submit(e) {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      if (!form.declarationAgreed) throw new Error('Please accept the declaration to continue');
      if (!form.email || !form.password) throw new Error('Email and password are required for your parent login');
      if (form.password.length < 6) throw new Error('Password must be at least 6 characters');

      const payload = { ...form };
      if (form.ageGroup === 'Other') payload.ageGroup = 'Under 6';
      delete payload.password;

      const data = await api('/registrations/register', {
        method: 'POST',
        body: { ...payload, password: form.password }
      });
      setSession(data.token, data.user);
      setDone(data.admission);
      onLogin(data.user);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  if (done) {
    return (
      <div className="auth">
        <div className="auth-card" style={{ textAlign: 'center' }}>
          <h1>Registration Submitted!</h1>
          <div className="tagline">Aim · Focus · Triumph</div>
          <div className="alert ok" style={{ textAlign: 'left' }}>
            Your application <b>{done.applicationNo}</b> has been submitted and is{' '}
            <b>pending approval</b> by the academy officials. You will be able to view your ward’s
            classes, scores and progress once the admission is approved.
          </div>
          <p style={{ color: 'var(--muted)', fontSize: 14 }}>
            A parent login has been created for <b>{form.email}</b>. You are now signed in.
          </p>
          <Link to="/ward" className="btn gold" style={{ display: 'inline-block', marginTop: 8 }}>
            Go to Parent Portal →
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="public-page">
      <header className="home-nav">
        <div className="home-brand">
          <div className="brand-mark">TA</div>
          <div>
            <div className="brand-name">Triumph Archery Academy</div>
            <div className="brand-tag">Aim · Focus · Triumph</div>
          </div>
        </div>
        <nav>
          <Link to="/" className="btn ghost sm">← Home</Link>
          <Link to="/login" className="btn gold sm">Login</Link>
        </nav>
      </header>

      <div className="public-form-wrap">
        <div className="page-head">
          <div>
            <h1>Admission Registration</h1>
            <p>Fill the form below. After submitting you get a parent login to track your ward’s progress.</p>
          </div>
        </div>

        {error && <div className="alert err">{error}</div>}

        <form className="card" onSubmit={submit}>
          <div className="section-title">
            <span className="num">1</span>
            <h3>ARCHER DETAILS</h3>
            <span className="rule" />
          </div>

          <div className="form-grid">
            <div className="field full">
              <label>Photo</label>
              <PhotoCapture value={form.photo} onChange={(url) => setVal('photo', url)} />
            </div>
            <div className="field">
              <label>Archer Name *</label>
              <input value={form.archerName} onChange={set('archerName')} placeholder="Full name" required />
            </div>
            <div className="field">
              <label>Age / Date of Birth</label>
              <input
                value={form.dob}
                onChange={set('dob')}
                placeholder="e.g. 12 years / 2014-05-12"
                onFocus={(e) => (e.target.type = 'date')}
                onBlur={(e) => {
                  if (!e.target.value) e.target.type = 'text';
                }}
                type="text"
              />
            </div>
            <div className="field">
              <label>Gender</label>
              <div className="checks" style={{ paddingTop: 6 }}>
                {['Male', 'Female', 'Other'].map((g) => (
                  <label className="check" key={g}>
                    <input
                      type="radio"
                      name="gender"
                      checked={form.gender === g}
                      onChange={() => setVal('gender', g)}
                    />
                    {g}
                  </label>
                ))}
              </div>
            </div>
            <div className="field">
              <label>Parent / Guardian Name</label>
              <input value={form.parentName} onChange={set('parentName')} />
            </div>
            <div className="field">
              <label>Contact Number (WhatsApp) *</label>
              <input value={form.contactNumber} onChange={set('contactNumber')} placeholder="10-digit mobile" required />
            </div>
            <div className="field">
              <label>Alternate Contact</label>
              <input value={form.alternateContact} onChange={set('alternateContact')} />
            </div>
            <div className="field full">
              <label>Address – Line 1</label>
              <input value={form.addressLine1} onChange={set('addressLine1')} />
            </div>
            <div className="field full">
              <label>Address – Line 2</label>
              <input value={form.addressLine2} onChange={set('addressLine2')} />
            </div>
          </div>

          <div className="section-title">
            <span className="num">2</span>
            <h3>PROGRAM DETAILS</h3>
            <span className="rule" />
          </div>

          <div className="form-grid">
            <div className="field">
              <label>Program Applying For</label>
              <div className="checks">
                {PROGRAMS.map((p) => (
                  <label className="check" key={p}>
                    <input
                      type="radio"
                      name="program"
                      checked={form.program === p}
                      onChange={() => setVal('program', p)}
                    />
                    {p}
                  </label>
                ))}
              </div>
            </div>
            <div className="field">
              <label>Age Group</label>
              <div className="checks">
                {AGE_GROUPS.map((p) => (
                  <label className="check" key={p}>
                    <input
                      type="radio"
                      name="ageGroup"
                      checked={form.ageGroup === p}
                      onChange={() => setVal('ageGroup', p)}
                    />
                    {p}
                  </label>
                ))}
              </div>
              {form.ageGroup === 'Other' && (
                <input
                  style={{ marginTop: 8 }}
                  value={form.ageGroupOther}
                  onChange={set('ageGroupOther')}
                  placeholder="Please specify age / category"
                />
              )}
            </div>
            <div className="field full">
              <label>Preferred Weekend Batch</label>
              <div className="checks">
                {BATCHES.map((p) => (
                  <label className="check" key={p}>
                    <input
                      type="radio"
                      name="weekendBatch"
                      checked={form.weekendBatch === p}
                      onChange={() => setVal('weekendBatch', p)}
                    />
                    {p}
                  </label>
                ))}
              </div>
            </div>
          </div>

          <div className="section-title">
            <span className="num">3</span>
            <h3>EXPERIENCE &amp; HEALTH</h3>
            <span className="rule" />
          </div>

          <div className="form-grid">
            <div className="field full">
              <label>Previous Archery Experience (if yes, please detail)</label>
              <div className="checks">
                {['Yes', 'No'].map((p) => (
                  <label className="check" key={p}>
                    <input
                      type="radio"
                      name="previousExperience"
                      checked={form.previousExperience === p}
                      onChange={() => setVal('previousExperience', p)}
                    />
                    {p}
                  </label>
                ))}
                <input
                  style={{ flex: 1, minWidth: 220 }}
                  value={form.experienceDetail}
                  onChange={set('experienceDetail')}
                  placeholder="Details (years, club, level…)"
                />
              </div>
            </div>
            <div className="field full">
              <label>Medical Conditions / Allergies</label>
              <textarea value={form.medicalConditions} onChange={set('medicalConditions')} />
            </div>
            <div className="field">
              <label>Emergency Contact – Name</label>
              <input value={form.emergencyContactName} onChange={set('emergencyContactName')} />
            </div>
            <div className="field">
              <label>Emergency Contact – Number</label>
              <input value={form.emergencyContactNumber} onChange={set('emergencyContactNumber')} />
            </div>
          </div>

          <div className="section-title">
            <span className="num">4</span>
            <h3>PARENT LOGIN</h3>
            <span className="rule" />
          </div>

          <p style={{ color: 'var(--muted)', fontSize: 13.5, marginTop: -4 }}>
            These credentials let you (the parent/guardian) log in to view your ward’s daily class,
            scores and progress report.
          </p>

          <div className="form-grid">
            <div className="field">
              <label>Email (for login) *</label>
              <input type="email" value={form.email} onChange={set('email')} required placeholder="parent@example.com" />
            </div>
            <div className="field">
              <label>Password * (min 6 characters)</label>
              <input
                type="password"
                value={form.password}
                onChange={set('password')}
                required
                minLength={6}
                placeholder="••••••••"
              />
            </div>
          </div>

          <div className="section-title">
            <span className="num">5</span>
            <h3>DECLARATION</h3>
            <span className="rule" />
          </div>

          <label className="check" style={{ marginBottom: 18 }}>
            <input
              type="checkbox"
              checked={form.declarationAgreed}
              onChange={set('declarationAgreed')}
            />
            {settings.declarationText}
          </label>

          <div className="btn-row" style={{ marginTop: 24 }}>
            <button className="btn gold" disabled={busy}>
              {busy && <span className="spin" />} Submit Registration
            </button>
            <Link to="/" className="btn ghost">Cancel</Link>
          </div>
        </form>
      </div>
    </div>
  );
}
