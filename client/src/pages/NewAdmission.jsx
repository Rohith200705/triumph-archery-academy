import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api.js';
import FormDocument from '../components/FormDocument.jsx';
import { generateFormPdf, pdfToBase64 } from '../lib/pdf.js';
import { useSettings } from '../lib/settings.js';
import PhotoCapture from '../components/PhotoCapture.jsx';

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
  weekendBatch: '',
  previousExperience: '',
  experienceDetail: '',
  medicalConditions: '',
  emergencyContactName: '',
  emergencyContactNumber: '',
  declarationAgreed: false,
  signatureDate: ''
};

const PROGRAMS = ['Beginner', 'Intermediate', 'Advanced', 'Competitive'];
const AGE_GROUPS = ['6+ Years', 'Youth', 'Adult', 'All Levels'];
const BATCHES = [
  'Saturday Morning',
  'Saturday Evening',
  'Sunday Morning',
  'Sunday Evening',
  'Both Weekends',
  'Flexible'
];

function Field({ label, full, children }) {
  return <div className={'field' + (full ? ' full' : '')}>{children || <label>{label}</label>}</div>;
}

export default function NewAdmission() {
  const nav = useNavigate();
  const settings = useSettings();
  const [form, setForm] = useState(EMPTY);
  const [saved, setSaved] = useState(null);
  const [preview, setPreview] = useState(false);
  const [error, setError] = useState('');
  const [ok, setOk] = useState('');
  const [busy, setBusy] = useState(false);
  const [waMode, setWaMode] = useState('wa.me');

  useEffect(() => {
    api('/health')
      .then((h) => setWaMode(h.whatsapp || 'wa.me'))
      .catch(() => setWaMode('wa.me'));
  }, []);

  const set = (k) => (e) =>
    setForm({ ...form, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value });
  const setVal = (k, v) => setForm({ ...form, [k]: v });

  async function save(openPreview = true) {
    setError('');
    setOk('');
    setBusy(true);
    try {
      if (saved) {
        const doc = await api(`/admissions/${saved._id}`, { method: 'PUT', body: form });
        setSaved(doc);
        if (openPreview) setPreview(true);
        return doc;
      }
      const doc = await api('/admissions', { method: 'POST', body: form });
      setSaved(doc);
      setOk(`Saved · Application No ${doc.applicationNo}`);
      if (openPreview) setPreview(true);
      return doc;
    } catch (err) {
      setError(err.message);
      return null;
    } finally {
      setBusy(false);
    }
  }

  async function downloadPdf() {
    setError('');
    try {
      await generateFormPdf(form, `${saved?.applicationNo || 'admission'}-${form.archerName || 'form'}`);
      setOk('PDF downloaded.');
    } catch (err) {
      setError(err.message);
    }
  }

  async function sendWhatsApp() {
    setError('');
    setBusy(true);
    try {
      const number = form.whatsappNumber || form.contactNumber;
      if (!number) throw new Error('Contact number is required for WhatsApp');

      if (waMode === 'cloud-api') {
        const b64 = await pdfToBase64();
        await api(`/admissions/${saved._id}/send`, {
          method: 'POST',
          body: { whatsappNumber: number, mode: 'cloud-api', pdfBase64: b64 }
        });
        setOk('Admission form sent to WhatsApp.');
        setPreview(false);
        return;
      }

      await generateFormPdf(
        form,
        `${saved?.applicationNo || 'admission'}-${form.archerName || 'form'}`
      );
      const res = await api(`/admissions/${saved._id}/send`, {
        method: 'POST',
        body: { whatsappNumber: number, mode: 'wa.me' }
      });
      if (res.link) window.open(res.link, '_blank');
      setOk('WhatsApp opened — attach the downloaded PDF and press send.');
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <div className="page-head">
        <div>
          <h1>New Admission</h1>
          <p>Fill the admission form exactly as on the printed A4 form.</p>
        </div>
        <div className="btn-row">
          <button className="btn ghost" onClick={() => nav('/reports')}>
            All Reports
          </button>
          <button className="btn gold" onClick={() => save(true)} disabled={busy}>
            Save &amp; Preview Form
          </button>
        </div>
      </div>

      {error && <div className="alert err">{error}</div>}
      {ok && <div className="alert ok">{ok}</div>}

      <div className="card">
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
            <label>Archer Name</label>
            <input value={form.archerName} onChange={set('archerName')} placeholder="Full name" />
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
            <label>Contact Number (WhatsApp)</label>
            <input value={form.contactNumber} onChange={set('contactNumber')} placeholder="10-digit mobile" />
          </div>
          <div className="field">
            <label>Alternate Contact</label>
            <input value={form.alternateContact} onChange={set('alternateContact')} />
          </div>
          <div className="field full">
            <label>Email</label>
            <input type="email" value={form.email} onChange={set('email')} />
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
          </div>
          <div className="field full">
            <label>Preferred Weekend Batch (Please Specify)</label>
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

        <div className="form-grid">
          <div className="field">
            <label>WhatsApp Number (if different from contact)</label>
            <input
              value={form.whatsappNumber || ''}
              onChange={(e) => setVal('whatsappNumber', e.target.value)}
              placeholder="Defaults to contact number"
            />
          </div>
          <div className="field">
            <label>Signature Date</label>
            <input type="date" value={form.signatureDate} onChange={set('signatureDate')} />
          </div>
        </div>

        <div className="btn-row" style={{ marginTop: 24 }}>
          <button className="btn" onClick={() => save(true)} disabled={busy}>
            {busy && <span className="spin" />} Save &amp; Preview Form
          </button>
          <button className="btn ghost" onClick={() => save(false)} disabled={busy}>
            Save Only
          </button>
          <button
            className="btn danger"
            onClick={() => {
              setForm(EMPTY);
              setSaved(null);
              setError('');
              setOk('');
            }}
          >
            Clear Form
          </button>
        </div>
      </div>

      {preview && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(30,10,15,.62)',
            zIndex: 50,
            overflowY: 'auto',
            padding: '24px 16px'
          }}
        >
          <div style={{ maxWidth: 860, margin: '0 auto' }}>
            <div className="btn-row" style={{ marginBottom: 14, justifyContent: 'space-between' }}>
              <div className="btn-row">
                <button className="btn gold" onClick={downloadPdf}>
                  ⭳ Download PDF
                </button>
                <button className="btn green" onClick={sendWhatsApp} disabled={busy || !saved}>
                  {busy && <span className="spin" />} Send to WhatsApp
                </button>
              </div>
              <button
                className="btn ghost"
                style={{ background: '#fff' }}
                onClick={() => setPreview(false)}
              >
                Close
              </button>
            </div>

            <div
              style={{
                background: '#fff',
                padding: 16,
                borderRadius: 12,
                overflowX: 'auto',
                boxShadow: '0 20px 60px rgba(0,0,0,.4)'
              }}
            >
              <FormDocument data={saved || form} />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
