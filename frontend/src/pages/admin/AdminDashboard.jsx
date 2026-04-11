import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./AdminDashboard.css";
import AdminOverviewTab from "./components/AdminOverviewTab";
import AdminUsersTab from "./components/AdminUsersTab";
import AdminTimetableTab from "./components/AdminTimetableTab";
import AdminEventsTab from "./components/AdminEventsTab";
import api from "../../utils/api";

const Icons = {
  Logo: () => (
    <svg width="28" height="28" viewBox="0 0 36 36" fill="none">
      <rect width="36" height="36" rx="9" fill="#2563EB" />
      <path
        d="M18 8L8 13.5V22.5L18 28L28 22.5V13.5L18 8Z"
        stroke="white"
        strokeWidth="2"
        fill="none"
      />
    </svg>
  ),
  Dashboard: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="3" width="7" height="7" />
      <rect x="14" y="3" width="7" height="7" />
      <rect x="14" y="14" width="7" height="7" />
      <rect x="3" y="14" width="7" height="7" />
    </svg>
  ),
  Users: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M17 21v-2a4 4 0 00-3-3.87M9 3a4 4 0 100 8 4 4 0 000-8zM3 21v-2a4 4 0 014-4h4a4 4 0 014 4v2" />
    </svg>
  ),
  Timetable: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <path d="M16 2v4M8 2v4M3 10h18" />
    </svg>
  ),
  Events: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M19 4H5a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2V6a2 2 0 00-2-2z" />
      <path d="M16 2v4M8 2v4M3 10h18" />
      <path d="M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01M16 18h.01" />
    </svg>
  ),
  Logout: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" />
    </svg>
  ),
};

const ADMIN_ACTIVE_TAB_KEY = "adminDashboardActiveTab";
const ADMIN_TABS = ["overview", "users", "timetable", "events"];

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [active, setActive] = useState(() => {
    const storedTab = localStorage.getItem(ADMIN_ACTIVE_TAB_KEY);
    return ADMIN_TABS.includes(storedTab) ? storedTab : "overview";
  });
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState({ students: [], faculty: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
    if (active === "users") {
      fetchUsers();
    }
  }, [active]);

  useEffect(() => {
    localStorage.setItem(ADMIN_ACTIVE_TAB_KEY, active);
  }, [active]);

  const fetchStats = async () => {
    try {
      const res = await api.get("/admin/stats");
      setStats(res.data.stats);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await api.get("/admin/users");
      setUsers({ students: res.data.students, faculty: res.data.faculty });
    } catch (err) {
      console.error(err);
    }
  };

  const deleteUser = async (role, id) => {
    if (!window.confirm(`Are you sure you want to delete ${id}?`)) {
      return;
    }

    try {
      await api.delete(`/admin/users/${role}/${id}`);
      fetchUsers();
      fetchStats();
    } catch (err) {
      alert("Error deleting user");
    }
  };

  const logout = () => {
    localStorage.clear();
    navigate("/login");
  };

  if (loading && !stats) {
    return (
      <div className="ad-loader">
        <div className="fd-spinner" />
      </div>
    );
  }

  return (
    <div className="ad-root">
      <aside className="ad-sidebar">
        <div className="ad-brand">
          <Icons.Logo />
          <span>Campus Admin</span>
        </div>
        <nav className="ad-nav">
          <button
            className={`ad-nav-item ${active === "overview" ? "ad-nav-active" : ""}`}
            onClick={() => setActive("overview")}
          >
            <Icons.Dashboard /> Overview
          </button>
          <button
            className={`ad-nav-item ${active === "users" ? "ad-nav-active" : ""}`}
            onClick={() => setActive("users")}
          >
            <Icons.Users /> Manage Users
          </button>
          <button
            className={`ad-nav-item ${active === "timetable" ? "ad-nav-active" : ""}`}
            onClick={() => setActive("timetable")}
          >
            <Icons.Timetable /> Timetable
          </button>
          <button
            className={`ad-nav-item ${active === "events" ? "ad-nav-active" : ""}`}
            onClick={() => setActive("events")}
          >
            <Icons.Events /> Events
          </button>
        </nav>
        <button className="ad-logout" onClick={logout}>
          <Icons.Logout /> Logout
        </button>
      </aside>

      <main className="ad-main">
        <header className="ad-header">
          <h1 className="ad-page-title">
            {active.charAt(0).toUpperCase() + active.slice(1)}
          </h1>
        </header>

        {active === "overview" && stats && <AdminOverviewTab stats={stats} Icons={Icons} />}
        {active === "users" && <AdminUsersTab users={users} deleteUser={deleteUser} />}
        {active === "timetable" && <AdminTimetableTab />}
        {active === "events" && <AdminEventsTab />}
      </main>
    </div>
  );
}
