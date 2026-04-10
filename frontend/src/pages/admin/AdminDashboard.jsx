import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Calendar from "../../components/Calendar/Calendar";
import "./AdminDashboard.css";

const api = axios.create({ baseURL: "http://localhost:5000/api/admin" });
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

const Icons = {
  Logo: () => (
    <svg width="28" height="28" viewBox="0 0 36 36" fill="none">
      <rect width="36" height="36" rx="9" fill="#2563EB"/>
      <path d="M18 8L8 13.5V22.5L18 28L28 22.5V13.5L18 8Z" stroke="white" strokeWidth="2" fill="none"/>
    </svg>
  ),
  Dashboard: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>,
  Users: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 00-3-3.87M9 3a4 4 0 100 8 4 4 0 000-8zM3 21v-2a4 4 0 014-4h4a4 4 0 014 4v2"/></svg>,
  Timetable: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>,
  Events: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 4H5a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2V6a2 2 0 00-2-2z"/><path d="M16 2v4M8 2v4M3 10h18"/><path d="M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01M16 18h.01"/></svg>,
  Logout: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9"/></svg>,
};

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [active, setActive] = useState("overview");
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState({ students: [], faculty: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
    if (active === "users") fetchUsers();
  }, [active]);

  const fetchStats = async () => {
    try {
      const res = await api.get("/stats");
      setStats(res.data.stats);
      setLoading(false);
    } catch (err) { console.error(err); setLoading(false); }
  };

  const fetchUsers = async () => {
    try {
      const res = await api.get("/users");
      setUsers({ students: res.data.students, faculty: res.data.faculty });
    } catch (err) { console.error(err); }
  };

  const deleteUser = async (role, id) => {
    if (!window.confirm(`Are you sure you want to delete ${id}?`)) return;
    try {
      await api.delete(`/users/${role}/${id}`);
      fetchUsers();
      fetchStats();
    } catch (err) { alert("Error deleting user"); }
  };

  const logout = () => { localStorage.clear(); navigate("/login"); };

  if (loading && !stats) return <div className="ad-loader"><div className="fd-spinner" /></div>;

  return (
    <div className="ad-root">
      <aside className="ad-sidebar">
        <div className="ad-brand">
          <Icons.Logo />
          <span>Campus Admin</span>
        </div>
        <nav className="ad-nav">
          <button className={`ad-nav-item ${active === 'overview' ? 'ad-nav-active' : ''}`} onClick={() => setActive('overview')}>
            <Icons.Dashboard /> Overview
          </button>
          <button className={`ad-nav-item ${active === 'users' ? 'ad-nav-active' : ''}`} onClick={() => setActive('users')}>
            <Icons.Users /> Manage Users
          </button>
          <button className={`ad-nav-item ${active === 'timetable' ? 'ad-nav-active' : ''}`} onClick={() => setActive('timetable')}>
            <Icons.Timetable /> Timetable
          </button>
          <button className={`ad-nav-item ${active === 'events' ? 'ad-nav-active' : ''}`} onClick={() => setActive('events')}>
            <Icons.Events /> Events
          </button>
        </nav>
        <button className="ad-logout" onClick={logout}><Icons.Logout /> Logout</button>
      </aside>

      <main className="ad-main">
        <header className="ad-header">
          <h1 className="ad-page-title">
            {active.charAt(0).toUpperCase() + active.slice(1)}
          </h1>
        </header>

        {active === "overview" && stats && (
          <div className="ad-tab">
            <div className="ad-stats-grid">
              <div className="ad-stat-card">
                <div className="ad-stat-icon ad-stat-blue"><Icons.Users /></div>
                <div><p className="ad-stat-val">{stats.studentCount}</p><p className="ad-stat-label">Total Students</p></div>
              </div>
              <div className="ad-stat-card">
                <div className="ad-stat-icon ad-stat-purple"><Icons.Users /></div>
                <div><p className="ad-stat-val">{stats.facultyCount}</p><p className="ad-stat-label">Total Faculty</p></div>
              </div>
              <div className="ad-stat-card">
                <div className="ad-stat-icon ad-stat-orange"><Icons.Dashboard /></div>
                <div><p className="ad-stat-val">{stats.campusAverageAttendance}%</p><p className="ad-stat-label">Campus Attendance</p></div>
              </div>
              <div className="ad-stat-card">
                <div className="ad-stat-icon ad-stat-green"><Icons.Timetable /></div>
                <div><p className="ad-stat-val">{stats.totalAttendanceRecords}</p><p className="ad-stat-label">System Records</p></div>
              </div>
            </div>
            
            <div className="ad-panel">
               <div className="ad-panel-header"><h3>Recent System Activity</h3></div>
               <div style={{padding: '24px', color: '#64748b'}}>No recent critical alerts. System is stable.</div>
            </div>
          </div>
        )}

        {active === "users" && (
          <div className="ad-tab">
            <div className="ad-panel">
              <div className="ad-panel-header">
                <h3>System Users</h3>
                <button className="fd-btn-primary" style={{padding: '8px 16px', fontSize: '0.8rem'}}>+ Add User</button>
              </div>
              <table className="ad-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Name</th>
                    <th>Role</th>
                    <th>Performance / Workload</th>
                    <th>Department / Branch</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.faculty.map(f => (
                    <tr key={f.uniqueId}>
                      <td>{f.uniqueId}</td>
                      <td><strong>{f.name}</strong></td>
                      <td><span className="ad-badge badge-faculty">{f.role}</span></td>
                      <td>
                        <div style={{fontSize: '0.8rem'}}>
                          <strong>{f.classesCount} Classes</strong><br/>
                          <span style={{color: '#64748b'}}>{f.managedClasses || 'No assigned classes'}</span>
                        </div>
                      </td>
                      <td>{f.department}</td>
                      <td>
                        <button className="ad-btn-edit">Edit</button>
                        <button className="ad-btn-delete" onClick={() => deleteUser('faculty', f.uniqueId)}>Delete</button>
                      </td>
                    </tr>
                  ))}
                  {users.students.map(s => (
                    <tr key={s.uniqueId}>
                      <td>{s.uniqueId}</td>
                      <td><strong>{s.name}</strong></td>
                      <td><span className="ad-badge badge-student">student</span></td>
                      <td>
                        <div style={{width: '100px'}}>
                           <div style={{display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '4px'}}>
                             <span>Attendance</span>
                             <span>{s.attendancePercentage}%</span>
                           </div>
                           <div style={{height: '6px', background: '#e2e8f0', borderRadius: '3px', overflow: 'hidden'}}>
                             <div style={{
                               height: '100%', 
                               width: `${s.attendancePercentage}%`, 
                               background: parseFloat(s.attendancePercentage) > 75 ? '#22c55e' : '#ef4444'
                             }} />
                           </div>
                        </div>
                      </td>
                      <td>{s.branch} (Sem {s.semester})</td>
                      <td>
                        <button className="ad-btn-edit">Edit</button>
                        <button className="ad-btn-delete" onClick={() => deleteUser('student', s.uniqueId)}>Delete</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {active === "timetable" && (
           <div className="ad-tab">
             <div className="ad-panel">
                <div className="ad-panel-header"><h3>Academic Timetable</h3></div>
                <div style={{padding: '24px', textAlign: 'center'}} className="fd-empty">
                  Timetable editor coming soon. Use CRUD direct DB for now.
                </div>
             </div>
           </div>
        )}
        {active === "events" && (
           <div className="ad-tab">
             <div className="ad-panel" style={{padding: '40px', display: 'flex', flexDirection: 'column', alignItems: 'center', background: '#f8fafc'}}>
                <h2 style={{marginBottom: '32px', color: '#1e293b'}}>Schedule Academic Event</h2>
                <Calendar onSelect={(val) => alert(`Selected Event Time: ${val}`)} />
                <p style={{marginTop: '24px', color: '#64748b'}}>Use the calendar above to pick a date and time for campus-wide notices.</p>
             </div>
           </div>
        )}
      </main>
    </div>
  );
}
