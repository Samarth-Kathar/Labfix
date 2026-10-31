import React from 'react';
import { useApp } from '../../context/AppContext';

interface FacultyDashboardProps {
  onOpenComplaint: (code: string) => void;
}

export const FacultyDashboard: React.FC<FacultyDashboardProps> = ({ onOpenComplaint }) => {
  const { currentUser, complaints, setCurrentView } = useApp();

  const myComplaints = complaints.filter((c) => c.faculty_id === currentUser?.id);
  const total = myComplaints.length;
  const pending = myComplaints.filter((c) => c.status === 'Pending').length;
  const inProgress = myComplaints.filter((c) => c.status === 'Accepted' || c.status === 'In Progress').length;
  const resolved = myComplaints.filter((c) => c.status === 'Resolved' || c.status === 'Closed').length;

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Faculty Hardware Desk</h1>
          <p className="page-subtitle">
            Welcome, {currentUser?.full_name} • {currentUser?.department}
          </p>
        </div>
        <button
          className="btn btn-primary btn-lg"
          onClick={() => setCurrentView('faculty-report')}
        >
          <i className="fa-solid fa-triangle-exclamation me-1"></i> Report Hardware Fault
        </button>
      </div>

      {/* Stats */}
      <div className="stats-grid mb-4">
        <div className="stat-card stat-blue">
          <div>
            <div className="stat-label">My Reported Faults</div>
            <div className="stat-value">{total}</div>
            <div className="stat-subtext">All-time submitted tickets</div>
          </div>
          <div className="stat-icon blue">
            <i className="fa-solid fa-list-check"></i>
          </div>
        </div>

        <div className="stat-card stat-red">
          <div>
            <div className="stat-label">Pending Acceptance</div>
            <div className="stat-value">{pending}</div>
            <div className="stat-subtext">Awaiting technician pickup</div>
          </div>
          <div className="stat-icon red">
            <i className="fa-solid fa-clock"></i>
          </div>
        </div>

        <div className="stat-card stat-amber">
          <div>
            <div className="stat-label">Under Active Repair</div>
            <div className="stat-value">{inProgress}</div>
            <div className="stat-subtext">Technician attending</div>
          </div>
          <div className="stat-icon amber">
            <i className="fa-solid fa-screwdriver-wrench"></i>
          </div>
        </div>

        <div className="stat-card stat-green">
          <div>
            <div className="stat-label">Resolved & Working</div>
            <div className="stat-value">{resolved}</div>
            <div className="stat-subtext">Successfully overhauled</div>
          </div>
          <div className="stat-icon green">
            <i className="fa-solid fa-circle-check"></i>
          </div>
        </div>
      </div>

      {/* Recent Complaints */}
      <div className="card">
        <div className="card-header">
          <div className="card-title">
            <i className="fa-solid fa-clock-rotate-left text-primary me-2"></i> My Recent Fault Tickets
          </div>
          <button className="btn btn-outline btn-sm" onClick={() => setCurrentView('faculty-complaints')}>
            View All ({total})
          </button>
        </div>
        <div className="card-body p-0">
          {myComplaints.length === 0 ? (
            <div className="p-5 text-center text-muted">
              <i className="fa-solid fa-desktop mb-2" style={{ fontSize: '2.5rem', opacity: 0.5 }}></i>
              <h4>No Complaints Filed</h4>
              <p>You have not reported any faulty hardware workstations yet.</p>
              <button
                className="btn btn-primary mt-3"
                onClick={() => setCurrentView('faculty-report')}
              >
                <i className="fa-solid fa-plus me-1"></i> Report a Problem Now
              </button>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table">
                <thead>
                  <tr>
                    <th>Ticket Code</th>
                    <th>Priority</th>
                    <th>Location & PC#</th>
                    <th>Issue Category</th>
                    <th>Status</th>
                    <th>Technician</th>
                    <th>Reported Date</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {myComplaints.slice(0, 5).map((c) => (
                    <tr key={c.id}>
                      <td style={{ fontFamily: 'JetBrains Mono', fontWeight: 700, color: 'var(--primary)' }}>
                        {c.complaint_code}
                      </td>
                      <td>
                        <span className={`badge priority-${c.priority.toLowerCase()}`}>
                          {c.priority}
                        </span>
                      </td>
                      <td>
                        <div className="fw-semibold text-main">{c.computer_id_code}</div>
                        <div className="text-muted" style={{ fontSize: '0.75rem' }}>
                          {c.lab_code} ({c.pc_number})
                        </div>
                      </td>
                      <td>
                        <div className="fw-medium text-main">{c.problem_category}</div>
                        <div className="text-muted" style={{ fontSize: '0.75rem', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {c.description}
                        </div>
                      </td>
                      <td>
                        <span className={`badge status-badge-${c.status.toLowerCase().replace(' ', '-')}`}>
                          {c.status}
                        </span>
                      </td>
                      <td>
                        {c.technician_name ? (
                          <span className="badge badge-info">{c.technician_name}</span>
                        ) : (
                          <span className="text-muted" style={{ fontSize: '0.8rem' }}>Awaiting tech</span>
                        )}
                      </td>
                      <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        {c.reported_at.split(' ')[0]}
                      </td>
                      <td>
                        <button
                          className="btn btn-outline btn-sm"
                          onClick={() => onOpenComplaint(c.complaint_code)}
                        >
                          <i className="fa-solid fa-eye me-1"></i> Track
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
