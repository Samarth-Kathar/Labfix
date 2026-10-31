import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';

interface HodComplaintsProps {
  onOpenComplaint: (code: string) => void;
}

export const HodComplaints: React.FC<HodComplaintsProps> = ({ onOpenComplaint }) => {
  const { complaints, wings } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [wingFilter, setWingFilter] = useState('');

  const filtered = complaints.filter((c) => {
    if (statusFilter && c.status !== statusFilter) return false;
    if (priorityFilter && c.priority !== priorityFilter) return false;
    if (wingFilter && c.wing_name !== wingFilter) return false;
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      const matchCode = c.complaint_code.toLowerCase().includes(q);
      const matchDesc = c.description.toLowerCase().includes(q);
      const matchComp = (c.computer_id_code || '').toLowerCase().includes(q);
      const matchFac = (c.faculty_name || '').toLowerCase().includes(q);
      const matchLab = (c.lab_code || '').toLowerCase().includes(q);
      if (!matchCode && !matchDesc && !matchComp && !matchFac && !matchLab) return false;
    }
    return true;
  });

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Hardware Complaint Master Registry</h1>
          <p className="page-subtitle">
            Centralized ticket logging, real-time diagnostic lifecycle, and resolution monitoring
          </p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="filter-bar">
        <div style={{ flex: 1, minWidth: '220px' }}>
          <input
            type="text"
            className="form-control"
            placeholder="Search Ticket ID, Workstation, Lab, Faculty, or description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div style={{ minWidth: '140px' }}>
          <select
            className="form-select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">All Statuses</option>
            <option value="Pending">Pending</option>
            <option value="Accepted">Accepted</option>
            <option value="In Progress">In Progress</option>
            <option value="Resolved">Resolved</option>
          </select>
        </div>

        <div style={{ minWidth: '140px' }}>
          <select
            className="form-select"
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
          >
            <option value="">All Priorities</option>
            <option value="Critical">Critical</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>
        </div>

        <div style={{ minWidth: '130px' }}>
          <select
            className="form-select"
            value={wingFilter}
            onChange={(e) => setWingFilter(e.target.value)}
          >
            <option value="">All Wings</option>
            {wings.map((w) => (
              <option key={w.id} value={w.name}>
                {w.name}
              </option>
            ))}
          </select>
        </div>

        {(searchTerm || statusFilter || priorityFilter || wingFilter) && (
          <button
            className="btn btn-outline"
            onClick={() => {
              setSearchTerm('');
              setStatusFilter('');
              setPriorityFilter('');
              setWingFilter('');
            }}
            title="Reset Filters"
          >
            <i className="fa-solid fa-rotate-left"></i>
          </button>
        )}
      </div>

      {/* Table Card */}
      <div className="card">
        <div className="card-header">
          <div className="card-title">
            <i className="fa-solid fa-ticket-simple text-primary me-2"></i> All Fault Complaints
          </div>
          <span className="badge badge-secondary">{filtered.length} Tickets Found</span>
        </div>

        <div className="card-body p-0">
          {filtered.length === 0 ? (
            <div className="p-5 text-center text-muted">
              <i className="fa-solid fa-folder-open mb-2" style={{ fontSize: '2.5rem', opacity: 0.5 }}></i>
              <h4>No Complaints Found</h4>
              <p>No records match the current filter criteria.</p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table">
                <thead>
                  <tr>
                    <th>Ticket Code</th>
                    <th>Priority</th>
                    <th>Workstation & Location</th>
                    <th>Problem Category</th>
                    <th>Reporter</th>
                    <th>Assigned Tech</th>
                    <th>Status</th>
                    <th>Reported Date</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((c) => (
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
                      <td>
                        <div className="fw-medium text-main">{c.problem_category}</div>
                        <div className="text-muted" style={{ fontSize: '0.75rem', maxWidth: '240px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {c.description}
                        </div>
                      </td>
                      <td>
                        <div className="fw-medium">{c.faculty_name}</div>
                        <div className="text-muted" style={{ fontSize: '0.75rem' }}>{c.faculty_email}</div>
                      </td>
                      <td>
                        {c.technician_name ? (
                          <span className="badge badge-info">{c.technician_name}</span>
                        ) : (
                          <span className="badge badge-warning">Unassigned</span>
                        )}
                      </td>
                      <td>
                        <span className={`badge status-badge-${c.status.toLowerCase().replace(' ', '-')}`}>
                          {c.status}
                        </span>
                      </td>
                      <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        {c.reported_at.split(' ')[0]}
                      </td>
                      <td>
                        <button
                          className="btn btn-outline btn-sm"
                          onClick={() => onOpenComplaint(c.complaint_code)}
                        >
                          <i className="fa-solid fa-eye me-1"></i> Details
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
