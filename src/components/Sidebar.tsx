import React from 'react';
import { useApp } from '../context/AppContext';

interface SidebarProps {
  mobileOpen: boolean;
  setMobileOpen: (open: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ mobileOpen, setMobileOpen }) => {
  const { currentUser, currentView, setCurrentView, logout } = useApp();

  const handleNav = (view: string) => {
    setCurrentView(view);
    setMobileOpen(false);
  };

  if (!currentUser) return null;

  return (
    <aside className={`sidebar ${mobileOpen ? 'mobile-open' : ''}`}>
      <div className="sidebar-header">
        <div
          className="brand-logo"
          onClick={() => {
            if (currentUser.role === 'hod') handleNav('overview');
            else if (currentUser.role === 'faculty') handleNav('faculty-dashboard');
            else handleNav('tech-dashboard');
          }}
        >
          <div className="brand-icon">
            <i className="fa-solid fa-microchip"></i>
          </div>
          <div>
            <span>LabFix</span>
            <div
              style={{
                fontSize: '0.65rem',
                color: '#38bdf8',
                fontWeight: 600,
                letterSpacing: '0.05em',
                textTransform: 'uppercase',
              }}
            >
              NMIET Pune
            </div>
          </div>
        </div>
        <span className="role-badge-pill">{currentUser.role}</span>
      </div>

      <div className="sidebar-nav">
        {currentUser.role === 'hod' && (
          <>
            <div className="nav-section-title">Control Center</div>
            <button
              className={`nav-link ${currentView === 'overview' ? 'active' : ''}`}
              onClick={() => handleNav('overview')}
            >
              <i className="fa-solid fa-chart-pie"></i>
              <span>Overview</span>
            </button>
            <button
              className={`nav-link ${currentView === 'hod-infrastructure' ? 'active' : ''}`}
              onClick={() => handleNav('hod-infrastructure')}
            >
              <i className="fa-solid fa-network-wired"></i>
              <span>Infrastructure</span>
            </button>
            <button
              className={`nav-link ${currentView === 'hod-complaints' ? 'active' : ''}`}
              onClick={() => handleNav('hod-complaints')}
            >
              <i className="fa-solid fa-ticket-simple"></i>
              <span>All Complaints</span>
            </button>
            <button
              className={`nav-link ${currentView === 'hod-health' ? 'active' : ''}`}
              onClick={() => handleNav('hod-health')}
            >
              <i className="fa-solid fa-heart-pulse"></i>
              <span>Computer Health</span>
            </button>
            <button
              className={`nav-link ${currentView === 'hod-technicians' ? 'active' : ''}`}
              onClick={() => handleNav('hod-technicians')}
            >
              <i className="fa-solid fa-user-gear"></i>
              <span>Technicians</span>
            </button>
            <button
              className={`nav-link ${currentView === 'hod-reports' ? 'active' : ''}`}
              onClick={() => handleNav('hod-reports')}
            >
              <i className="fa-solid fa-chart-line"></i>
              <span>Reports & Analytics</span>
            </button>

            <div className="nav-section-title">Hardware Asset Ops</div>
            <button
              className={`nav-link ${currentView === 'inventory-list' ? 'active' : ''}`}
              onClick={() => handleNav('inventory-list')}
            >
              <i className="fa-solid fa-boxes-stacked"></i>
              <span>Computer Inventory</span>
            </button>
            <button
              className={`nav-link ${currentView === 'inventory-add' ? 'active' : ''}`}
              onClick={() => handleNav('inventory-add')}
            >
              <i className="fa-solid fa-plus-circle"></i>
              <span>Add Computer</span>
            </button>
            <button
              className={`nav-link ${currentView === 'hod-audit-logs' ? 'active' : ''}`}
              onClick={() => handleNav('hod-audit-logs')}
            >
              <i className="fa-solid fa-clipboard-list"></i>
              <span>Audit Logs</span>
            </button>
            <button
              className={`nav-link ${currentView === 'hod-sms-logs' ? 'active' : ''}`}
              onClick={() => handleNav('hod-sms-logs')}
            >
              <i className="fa-solid fa-comment-sms"></i>
              <span>SMS Dispatch Logs</span>
            </button>
          </>
        )}

        {currentUser.role === 'faculty' && (
          <>
            <div className="nav-section-title">Faculty Portal</div>
            <button
              className={`nav-link ${currentView === 'faculty-dashboard' ? 'active' : ''}`}
              onClick={() => handleNav('faculty-dashboard')}
            >
              <i className="fa-solid fa-house"></i>
              <span>Dashboard</span>
            </button>
            <button
              className={`nav-link ${currentView === 'faculty-report' ? 'active' : ''}`}
              onClick={() => handleNav('faculty-report')}
            >
              <i className="fa-solid fa-triangle-exclamation"></i>
              <span>Report Fault</span>
            </button>
            <button
              className={`nav-link ${currentView === 'faculty-complaints' ? 'active' : ''}`}
              onClick={() => handleNav('faculty-complaints')}
            >
              <i className="fa-solid fa-list-check"></i>
              <span>My Complaints</span>
            </button>
          </>
        )}

        {currentUser.role === 'technician' && (
          <>
            <div className="nav-section-title">Technician Workspace</div>
            <button
              className={`nav-link ${currentView === 'tech-dashboard' ? 'active' : ''}`}
              onClick={() => handleNav('tech-dashboard')}
            >
              <i className="fa-solid fa-screwdriver-wrench"></i>
              <span>Complaint Queue</span>
            </button>
            <button
              className={`nav-link ${currentView === 'tech-sms' ? 'active' : ''}`}
              onClick={() => handleNav('tech-sms')}
            >
              <i className="fa-solid fa-comment-sms"></i>
              <span>SMS Alerts & Phone</span>
            </button>
            <button
              className={`nav-link ${currentView === 'tech-history' ? 'active' : ''}`}
              onClick={() => handleNav('tech-history')}
            >
              <i className="fa-solid fa-clock-rotate-left"></i>
              <span>Repair History</span>
            </button>

            <div className="nav-section-title">Hardware Asset Ops</div>
            <button
              className={`nav-link ${currentView === 'inventory-list' ? 'active' : ''}`}
              onClick={() => handleNav('inventory-list')}
            >
              <i className="fa-solid fa-boxes-stacked"></i>
              <span>Computer Inventory</span>
            </button>
            <button
              className={`nav-link ${currentView === 'inventory-add' ? 'active' : ''}`}
              onClick={() => handleNav('inventory-add')}
            >
              <i className="fa-solid fa-plus-circle"></i>
              <span>Add Computer</span>
            </button>
          </>
        )}
      </div>

      <div className="sidebar-footer">
        <div className="user-profile-mini">
          <div className="user-avatar">{currentUser.full_name.charAt(0)}</div>
          <div className="user-info-text">
            <div className="user-name">{currentUser.full_name}</div>
            <div className="user-role-label">{currentUser.department}</div>
          </div>
          <button
            onClick={logout}
            title="Sign Out"
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--slate-400)',
              fontSize: '1.1rem',
              cursor: 'pointer',
              padding: '4px',
            }}
            className="ms-auto"
          >
            <i className="fa-solid fa-arrow-right-from-bracket"></i>
          </button>
        </div>
      </div>
    </aside>
  );
};
