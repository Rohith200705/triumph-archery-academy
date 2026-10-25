import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api.js';

const BLANK = {
  search: '',
  program: '',
  ageGroup: '',
  weekendBatch: '',
  gender: '',
  previousExperience: '',
  status: '',
  approval: '',
  dateFrom: '',
  dateTo: ''
};

export default function Reports() {
  const [filters, setFilters] = useState(BLANK);
  const [data, setData] = useState({ items: [], total: 0, page: 1, pages: 1 });
  const [page, setPage] = useState(1);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const set = (k) => (e) => {
    setFilters({ ...filters, [k]: e.target.value });
    setPage(1);
  };

  useEffect(() => {
    const params = new URLSearchParams({ ...filters, page: String(page), limit: '10' });
    Object.keys(BLANK).forEach((k) => {
      if (!params.get(k)) params.delete(k);
    });
    const t = setTimeout(() => {
      setLoading(true);
      api(`/admissions?${params.toString()}`)
        .then(setData)
        .catch((e) => setError(e.message))
        .finally(() => setLoading(false));
    }, 250);
    return () => clearTimeout(t);
  }, [filters, page]);

  const clear = () => {
    setFilters(BLANK);
    setPage(1);
  };

  return (
    <>
      <div className="page-head">
        <div>
          <h1>Admission Reports</h1>
          <p>
            {data.total} admission{data.total === 1 ? '' : 's'} match the current filters.
          </p>
        </div>
        <Link to="/new" className="btn">+ New Admission</Link>
      </div>

      {error && <div className="alert err">{error}</div>}

      <div className="card" style={{ marginBottom: 18 }}>
        <div className="filters">
          <div className="field" style={{ gridColumn: 'span 2' }}>
            <label>Search</label>
            <input
              value={filters.search}
              onChange={set('search')}
              placeholder="Archer, parent, contact, app no…"
            />
          </div>
          <div className="field">
            <label>Program</label>
            <select value={filters.program} onChange={set('program')}>
              <option value="">All</option>
              {['Beginner', 'Intermediate', 'Advanced', 'Competitive'].map((v) => (
                <option key={v}>{v}</option>
              ))}
            </select>
          </div>
          <div className="field">
            <label>Age Group</label>
            <select value={filters.ageGroup} onChange={set('ageGroup')}>
              <option value="">All</option>
              {['Kid (6-12 years)', 'Youth (12-18 years)', 'Adult (18+ years)', 'Under 6'].map((v) => (
                <option key={v}>{v}</option>
              ))}
            </select>
          </div>
          <div className="field">
            <label>Weekend Batch</label>
            <select value={filters.weekendBatch} onChange={set('weekendBatch')}>
              <option value="">All</option>
              {['Morning (Friday, Saturday, Sunday)', 'Evening (Friday, Saturday, Sunday)'].map((v) => (
                <option key={v}>{v}</option>
              ))}
            </select>
          </div>
          <div className="field">
            <label>Gender</label>
            <select value={filters.gender} onChange={set('gender')}>
              <option value="">All</option>
              {['Male', 'Female', 'Other'].map((v) => (
                <option key={v}>{v}</option>
              ))}
            </select>
          </div>
          <div className="field">
            <label>Experience</label>
            <select value={filters.previousExperience} onChange={set('previousExperience')}>
              <option value="">All</option>
              <option>Yes</option>
              <option>No</option>
            </select>
          </div>
          <div className="field">
            <label>Status</label>
            <select value={filters.status} onChange={set('status')}>
              <option value="">All</option>
              <option>Submitted</option>
              <option>Sent to WhatsApp</option>
            </select>
          </div>
          <div className="field">
            <label>Approval</label>
            <select value={filters.approval} onChange={set('approval')}>
              <option value="">All</option>
              <option>Pending</option>
              <option>Approved</option>
              <option>Rejected</option>
            </select>
          </div>
          <div className="field">
            <label>From Date</label>
            <input type="date" value={filters.dateFrom} onChange={set('dateFrom')} />
          </div>
          <div className="field">
            <label>To Date</label>
            <input type="date" value={filters.dateTo} onChange={set('dateTo')} />
          </div>
          <div className="field">
            <label>&nbsp;</label>
            <button className="btn ghost" onClick={clear}>
              Reset Filters
            </button>
          </div>
        </div>
      </div>

      <div className="card">
        {loading && data.items.length === 0 ? (
          <div className="empty">Loading…</div>
        ) : data.items.length === 0 ? (
          <div className="empty">No admissions match these filters.</div>
        ) : (
          <div className="table-wrap">
            <table className="data">
              <thead>
                <tr>
                  <th>Application No</th>
                  <th>Archer</th>
                  <th>Parent / Contact</th>
                  <th>Program</th>
                  <th>Age Group</th>
                  <th>Batch</th>
                  <th>Experience</th>
                  <th>Status</th>
                  <th>Date</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {data.items.map((r) => (
                  <tr key={r._id}>
                    <td>
                      <Link to={`/reports/${r._id}`} style={{ fontWeight: 700 }}>
                        {r.applicationNo}
                      </Link>
                    </td>
                    <td>
                      <div>{r.archerName}</div>
                      <div style={{ color: 'var(--muted)', fontSize: 12.5 }}>
                        {r.gender || '—'}
                        {r.dob ? ` · ${r.dob}` : ''}
                      </div>
                    </td>
                    <td>
                      <div>{r.parentName || '—'}</div>
                      <div style={{ color: 'var(--muted)', fontSize: 12.5 }}>{r.contactNumber}</div>
                    </td>
                    <td>{r.program || '—'}</td>
                    <td>{r.ageGroup || '—'}</td>
                    <td>{r.weekendBatch || '—'}</td>
                    <td>{r.previousExperience || '—'}</td>
                    <td>
                      <span className={'badge ' + (r.status === 'Sent to WhatsApp' ? 'green' : 'amber')}>
                        {r.status}
                      </span>
                      <br />
                      <span
                        className={
                          'badge ' +
                          (r.approvalStatus === 'Approved'
                            ? 'green'
                            : r.approvalStatus === 'Rejected'
                            ? 'maroon'
                            : 'amber')
                        }
                        style={{ marginTop: 4 }}
                      >
                        {r.approvalStatus || 'Pending'}
                      </span>
                    </td>
                    <td style={{ whiteSpace: 'nowrap' }}>
                      {new Date(r.createdAt).toLocaleDateString('en-IN', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric'
                      })}
                    </td>
                    <td>
                      <Link to={`/reports/${r._id}`} className="btn ghost sm">
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="pager">
          <span>
            Page {data.page} of {data.pages} · {data.total} total
          </span>
          <div className="btn-row">
            <button className="btn ghost sm" disabled={page <= 1} onClick={() => setPage(page - 1)}>
              ← Previous
            </button>
            <button
              className="btn ghost sm"
              disabled={page >= data.pages}
              onClick={() => setPage(page + 1)}
            >
              Next →
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
