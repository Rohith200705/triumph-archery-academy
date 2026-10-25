import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api.js';

function Bars({ title, rows, gold }) {
  const data = (rows || []).filter((r) => r._id);
  const max = Math.max(...data.map((r) => r.count), 1);
  return (
    <div className="card">
      <h3 style={{ marginTop: 0, fontSize: 17 }}>{title}</h3>
      {data.length === 0 && <div className="empty" style={{ padding: 20 }}>No data yet</div>}
      {data.map((r) => (
        <div className="bar-row" key={r._id}>
          <span>{r._id}</span>
          <div className="bar-track">
            <div
              className={'bar-fill' + (gold ? ' gold' : '')}
              style={{ width: `${(r.count / max) * 100}%` }}
            />
          </div>
          <span className="bar-val">{r.count}</span>
        </div>
      ))}
    </div>
  );
}

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api('/admissions/stats')
      .then(setStats)
      .catch((e) => setError(e.message));
  }, []);

  if (error) return <div className="alert err">{error}</div>;
  if (!stats) return <div className="empty">Loading dashboard…</div>;

  return (
    <>
      <div className="page-head">
        <div>
          <h1>Dashboard</h1>
          <p>Admission activity at Triumph Archery Academy.</p>
        </div>
        <div className="btn-row">
          <Link to="/reports" className="btn ghost">View Reports</Link>
          <Link to="/new" className="btn">+ New Admission</Link>
        </div>
      </div>

      <div className="stats">
        <div className="stat">
          <div className="label">Total Admissions</div>
          <div className="value">{stats.total}</div>
        </div>
        <div className="stat amber">
          <div className="label">Pending Approval</div>
          <div className="value">{stats.pendingApproval}</div>
        </div>
        <div className="stat green">
          <div className="label">Sent to WhatsApp</div>
          <div className="value">{stats.sent}</div>
        </div>
        <div className="stat gold">
          <div className="label">This Month</div>
          <div className="value">{stats.thisMonth}</div>
        </div>
      </div>

      <div className="grid-2" style={{ marginBottom: 18 }}>
        <Bars title="By Program" rows={stats.byProgram} />
        <Bars title="By Age Group" rows={stats.byAgeGroup} gold />
      </div>

      <div className="grid-2">
        <Bars title="By Weekend Batch" rows={stats.byBatch} />

        <div className="card">
          <h3 style={{ marginTop: 0, fontSize: 17 }}>Recent Admissions</h3>
          {stats.recent.length === 0 && <div className="empty">No admissions yet.</div>}
          {stats.recent.length > 0 && (
            <div className="table-wrap">
              <table className="data">
                <thead>
                  <tr>
                    <th>App No</th>
                    <th>Archer</th>
                    <th>Program</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.recent.map((r) => (
                    <tr key={r._id}>
                      <td>
                        <Link to={`/reports/${r._id}`}>{r.applicationNo}</Link>
                      </td>
                      <td>{r.archerName}</td>
                      <td>{r.program || '—'}</td>
                      <td>
                        <span className={'badge ' + (r.status === 'Sent to WhatsApp' ? 'green' : 'amber')}>
                          {r.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
