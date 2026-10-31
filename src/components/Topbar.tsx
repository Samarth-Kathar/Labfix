import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';

interface TopbarProps {
  setMobileOpen: (open: boolean | ((prev: boolean) => boolean)) => void;
}

export const Topbar: React.FC<TopbarProps> = ({ setMobileOpen }) => {
  const {
    currentUser,
    users,
    currentView,
    setCurrentView,
    theme,
    toggleTheme,
    notifications,
    markNotificationRead,
    markAllNotificationsRead,
    switchUser,
    resetToDemoDefaults,
    setSelectedComplaintCode,
  } = useApp();

  const [notifDropdownOpen, setNotifDropdownOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const notifRef = useRef<HTMLDivElement>(null);
  const userRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifDropdownOpen(false);
      }
      if (userRef.current && !userRef.current.contains(e.target as Node)) {
        setUserDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!currentUser) return null;

  // Filter notifications for current user/role
  const userNotifications = notifications.filter(
    (n) => n.user_id === currentUser.id || (!n.user_id && n.target_role === currentUser.role)
  );
  const unreadCount = userNotifications.filter((n) => n.is_read === 0).length;

  // Compute breadcrumb label
  const getBreadcrumbLabel = () => {
    switch (currentView) {
      case 'overview':
        return 'Control Center / Overview';
      case 'hod-infrastructure':
        return 'Infrastructure / Computing Labs';
      case 'hod-complaints':
        return 'Complaints / Master Registry';
      case 'hod-health':
        return 'Workstations / Health Matrix';
      case 'hod-technicians':
        return 'Operations / Technician Monitoring';
      case 'hod-reports':
        return 'Analytics / Failure Reports';
      case 'hod-audit-logs':
        return 'Security / Audit Logs';
      case 'hod-sms-logs':
        return 'Alerts / SMS Dispatch Logs';
      case 'faculty-dashboard':
        return 'Faculty Portal / Dashboard';
      case 'faculty-report':
        return 'Faculty Portal / Report Fault';
      case 'faculty-complaints':
        return 'Faculty Portal / My Complaints';
      case 'tech-dashboard':
        return 'Technician Workspace / Complaint Queue';
      case 'tech-sms':
        return 'Technician / SMS Alerts & Phone';
      case 'tech-history':
        return 'Technician / Repair History';
      case 'inventory-list':
        return 'Hardware Asset Ops / Workstations';
      case 'inventory-add':
        return 'Hardware Asset Ops / Add Workstation';
      case 'inventory-detail':
        return 'Hardware Asset Ops / Workstation Details';
      case 'inventory-replace':
        return 'Hardware Asset Ops / Hardware Replacement';
      default:
        return 'Dashboard';
    }
  };

  return (
    <header className="topbar">
      <div className="topbar-left">
        <button
          className="icon-btn"
          style={{ display: 'none' }}
          onClick={() => setMobileOpen((prev) => !prev)}
          title="Toggle Navigation"
        >
          <i className="fa-solid fa-bars"></i>
        </button>
        <div className="page-breadcrumb">
          <span>LabFix</span> / <strong>{getBreadcrumbLabel()}</strong>
        </div>
      </div>

      <div className="topbar-right">
        {/* Quick Demo Switcher */}
        <div className="dropdown-wrapper" ref={userRef}>
          <button
            className="btn btn-outline btn-sm d-flex align-items-center gap-2"
            onClick={() => setUserDropdownOpen((prev) => !prev)}
            title="Switch Demo Persona"
            style={{ fontSize: '0.825rem' }}
          >
            <i className="fa-solid fa-users-gear text-primary"></i>
            <span>Switch User: <strong>{currentUser.username}</strong></span>
            <i className="fa-solid fa-chevron-down" style={{ fontSize: '0.7rem' }}></i>
          </button>

          {userDropdownOpen && (
            <div
              className="dropdown-menu"
              style={{ display: 'block', width: '280px', right: 0 }}
            >
              <div
                style={{
                  padding: '0.5rem 1rem',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  color: 'var(--text-muted)',
                  letterSpacing: '0.05em',
                  borderBottom: '1px solid var(--border-color)',
                }}
              >
                Switch Campus Account
              </div>
              <div style={{ maxHeight: '280px', overflowY: 'auto' }}>
                {users.map((u) => (
                  <div
                    key={u.id}
                    onClick={() => {
                      switchUser(u.id);
                      setUserDropdownOpen(false);
                    }}
                    style={{
                      padding: '0.65rem 1rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.75rem',
                      cursor: 'pointer',
                      background: u.id === currentUser.id ? 'var(--bg-surface-secondary)' : 'transparent',
                      transition: 'background var(--transition-fast)',
                    }}
                    onMouseEnter={(e) => {
                      if (u.id !== currentUser.id) {
                        e.currentTarget.style.backgroundColor = 'var(--bg-surface-secondary)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (u.id !== currentUser.id) {
                        e.currentTarget.style.backgroundColor = 'transparent';
                      }
                    }}
                  >
                    <div
                      style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '50%',
                        background:
                          u.role === 'hod'
                            ? '#2563eb'
                            : u.role === 'faculty'
                            ? '#06b6d4'
                            : '#10b981',
                        color: '#fff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 700,
                        fontSize: '0.8rem',
                      }}
                    >
                      {u.full_name.charAt(0)}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div
                        style={{
                          fontWeight: 600,
                          fontSize: '0.85rem',
                          color: 'var(--text-main)',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                        }}
                      >
                        {u.full_name}
                      </div>
                      <div style={{ fontSize: '0.725rem', color: 'var(--text-muted)' }}>
                        {u.role.toUpperCase()} • {u.department}
                      </div>
                    </div>
                    {u.id === currentUser.id && (
                      <i className="fa-solid fa-check text-primary" style={{ fontSize: '0.85rem' }}></i>
                    )}
                  </div>
                ))}
              </div>
              <div style={{ padding: '0.5rem 1rem', borderTop: '1px solid var(--border-color)' }}>
                <button
                  className="btn btn-outline btn-sm w-100"
                  onClick={() => {
                    if (window.confirm('Reset all computers and records back to initial college state?')) {
                      resetToDemoDefaults();
                      setUserDropdownOpen(false);
                    }
                  }}
                  style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}
                  title="Restore clean 360 computer database"
                >
                  <i className="fa-solid fa-rotate-left me-1"></i> Reset Demo Data
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Dark / Light Mode Toggle */}
        <button
          className="icon-btn"
          onClick={toggleTheme}
          title={theme === 'dark' ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
        >
          <i className={theme === 'dark' ? 'fa-solid fa-sun text-warning' : 'fa-solid fa-moon'}></i>
        </button>

        {/* Notification Bell & Dropdown */}
        <div className="dropdown-wrapper" ref={notifRef}>
          <button
            className="icon-btn"
            onClick={() => setNotifDropdownOpen((prev) => !prev)}
            title="System Notifications"
          >
            <i className="fa-solid fa-bell"></i>
            {unreadCount > 0 && <span className="notification-badge"></span>}
          </button>

          {notifDropdownOpen && (
            <div
              className="dropdown-menu"
              style={{ display: 'block', width: '360px', right: 0 }}
            >
              <div
                className="p-3 border-bottom d-flex align-items-center justify-content-between"
                style={{ borderBottom: '1px solid var(--border-color)' }}
              >
                <div className="fw-bold" style={{ fontSize: '0.95rem' }}>
                  Notifications ({unreadCount} unread)
                </div>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllNotificationsRead}
                    className="btn btn-outline btn-sm"
                    style={{ fontSize: '0.725rem', padding: '0.2rem 0.5rem' }}
                  >
                    Mark all read
                  </button>
                )}
              </div>

              <div style={{ maxHeight: '340px', overflowY: 'auto' }}>
                {userNotifications.length === 0 ? (
                  <div className="p-4 text-center text-muted" style={{ fontSize: '0.85rem' }}>
                    <i className="fa-solid fa-bell-slash mb-2" style={{ fontSize: '1.5rem', opacity: 0.5 }}></i>
                    <div>No notifications yet.</div>
                  </div>
                ) : (
                  userNotifications.slice(0, 15).map((n) => (
                    <div
                      key={n.id}
                      onClick={() => {
                        markNotificationRead(n.id);
                        if (n.link) {
                          setCurrentView(n.link);
                          setNotifDropdownOpen(false);
                        }
                      }}
                      style={{
                        padding: '0.75rem 1rem',
                        borderBottom: '1px solid var(--border-color)',
                        cursor: 'pointer',
                        backgroundColor: n.is_read === 0 ? 'var(--primary-light)' : 'transparent',
                        transition: 'background var(--transition-fast)',
                      }}
                    >
                      <div className="d-flex align-items-center justify-content-between mb-1">
                        <div
                          style={{
                            fontWeight: n.is_read === 0 ? 700 : 600,
                            fontSize: '0.85rem',
                            color: 'var(--text-main)',
                          }}
                        >
                          {n.title}
                        </div>
                        <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                          {n.created_at?.split(' ')[1]?.substring(0, 5) || ''}
                        </span>
                      </div>
                      <div
                        style={{
                          fontSize: '0.8rem',
                          color: 'var(--text-muted)',
                          lineHeight: 1.35,
                        }}
                      >
                        {n.message}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
