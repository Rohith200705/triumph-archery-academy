import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { api } from '../api.js';
import FormDocument from '../components/FormDocument.jsx';
import { generateFormPdf, pdfToBase64 } from '../lib/pdf.js';

function Item({ k, v }) {
  return (
    <div className="detail-item">
      <div className="k">{k}</div>
      <div className="v">{v || '—'}</div>
    </div>
  );
}

export default function AdmissionDetail() {
  const { id } = useParams();
  const nav = useNavigate();
  const [adm, setAdm] = useState(null);
  const [error, setError] = useState('');
  const [ok, setOk] = useState('');
  const [busy, setBusy] = useState(false);
  const [waMode, setWaMode] = useState('wa.me');
  const [waNumber, setWaNumber] = useState('');
  const [preview, setPreview] = useState(false);

  useEffect(() => {
    api(`/admissions/${id}`).then((d) => {
      setAdm(d);
      setWaNumber(d.whatsappNumber || d.contactNumber || '');
    }).catch((e) => setError(e.message));
    api('/health').then((h) => setWaMode(h.whatsapp || 'wa.me')).catch(() => {});
  }, [id]);

  if (error && !adm) return <div className="alert err">{error}</div>;
  if (!adm) return <div className="empty">Loading admission…</div>;

  async function downloadPdf() {
    setError('');
    try {
      await generateFormPdf(adm, `${adm.applicationNo}-${adm.archerName}`);
      setOk('PDF downloaded.');
    } catch (e) {
      setError(e.message);
    }
  }

  async function sendWhatsApp() {
    setError('');
    setOk('');
    setBusy(true);
    try {
      if (waMode === 'cloud-api') {
        const b64 = await pdfToBase64();
        const res = await api(`/admissions/${adm._id}/send`, {
          method: 'POST',
          body: { whatsappNumber: waNumber, mode: 'cloud-api', pdfBase64: b64 }
        });
        setAdm(res.admission);
        setOk('Admission form sent to WhatsApp.');
        return;
      }

      await generateFormPdf(adm, `${adm.applicationNo}-${adm.archerName}`);
      const res = await api(`/admissions/${adm._id}/send`, {
        method: 'POST',
        body: { whatsappNumber: waNumber, mode: 'wa.me' }
      });
      setAdm(res.admission);
      if (res.link) window.open(res.link, '_blank');
      setOk('WhatsApp opened — attach the downloaded PDF and press send.');
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }

  async function remove() {
    if (!window.confirm(`Delete admission ${adm.applicationNo}?`)) return;
    try {
      await api(`/admissions/${adm._id}`, { method: 'DELETE' });
      nav('/reports');
    } catch (e) {
      setError(e.message);
    }
  }

  return (
    <>
      <div className="page-head">
        <div>
          <h1>{adm.applicationNo}</h1>
          <p>
            {adm.archerName} · registered by {adm.createdByName || '—'} on{' '}
            {new Date(adm.createdAt).toLocaleString('en-IN')}
          </p>
        </div>
        <div className="btn-row">
          <Link to="/reports" className="btn ghost">← Reports</Link>
          <button className="btn gold" onClick={() => setPreview(true)}>View Form</button>
          <button className="btn danger" onClick={remove}>Delete</button>
        </div>
      </div>

      {error && <div className="alert err">{error}</div>}
      {ok && <div className="alert ok">{ok}</div>}

      <div className="stats">
        <div className="stat">
          <div className="label">Status</div>
          <div className="value" style={{ fontSize: 21 }}>
            {adm.status}
          </div>
        </div>
        <div className="stat gold">
          <div className="label">Program</div>
          <div className="value" style={{ fontSize: 21 }}>{adm.program || '—'}</div>
        </div>
        <div className="stat green">
          <div className="label">Weekend Batch</div>
          <div className="value" style={{ fontSize: 21 }}>{adm.weekendBatch || '—'}</div>
        </div>
        <div className="stat amber">
          <div className="label">WhatsApp Sent</div>
          <div className="value" style={{ fontSize: 21 }}>
            {adm.sentAt ? new Date(adm.sentAt).toLocaleString('en-IN') : 'Not yet'}
          </div>
        </div>
      </div>

      <div className="card" style={{ marginBottom: 18 }}>
        <div className="section-title">
          <span className="num">1</span>
          <h3>ARCHER DETAILS</h3>
          <span className="rule" />
        </div>
        <div className="detail-grid">
          <Item k="Archer Name" v={adm.archerName} />
          <Item k="Age / Date of Birth" v={adm.dob} />
          <Item k="Gender" v={adm.gender} />
          <Item k="Parent / Guardian" v={adm.parentName} />
          <Item k="Contact Number" v={adm.contactNumber} />
          <Item k="Alternate Contact" v={adm.alternateContact} />
          <Item k="Email" v={adm.email} />
          <Item k="Address" v={[adm.addressLine1, adm.addressLine2].filter(Boolean).join('\n')} />
        </div>
      </div>

      <div className="card" style={{ marginBottom: 18 }}>
        <div className="section-title">
          <span className="num">2</span>
          <h3>PROGRAM &amp; EXPERIENCE</h3>
          <span className="rule" />
        </div>
        <div className="detail-grid">
          <Item k="Program" v={adm.program} />
          <Item k="Age Group" v={adm.ageGroup} />
          <Item k="Weekend Batch" v={adm.weekendBatch} />
          <Item k="Previous Experience" v={adm.previousExperience} />
          <Item k="Experience Detail" v={adm.experienceDetail} />
          <Item k="Medical Conditions / Allergies" v={adm.medicalConditions} />
          <Item k="Emergency Contact – Name" v={adm.emergencyContactName} />
          <Item k="Emergency Contact – Number" v={adm.emergencyContactNumber} />
          <Item k="Declaration Agreed" v={adm.declarationAgreed ? 'Yes' : 'No'} />
          <Item k="Signature Date" v={adm.signatureDate} />
        </div>
      </div>

      <div className="card">
        <div className="section-title">
          <span className="num">3</span>
          <h3>SEND TO PARENT'S WHATSAPP</h3>
          <span className="rule" />
        </div>

        <div className="form-grid" style={{ marginBottom: 16 }}>
          <div className="field">
            <label>WhatsApp Number</label>
            <input value={waNumber} onChange={(e) => setWaNumber(e.target.value)} />
          </div>
          <div className="field">
            <label>Delivery Mode</label>
            <div style={{ paddingTop: 8, fontSize: 14, color: 'var(--muted)' }}>
              {waMode === 'cloud-api'
                ? 'Automatic — WhatsApp Cloud API (Meta, free tier) is configured; the PDF is delivered automatically.'
                : 'Manual — API keys not set, so WhatsApp Web opens with a pre-filled message and the downloaded PDF is attached by you.'}
            </div>
          </div>
        </div>

        <div className="btn-row">
          <button className="btn gold" onClick={downloadPdf}>⭳ Download PDF</button>
          <button className="btn green" onClick={sendWhatsApp} disabled={busy || !waNumber}>
            {busy && <span className="spin" />} Send to WhatsApp
          </button>
        </div>
      </div>

      {!preview && (
        <div style={{ position: 'fixed', left: -10000, top: 0 }} aria-hidden="true">
          <FormDocument data={adm} />
        </div>
      )}

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
            <div className="btn-row" style={{ marginBottom: 14, justifyContent: 'flex-end' }}>
              <button className="btn ghost" style={{ background: '#fff' }} onClick={() => setPreview(false)}>
                Close
              </button>
            </div>
            <div style={{ background: '#fff', padding: 16, borderRadius: 12, overflowX: 'auto' }}>
              <FormDocument data={adm} />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
