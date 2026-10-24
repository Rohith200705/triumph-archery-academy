import { useState } from 'react';
import { api, setSession } from '../api.js';

export default function Login({ onLogin }) {
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  async function submit(e) {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      const path = mode === 'login' ? '/auth/login' : '/auth/register';
      const payload =
        mode === 'login'
          ? { email: form.email, password: form.password }
          : form;
      const data = await api(path, { method: 'POST', body: payload });
      setSession(data.token, data.user);
      onLogin(data.user);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="auth">
      <form className="auth-card" onSubmit={submit}>
        <h1>{mode === 'login' ? 'Official Login' : 'Register Official'}</h1>
        <div className="tagline">Aim · Focus · Triumph</div>
        <div className="sub">
          {mode === 'login'
            ? 'Sign in to manage admissions for Triumph Archery Academy.'
            : 'Create an account for academy staff to register admissions.'}
        </div>

        {error && <div className="alert err">{error}</div>}

        {mode === 'register' && (
          <>
            <div className="field">
              <label>Full Name</label>
              <input value={form.name} onChange={set('name')} placeholder="Official name" required />
            </div>
            <div className="field">
              <label>Phone</label>
              <input value={form.phone} onChange={set('phone')} placeholder="Optional" />
            </div>
          </>
        )}

        <div className="field">
          <label>Email</label>
          <input type="email" value={form.email} onChange={set('email')} placeholder="you@academy.in" required />
        </div>

        <div className="field">
          <label>Password</label>
          <input
            type="password"
            value={form.password}
            onChange={set('password')}
            placeholder="••••••••"
            required
            minLength={6}
          />
        </div>

        <button className="btn gold" style={{ width: '100%', justifyContent: 'center' }} disabled={busy}>
          {busy && <span className="spin" />}
          {mode === 'login' ? 'Sign In' : 'Create Account'}
        </button>

        <div className="auth-switch">
          {mode === 'login' ? (
            <>
              New to the portal?{' '}
              <button type="button" onClick={() => { setMode('register'); setError(''); }}>
                Register here
              </button>
            </>
          ) : (
            <>
              Already registered?{' '}
              <button type="button" onClick={() => { setMode('login'); setError(''); }}>
                Sign in
              </button>
            </>
          )}
        </div>
      </form>
    </div>
  );
}
