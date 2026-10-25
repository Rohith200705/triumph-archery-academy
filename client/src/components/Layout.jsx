import { NavLink } from 'react-router-dom';

export default function Layout({ user, onLogout, children }) {
  return (
    <div className="shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-mark">TA</div>
          <div>
            <div className="brand-name">Triumph Archery</div>
            <div className="brand-tag">Aim · Focus · Triumph</div>
          </div>
        </div>

        <NavLink to="/dashboard" className={({ isActive }) => 'nav-link' + (isActive ? ' active' : '')} end>
          <span>▦</span> Dashboard
        </NavLink>
        <NavLink
          to="/new"
          className={({ isActive }) => 'nav-link' + (isActive ? ' active' : '')}
        >
          <span>✚</span> New Admission
        </NavLink>
        <NavLink
          to="/reports"
          className={({ isActive }) => 'nav-link' + (isActive ? ' active' : '')}
        >
          <span>☰</span> Admission Reports
        </NavLink>
        {user?.role === 'admin' && (
          <NavLink
            to="/settings"
            className={({ isActive }) => 'nav-link' + (isActive ? ' active' : '')}
          >
            <span>✎</span> Form Content
          </NavLink>
        )}

        <div className="sidebar-foot">
          <div className="who">{user?.name || 'Official'}</div>
          <div style={{ color: '#d9c7a5' }}>{user?.email}</div>
          <button className="btn ghost sm" style={{ color: '#f3e7d5', borderColor: 'rgba(255,255,255,.4)' }} onClick={onLogout}>
            Log out
          </button>
        </div>
      </aside>

      <main className="main">{children}</main>
    </div>
  );
}
