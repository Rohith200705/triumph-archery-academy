import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api.js';

function fmtDate(d) {
  return new Date(d).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });
}

function fmtTime(d) {
  return new Date(d).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
}

function isToday(d) {
  const x = new Date(d);
  const n = new Date();
  return (
    x.getFullYear() === n.getFullYear() &&
    x.getMonth() === n.getMonth() &&
    x.getDate() === n.getDate()
  );
}

function ProgressionChart({ sessions }) {
  const scored = sessions.filter((s) => s.attended && s.score != null);
  if (scored.length < 2) {
    return (
      <div className="empty" style={{ padding: 24 }}>
        Not enough scored sessions yet to show progression. At least 2 scored classes are needed.
      </div>
    );
  }
  const max = Math.max(...scored.map((s) => s.score), 1);
  return (
    <div className="progression">
      {scored.map((s, i) => (
        <div className="prog-col" key={s._id || i}>
          <div className="prog-score">{s.score}</div>
          <div className="prog-track">
            <div className="prog-fill" style={{ height: `${(s.score / max) * 100}%` }} />
          </div>
          <div className="prog-date">{fmtDate(s.date).replace(/ \d{4}$/, '')}</div>
        </div>
      ))}
    </div>
  );
}

export default function Ward() {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api('/ward/overview')
      .then(setData)
      .catch((e) => setError(e.message));
  }, []);

  if (error) return <div className="alert err">{error}</div>;
  if (!data) return <div className="empty">Loading portal…</div>;

  const { admission, today, sessions, stats } = data;
  const pending = admission.approvalStatus === 'Pending';
  const rejected = admission.approvalStatus === 'Rejected';

  return (
    <div className="ward-page">
      <header className="home-nav">
        <div className="home-brand">
          <div className="brand-mark">TA</div>
          <div>
            <div className="brand-name">Triumph Archery Academy</div>
            <div className="brand-tag">Parent Portal</div>
          </div>
        </div>
        <nav>
          <Link to="/" className="btn ghost sm">Home</Link>
        </nav>
      </header>

      <div className="public-form-wrap">
        <div className="page-head">
          <div>
            <h1>{admission.archerName}</h1>
            <p>
              {admission.applicationNo} · {admission.program || 'Program not set'} ·{' '}
              {admission.weekendBatch || 'Batch not set'}
            </p>
          </div>
          <div>
            <span
              className={
                'badge ' +
                (rejected ? 'maroon' : pending ? 'amber' : 'green')
              }
              style={{ fontSize: 13, padding: '6px 14px' }}
            >
              {rejected ? 'Admission Rejected' : pending ? 'Admission Pending Approval' : 'Admission Approved'}
            </span>
          </div>
        </div>

        {pending && (
          <div className="alert ok" style={{ marginBottom: 18 }}>
            <b>Your admission is pending approval.</b> The academy officials are reviewing your
            application — you’ll be able to see full class activity, scores and progression once
            approved. For queries call 9600019334.
          </div>
        )}
        {rejected && (
          <div className="alert err" style={{ marginBottom: 18 }}>
            <b>Your admission was not approved.</b>{' '}
            {admission.approvalNote ? `Reason: ${admission.approvalNote}. ` : ''}
            Please contact the academy on 9600019334 for details.
          </div>
        )}

        {admission.photo && (
          <img
            src={admission.photo}
            alt={admission.archerName}
            style={{
              width: 96,
              height: 120,
              objectFit: 'cover',
              border: '3px solid var(--gold)',
              borderRadius: 6,
              display: 'block',
              marginBottom: 18
            }}
          />
        )}

        <div className="stats" style={{ marginBottom: 18 }}>
          <div className="stat">
            <div className="label">Today’s Class</div>
            <div className="value" style={{ fontSize: 17 }}>
              {today.length
                ? today.map((s) => (s.attended ? 'Present' : 'Absent')).join(', ')
                : 'No class scheduled'}
            </div>
          </div>
          <div className="stat green">
            <div className="label">Sessions Attended</div>
            <div className="value">{stats.attended}/{stats.totalSessions}</div>
          </div>
          <div className="stat gold">
            <div className="label">Average Score</div>
            <div className="value">{stats.avgScore ?? '—'}</div>
          </div>
          <div className="stat amber">
            <div className="label">Best Score</div>
            <div className="value">{stats.bestScore ?? '—'}</div>
          </div>
        </div>

        <div className="card" style={{ marginBottom: 18 }}>
          <div className="section-title">
            <span className="num">1</span>
            <h3>TODAY’S CLASS</h3>
            <span className="rule" />
          </div>
          {today.length === 0 ? (
            <div className="empty">No class recorded today ({fmtDate(new Date())}).</div>
          ) : (
            today.map((s) => (
              <div className="session-row" key={s._id}>
                <div className="session-when">
                  <b>{fmtTime(s.date)}</b>
                  <div style={{ color: 'var(--muted)', fontSize: 12.5 }}>{fmtDate(s.date)}</div>
                </div>
                <div className="session-main">
                  <b>{s.topic || 'Training session'}</b>
                  {s.notes && <div style={{ color: 'var(--muted)', fontSize: 13 }}>{s.notes}</div>}
                </div>
                <div className="session-meta">
                  <span className={'badge ' + (s.attended ? 'green' : 'maroon')}>
                    {s.attended ? 'Present' : 'Absent'}
                  </span>
                  {s.score != null && <span className="badge gold">Score: {s.score}</span>}
                </div>
              </div>
            ))
          )}
        </div>

        <div className="card" style={{ marginBottom: 18 }}>
          <div className="section-title">
            <span className="num">2</span>
            <h3>PROGRESSION</h3>
            <span className="rule" />
          </div>
          <ProgressionChart sessions={sessions} />
        </div>

        <div className="card" style={{ marginBottom: 18 }}>
          <div className="section-title">
            <span className="num">3</span>
            <h3>COMPLETE REPORT</h3>
            <span className="rule" />
          </div>

          <div className="detail-grid" style={{ marginBottom: 18 }}>
            <div className="detail-item"><div className="k">Archer</div><div className="v">{admission.archerName}</div></div>
            <div className="detail-item"><div className="k">Age / DOB</div><div className="v">{admission.dob || '—'}</div></div>
            <div className="detail-item"><div className="k">Gender</div><div className="v">{admission.gender || '—'}</div></div>
            <div className="detail-item"><div className="k">Program</div><div className="v">{admission.program || '—'}</div></div>
            <div className="detail-item"><div className="k">Age Group</div><div className="v">{admission.ageGroup || '—'}</div></div>
            <div className="detail-item"><div className="k">Batch</div><div className="v">{admission.weekendBatch || '—'}</div></div>
            <div className="detail-item"><div className="k">Parent / Guardian</div><div className="v">{admission.parentName || '—'}</div></div>
            <div className="detail-item"><div className="k">Contact</div><div className="v">{admission.contactNumber}</div></div>
            <div className="detail-item"><div className="k">Previous Experience</div><div className="v">{admission.previousExperience || '—'}{admission.experienceDetail ? ` · ${admission.experienceDetail}` : ''}</div></div>
            <div className="detail-item"><div className="k">Medical</div><div className="v">{admission.medicalConditions || '—'}</div></div>
          </div>

          <h3 style={{ fontSize: 15, marginTop: 0 }}>Class History ({sessions.length} sessions)</h3>
          {sessions.length === 0 ? (
            <div className="empty">No classes recorded yet.</div>
          ) : (
            <div className="table-wrap">
              <table className="data">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Topic</th>
                    <th>Attendance</th>
                    <th>Score</th>
                    <th>Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {[...sessions].reverse().map((s) => (
                    <tr key={s._id}>
                      <td style={{ whiteSpace: 'nowrap' }}>{fmtDate(s.date)}{isToday(s.date) ? ' · today' : ''}</td>
                      <td>{s.topic || '—'}</td>
                      <td>
                        <span className={'badge ' + (s.attended ? 'green' : 'maroon')}>
                          {s.attended ? 'Present' : 'Absent'}
                        </span>
                      </td>
                      <td>{s.score != null ? s.score : '—'}</td>
                      <td>{s.notes || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <p style={{ color: 'var(--muted)', fontSize: 13, textAlign: 'center' }}>
          Questions? Call the academy: 9600019334 &amp; 9094070501 · Parvathi Nagar, Old Perungalathur
        </p>
      </div>
    </div>
  );
}
