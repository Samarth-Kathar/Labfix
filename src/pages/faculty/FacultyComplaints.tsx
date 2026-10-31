import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';

interface FacultyComplaintsProps {
  onOpenComplaint: (code: string) => void;
}

export const FacultyComplaints: React.FC<FacultyComplaintsProps> = ({ onOpenComplaint }) => {
  const { currentUser, complaints, setCurrentView } = useApp();

  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');

  const myComplaints = complaints.filter((c) => c.faculty_id === currentUser?.id);

  const filtered = myComplaints.filter((c) => {
    if (status && c.status !== status) return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        c.complaint_code.toLowerCase().includes(q) ||
        c.description.toLowerCase().includes(q) ||
        (c.computer_id_code || '').toLowerCase().includes(q) ||
        c.problem_category.toLowerCase().includes(q) ||
        (c.lab_code || '').toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">My Reported Hardware Faults</h1>
          <p className="page-subtitle">
            Lifecycle tracking, diagnostic feedback, and repair verification for tickets you submitted
          </p>
        </div>
        <button
          className="btn btn-primary"
          onClick={() => setCurrentView('faculty-report')}
        >
          <i className="fa-solid fa-plus-circle me-1"></i> Report New Fault
        </button>
      </div>

      <div className="filter-bar">
        <div style={{ flex: 1, minWidth: '220px' }}>
          <input
            type="text"
            className="form-control"
            placeholder="Search ticket code, workstation, category, description..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div style={{ minWidth: '160px' }}>
          <select
            className="form-select"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          >
            <option value="">All Statuses</option>
            <option value="Pending">Pending</option>
            <option value="Accepted">Accepted</option>
            <option value="In Progress">In Progress</option>
            <option value="Resolved">Resolved</option>
          </select>
        </div>
        {(search || status) && (
          <button
            className="btn btn-outline"
            onClick={() => {
              setSearch('');
              setStatus('');
            }}
          >
            <i className="fa-solid fa-rotate-left"></i>
          </button>
        )}
      </div>

      <div className="card">
        <div className="card-header">
          <div className="card-title">
            <i className="fa-solid fa-list-check text-primary me-2"></i> Complaints Record
          </div>
          <span className="badge badge-secondary">{filtered.length} Tickets Found</span>
        </div>
        <div className="card-body p-0">
          {filtered.length === 0 ? (
            <div className="p-5 text-center text-muted">
              <i className="fa-solid fa-ticket-simple mb-2" style={{ fontSize: '2.5rem', opacity: 0.5 }}></i>
              <h4>No Complaints Match</h4>
              <p>Try modifying your search or filter options.</p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table">
                <thead>
                  <tr>
                    <th>Ticket Code</th>
                    <th>Priority</th>
                    <th>Location & PC#</th>
                    <th>Problem Category</th>
                    <th>Status</th>
                    <th>Assigned Tech</th>
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
                        <span className={`badge status-badge-${c.status.toLowerCase().replace(' ', '-')}`}>
                          {c.status}
                        </span>
                      </td>
                      <td>
                        {c.technician_name ? (
                          <span className="badge badge-info">{c.technician_name}</span>
                        ) : (
                          <span className="text-muted" style={{ fontSize: '0.8rem' }}>Unassigned</span>
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
                          <i className="fa-solid fa-eye me-1"></i> Track Ticket
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
