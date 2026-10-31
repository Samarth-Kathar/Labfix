import React from 'react';
import { useApp } from '../../context/AppContext';

interface HodDashboardProps {
  onOpenComplaint: (code: string) => void;
}

export const HodDashboard: React.FC<HodDashboardProps> = ({ onOpenComplaint }) => {
  const {
    computers,
    complaints,
    users,
    setCurrentView,
    setSelectedComputerId,
  } = useApp();

  const totalComputers = computers.length;
  const workingComputers = computers.filter((c) => c.operational_status === 'Working' || c.operational_status === 'Repaired').length;
  const faultComputers = computers.filter((c) => c.operational_status === 'Fault Reported').length;
  const repairComputers = computers.filter((c) => c.operational_status === 'Under Repair').length;
  const decommissioned = computers.filter((c) => c.operational_status === 'Decommissioned').length;

  const healthScore = totalComputers > 0 ? ((workingComputers / totalComputers) * 100).toFixed(1) : '100';

  const pendingComplaints = complaints.filter((c) => c.status === 'Pending').length;
  const inProgressComplaints = complaints.filter((c) => c.status === 'In Progress' || c.status === 'Accepted').length;
  const resolvedComplaints = complaints.filter((c) => c.status === 'Resolved' || c.status === 'Closed').length;

  const criticalAndHigh = complaints.filter(
    (c) => (c.priority === 'Critical' || c.priority === 'High') && c.status !== 'Resolved' && c.status !== 'Closed'
  );

  const technicians = users.filter((u) => u.role === 'technician');

  // Categories breakdown
  const categoryCounts: Record<string, number> = {};
  complaints.forEach((c) => {
    categoryCounts[c.problem_category] = (categoryCounts[c.problem_category] || 0) + 1;
  });

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Executive Control Center</h1>
          <p className="page-subtitle">
            NMIET Computing Infrastructure • 3 Wings • 18 Laboratories • 360 Workstations
          </p>
        </div>
        <div className="d-flex gap-2">
          <button
            className="btn btn-outline"
            onClick={() => setCurrentView('hod-infrastructure')}
          >
            <i className="fa-solid fa-network-wired me-1"></i> Infrastructure
          </button>
          <button
            className="btn btn-primary"
            onClick={() => setCurrentView('inventory-add')}
          >
            <i className="fa-solid fa-plus-circle me-1"></i> Add Computer
          </button>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="stats-grid">
        <div className="stat-card stat-blue">
          <div>
            <div className="stat-label">Total Workstations</div>
            <div className="stat-value">{totalComputers}</div>
            <div className="stat-subtext">Across 18 Computing Labs</div>
          </div>
          <div className="stat-icon blue">
            <i className="fa-solid fa-desktop"></i>
          </div>
        </div>

        <div className="stat-card stat-green">
          <div>
            <div className="stat-label">Operational & Ready</div>
            <div className="stat-value">{workingComputers}</div>
            <div className="stat-subtext">{healthScore}% Hardware Health</div>
          </div>
          <div className="stat-icon green">
            <i className="fa-solid fa-circle-check"></i>
          </div>
        </div>

        <div className="stat-card stat-red">
          <div>
            <div className="stat-label">Faults Reported</div>
            <div className="stat-value">{faultComputers}</div>
            <div className="stat-subtext">{pendingComplaints} Unassigned Tickets</div>
          </div>
          <div className="stat-icon red">
            <i className="fa-solid fa-triangle-exclamation"></i>
          </div>
        </div>

        <div className="stat-card stat-amber">
          <div>
            <div className="stat-label">Active Repairs</div>
            <div className="stat-value">{repairComputers}</div>
            <div className="stat-subtext">{inProgressComplaints} In Progress with Techs</div>
          </div>
          <div className="stat-icon amber">
            <i className="fa-solid fa-wrench"></i>
          </div>
        </div>
      </div>

      {/* Middle Grid: Operational Distribution & Problem Categories */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        {/* Hardware Status Breakdown */}
        <div className="card">
          <div className="card-header">
            <div className="card-title">
              <i className="fa-solid fa-chart-pie text-primary"></i> Workstation Operational Status
            </div>
            <span className="badge badge-secondary">360 Units</span>
          </div>
          <div className="card-body">
            <div className="mb-3">
              <div className="d-flex justify-content-between mb-1" style={{ fontSize: '0.85rem' }}>
                <span className="fw-semibold">Working / Repaired ({workingComputers})</span>
                <span className="text-muted">{((workingComputers / totalComputers) * 100).toFixed(1)}%</span>
              </div>
              <div style={{ height: '8px', background: 'var(--bg-surface-secondary)', borderRadius: '999px', overflow: 'hidden' }}>
                <div style={{ width: `${(workingComputers / totalComputers) * 100}%`, height: '100%', background: 'var(--success)' }}></div>
              </div>
            </div>

            <div className="mb-3">
              <div className="d-flex justify-content-between mb-1" style={{ fontSize: '0.85rem' }}>
                <span className="fw-semibold">Fault Reported ({faultComputers})</span>
                <span className="text-muted">{((faultComputers / totalComputers) * 100).toFixed(1)}%</span>
              </div>
              <div style={{ height: '8px', background: 'var(--bg-surface-secondary)', borderRadius: '999px', overflow: 'hidden' }}>
                <div style={{ width: `${(faultComputers / totalComputers) * 100}%`, height: '100%', background: 'var(--danger)' }}></div>
              </div>
            </div>

            <div className="mb-3">
              <div className="d-flex justify-content-between mb-1" style={{ fontSize: '0.85rem' }}>
                <span className="fw-semibold">Under Repair ({repairComputers})</span>
                <span className="text-muted">{((repairComputers / totalComputers) * 100).toFixed(1)}%</span>
              </div>
              <div style={{ height: '8px', background: 'var(--bg-surface-secondary)', borderRadius: '999px', overflow: 'hidden' }}>
                <div style={{ width: `${(repairComputers / totalComputers) * 100}%`, height: '100%', background: 'var(--warning)' }}></div>
              </div>
            </div>

            <div>
              <div className="d-flex justify-content-between mb-1" style={{ fontSize: '0.85rem' }}>
                <span className="fw-semibold">Decommissioned ({decommissioned})</span>
                <span className="text-muted">{((decommissioned / totalComputers) * 100).toFixed(1)}%</span>
              </div>
              <div style={{ height: '8px', background: 'var(--bg-surface-secondary)', borderRadius: '999px', overflow: 'hidden' }}>
                <div style={{ width: `${(decommissioned / totalComputers) * 100}%`, height: '100%', background: 'var(--slate-400)' }}></div>
              </div>
            </div>

            <div className="d-flex justify-content-between pt-4 mt-3 border-top" style={{ borderTop: '1px solid var(--border-color)', fontSize: '0.825rem' }}>
              <div><i className="fa-solid fa-circle text-success me-1"></i> Active: <strong>{workingComputers}</strong></div>
              <div><i className="fa-solid fa-circle text-danger me-1"></i> Attention: <strong>{faultComputers}</strong></div>
              <div><i className="fa-solid fa-circle text-warning me-1"></i> Bench: <strong>{repairComputers}</strong></div>
            </div>
          </div>
        </div>

        {/* Complaints Summary by Category */}
        <div className="card">
          <div className="card-header">
            <div className="card-title">
              <i className="fa-solid fa-list-ol text-cyan"></i> Top Problem Categories
            </div>
            <button className="btn btn-outline btn-sm" onClick={() => setCurrentView('hod-reports')}>
              Full Analytics
            </button>
          </div>
          <div className="card-body">
            <div className="d-flex flex-column gap-3">
              {Object.entries(categoryCounts).slice(0, 5).map(([cat, count]) => (
                <div key={cat} className="d-flex align-items-center justify-content-between">
                  <div className="d-flex align-items-center gap-2">
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--primary)' }}></div>
                    <span style={{ fontSize: '0.9rem', fontWeight: 500 }}>{cat}</span>
                  </div>
                  <span className="badge badge-secondary">{count} tickets</span>
                </div>
              ))}
            </div>

            <div
              style={{
                background: 'var(--bg-surface-secondary)',
                padding: '0.85rem 1rem',
                borderRadius: 'var(--radius-md)',
                marginTop: '1.25rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>ALL-TIME RESOLUTION RATE</div>
                <div className="fw-bold" style={{ fontSize: '1.1rem', color: 'var(--success)' }}>
                  {complaints.length > 0 ? ((resolvedComplaints / complaints.length) * 100).toFixed(0) : 100}%
                </div>
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>RESOLVED TICKETS</div>
                <div className="fw-bold" style={{ fontSize: '1.1rem', color: 'var(--text-main)' }}>
                  {resolvedComplaints} / {complaints.length}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Critical & Urgent Alerts Table */}
      <div className="card mb-4">
        <div className="card-header">
          <div className="card-title">
            <i className="fa-solid fa-triangle-exclamation text-danger me-2"></i> Priority Fault Tickets Needing Action
          </div>
          <span className="badge badge-critical">{criticalAndHigh.length} Action Items</span>
        </div>
        <div className="card-body p-0">
          {criticalAndHigh.length === 0 ? (
            <div className="p-4 text-center text-muted">
              <i className="fa-solid fa-circle-check text-success mb-2" style={{ fontSize: '2rem' }}></i>
              <div>No critical or high priority tickets currently pending.</div>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table">
                <thead>
                  <tr>
                    <th>Ticket Code</th>
                    <th>Priority</th>
                    <th>Location & PC</th>
                    <th>Category</th>
                    <th>Faculty Reporter</th>
                    <th>Assigned Tech</th>
                    <th>Reported</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {criticalAndHigh.map((c) => (
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
                          {c.wing_name} • {c.lab_code} ({c.pc_number})
                        </div>
                      </td>
                      <td>{c.problem_category}</td>
                      <td>{c.faculty_name}</td>
                      <td>
                        {c.technician_name ? (
                          <span className="badge badge-info">{c.technician_name}</span>
                        ) : (
                          <span className="badge badge-warning">Unassigned</span>
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
                          <i className="fa-solid fa-eye me-1"></i> Review
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

      {/* Technicians On Duty Panel */}
      <div className="card">
        <div className="card-header">
          <div className="card-title">
            <i className="fa-solid fa-user-gear text-primary me-2"></i> On-Duty Maintenance Technicians
          </div>
          <button className="btn btn-outline btn-sm" onClick={() => setCurrentView('hod-technicians')}>
            Monitor All
          </button>
        </div>
        <div className="card-body">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1rem' }}>
            {technicians.map((tech) => {
              const assigned = complaints.filter(
                (c) => c.assigned_technician_id === tech.id && (c.status === 'Accepted' || c.status === 'In Progress')
              ).length;
              const resolved = complaints.filter(
                (c) => c.assigned_technician_id === tech.id && c.status === 'Resolved'
              ).length;

              return (
                <div
                  key={tech.id}
                  style={{
                    background: 'var(--bg-surface-secondary)',
                    padding: '1.25rem',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-color)',
                  }}
                >
                  <div className="d-flex align-items-center justify-content-between mb-2">
                    <div className="d-flex align-items-center gap-2">
                      <div className="user-avatar" style={{ width: '36px', height: '36px' }}>
                        {tech.full_name.charAt(0)}
                      </div>
                      <div>
                        <div className="fw-bold text-main">{tech.full_name}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{tech.department}</div>
                      </div>
                    </div>
                    <span className="badge badge-success">Active</span>
                  </div>

                  <div className="d-flex justify-content-between mt-3 pt-2" style={{ borderTop: '1px solid var(--border-color)', fontSize: '0.8rem' }}>
                    <div>Active Workload: <strong>{assigned} tickets</strong></div>
                    <div>Resolved: <strong>{resolved}</strong></div>
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.4rem' }}>
                    <i className="fa-solid fa-phone me-1"></i> SMS Alert Phone: <strong>{tech.phone}</strong>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
