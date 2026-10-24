import { useEffect, useState } from 'react';
import { getSettings, setSettings, DEFAULT_SETTINGS } from '../lib/settings.js';
import { api } from '../api.js';

export default function Settings({ user }) {
  const [form, setForm] = useState(DEFAULT_SETTINGS);
  const [error, setError] = useState('');
  const [ok, setOk] = useState('');
  const [busy, setBusy] = useState(false);
  const [loaded, setLoaded] = useState(false);

  const isAdmin = user?.role === 'admin';

  useEffect(() => {
    getSettings(true)
      .then((s) => {
        setForm({ ...DEFAULT_SETTINGS, ...s });
        setLoaded(true);
      })
      .catch((e) => {
        setError(e.message);
        setLoaded(true);
      });
  }, []);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  async function save() {
    setError('');
    setOk('');
    setBusy(true);
    try {
      const doc = await api('/settings', { method: 'PUT', body: form });
      setSettings({ ...DEFAULT_SETTINGS, ...doc });
      setForm({ ...DEFAULT_SETTINGS, ...doc });
      setOk('Form content updated. Changes apply to new form previews and PDFs.');
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }

  if (!isAdmin) {
    return (
      <div className="alert err">
        Admin access required. Ask an admin account to edit the form content.
      </div>
    );
  }

  if (!loaded) return <div className="empty">Loading settings…</div>;

  return (
    <>
      <div className="page-head">
        <div>
          <h1>Form Content</h1>
          <p>Edit the text that appears on the admission form / PDF. Admin only.</p>
        </div>
        <div className="btn-row">
          <button
            className="btn ghost"
            onClick={() => setForm(DEFAULT_SETTINGS)}
            disabled={busy}
          >
            Reset Defaults
          </button>
          <button className="btn gold" onClick={save} disabled={busy}>
            {busy && <span className="spin" />} Save Changes
          </button>
        </div>
      </div>

      {error && <div className="alert err">{error}</div>}
      {ok && <div className="alert ok">{ok}</div>}

      <div className="card">
        <div className="section-title">
          <span className="num">1</span>
          <h3>HEADER</h3>
          <span className="rule" />
        </div>
        <div className="form-grid">
          <div className="field">
            <label>Academy Name</label>
            <input value={form.academyName} onChange={set('academyName')} />
          </div>
          <div className="field">
            <label>Motto</label>
            <input value={form.motto} onChange={set('motto')} />
          </div>
          <div className="field full">
            <label>Form Title</label>
            <input value={form.formTitle} onChange={set('formTitle')} />
          </div>
        </div>

        <div className="section-title">
          <span className="num">2</span>
          <h3>DECLARATION</h3>
          <span className="rule" />
        </div>
        <div className="form-grid">
          <div className="field full">
            <label>Declaration Text</label>
            <textarea rows={4} value={form.declarationText} onChange={set('declarationText')} />
          </div>
        </div>

        <div className="section-title">
          <span className="num">3</span>
          <h3>FOOTER</h3>
          <span className="rule" />
        </div>
        <div className="form-grid">
          <div className="field full">
            <label>Footer Line (contact / location)</label>
            <input value={form.footer} onChange={set('footer')} />
          </div>
        </div>
      </div>
    </>
  );
}
