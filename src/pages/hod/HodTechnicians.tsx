import React from 'react';
import { useApp } from '../../context/AppContext';

interface HodTechniciansProps {
  onOpenComplaint: (code: string) => void;
}

export const HodTechnicians: React.FC<HodTechniciansProps> = ({ onOpenComplaint }) => {
  const { users, complaints, smsLogs } = useApp();
  const technicians = users.filter((u) => u.role === 'technician');

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Technician Operations & Monitoring</h1>
          <p className="page-subtitle">
            Workload distribution, repair productivity, and real-world SMS dispatch delivery logs
          </p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(450px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        {technicians.map((tech) => {
          const techComplaints = complaints.filter((c) => c.assigned_technician_id === tech.id);
          const activeComplaints = techComplaints.filter((c) => c.status === 'Accepted' || c.status === 'In Progress');
          const resolvedComplaints = techComplaints.filter((c) => c.status === 'Resolved' || c.status === 'Closed');
          const techSms = smsLogs.filter((s) => s.recipient_user_id === tech.id);

          return (
            <div key={tech.id} className="card">
              <div className="card-header">
                <div className="d-flex align-items-center gap-3">
                  <div
                    className="user-avatar"
                    style={{
                      width: '44px',
                      height: '44px',
                      background: 'linear-gradient(135deg, #10b981 0%, #3a86ff 100%)',
                    }}
                  >
                    {tech.full_name.charAt(0)}
                  </div>
                  <div>
                    <h3 style={{ fontSize: '1.15rem', margin: 0 }}>{tech.full_name}</h3>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      {tech.department} • <i className="fa-solid fa-phone me-1 text-cyan"></i>
                      <strong>{tech.phone}</strong>
                    </div>
                  </div>
                </div>
                <span className="badge badge-success">On Duty</span>
              </div>

              <div className="card-body">
                {/* Metrics */}
                <div className="stats-grid mb-3" style={{ gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem' }}>
                  <div
                    style={{
                      background: 'var(--bg-surface-secondary)',
                      padding: '0.85rem',
                      borderRadius: 'var(--radius-md)',
                      textAlign: 'center',
                    }}
                  >
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 700 }}>
                      ACTIVE REPAIRS
                    </div>
                    <div className="fw-bold" style={{ fontSize: '1.4rem', color: 'var(--warning)' }}>
                      {activeComplaints.length}
                    </div>
                  </div>
                  <div
                    style={{
                      background: 'var(--bg-surface-secondary)',
                      padding: '0.85rem',
                      borderRadius: 'var(--radius-md)',
                      textAlign: 'center',
                    }}
                  >
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 700 }}>
                      RESOLVED JOBS
                    </div>
                    <div className="fw-bold" style={{ fontSize: '1.4rem', color: 'var(--success)' }}>
                      {resolvedComplaints.length}
                    </div>
                  </div>
                  <div
                    style={{
                      background: 'var(--bg-surface-secondary)',
                      padding: '0.85rem',
                      borderRadius: 'var(--radius-md)',
                      textAlign: 'center',
                    }}
                  >
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 700 }}>
                      SMS ALERTS
                    </div>
                    <div className="fw-bold" style={{ fontSize: '1.4rem', color: 'var(--primary)' }}>
                      {techSms.length}
                    </div>
                  </div>
                </div>

                {/* Currently Assigned Tickets */}
                <div style={{ fontSize: '0.825rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                  CURRENT ACTIVE TICKETS
                </div>
                {activeComplaints.length === 0 ? (
                  <div
                    style={{
                      padding: '1rem',
                      background: 'var(--bg-surface-secondary)',
                      borderRadius: 'var(--radius-md)',
                      textAlign: 'center',
                      color: 'var(--text-muted)',
                      fontSize: '0.85rem',
                    }}
                  >
                    No tickets actively assigned. Ready for new queue dispatches.
                  </div>
                ) : (
                  <div className="d-flex flex-column gap-2">
                    {activeComplaints.map((c) => (
                      <div
                        key={c.id}
                        onClick={() => onOpenComplaint(c.complaint_code)}
                        style={{
                          padding: '0.75rem 1rem',
                          background: 'var(--bg-surface-secondary)',
                          border: '1px solid var(--border-color)',
                          borderRadius: 'var(--radius-md)',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                        }}
                      >
                        <div>
                          <div className="fw-bold text-main" style={{ fontSize: '0.875rem' }}>
                            {c.complaint_code} — {c.problem_category}
                          </div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                            {c.lab_code} ({c.pc_number}) • Reported by {c.faculty_name}
                          </div>
                        </div>
                        <span className={`badge status-badge-${c.status.toLowerCase().replace(' ', '-')}`}>
                          {c.status}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
