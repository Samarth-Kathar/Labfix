import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Complaint } from '../../types';

interface TechDashboardProps {
  onOpenComplaint: (code: string) => void;
  onOpenResolve: (complaint: Complaint) => void;
}

export const TechDashboard: React.FC<TechDashboardProps> = ({
  onOpenComplaint,
  onOpenResolve,
}) => {
  const {
    currentUser,
    complaints,
    smsLogs,
    acceptComplaint,
    startRepair,
    setCurrentView,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'all' | 'pending' | 'mine' | 'inprogress' | 'resolved'>('all');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const myId = currentUser?.id || 4;

  // Overview counters
  const newPending = complaints.filter((c) => c.status === 'Pending').length;
  const myAssigned = complaints.filter(
    (c) => c.assigned_technician_id === myId && c.status === 'Accepted'
  ).length;
  const myInProgress = complaints.filter(
    (c) => c.assigned_technician_id === myId && c.status === 'In Progress'
  ).length;
  const highPriority = complaints.filter(
    (c) => (c.priority === 'High' || c.priority === 'Critical') && c.status !== 'Resolved' && c.status !== 'Closed'
  ).length;

  const todayStr = new Date().toISOString().split('T')[0];
  const resolvedToday = complaints.filter(
    (c) => c.assigned_technician_id === myId && c.status === 'Resolved' && (c.resolved_at || '').startsWith(todayStr)
  ).length;

  // Filter complaints for current tab
  const tabComplaints = complaints.filter((c) => {
    if (activeTab === 'pending' && c.status !== 'Pending') return false;
    if (activeTab === 'mine' && (c.assigned_technician_id !== myId || c.status === 'Resolved')) return false;
    if (activeTab === 'inprogress' && (c.status !== 'In Progress' || c.assigned_technician_id !== myId)) return false;
    if (activeTab === 'resolved' && (c.status !== 'Resolved' || c.assigned_technician_id !== myId)) return false;

    if (priorityFilter && c.priority !== priorityFilter) return false;
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      const match =
        c.complaint_code.toLowerCase().includes(q) ||
        (c.computer_id_code || '').toLowerCase().includes(q) ||
        c.description.toLowerCase().includes(q) ||
        (c.lab_code || '').toLowerCase().includes(q) ||
        (c.faculty_name || '').toLowerCase().includes(q);
      if (!match) return false;
    }
    return true;
  });

  const myRecentSms = smsLogs.filter((s) => s.recipient_user_id === myId).slice(0, 3);

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Technician Maintenance Workspace</h1>
          <p className="page-subtitle">
            Workstation hardware queue • On-duty: {currentUser?.full_name} ({currentUser?.phone})
          </p>
        </div>
        <div className="d-flex gap-2">
          <button className="btn btn-outline" onClick={() => setCurrentView('tech-sms')}>
            <i className="fa-solid fa-comment-sms me-1"></i> SMS Alerts & Phone
          </button>
          <button className="btn btn-outline" onClick={() => setCurrentView('tech-history')}>
            <i className="fa-solid fa-clock-rotate-left me-1"></i> Repair History
          </button>
        </div>
      </div>

      {/* Counters Grid */}
      <div className="stats-grid mb-4">
        <div className="stat-card stat-red">
          <div>
            <div className="stat-label">Pending Claim</div>
            <div className="stat-value">{newPending}</div>
            <div className="stat-subtext">Awaiting technician pickup</div>
          </div>
          <div className="stat-icon red">
            <i className="fa-solid fa-bell"></i>
          </div>
        </div>

        <div className="stat-card stat-amber">
          <div>
            <div className="stat-label">Assigned To Me</div>
            <div className="stat-value">{myAssigned}</div>
            <div className="stat-subtext">Claimed, ready for bench</div>
          </div>
          <div className="stat-icon amber">
            <i className="fa-solid fa-user-check"></i>
          </div>
        </div>

        <div className="stat-card stat-blue">
          <div>
            <div className="stat-label">My In Progress</div>
            <div className="stat-value">{myInProgress}</div>
            <div className="stat-subtext">Active diagnostics</div>
          </div>
          <div className="stat-icon blue">
            <i className="fa-solid fa-screwdriver-wrench"></i>
          </div>
        </div>

        <div className="stat-card stat-cyan">
          <div>
            <div className="stat-label">Critical / High</div>
            <div className="stat-value">{highPriority}</div>
            <div className="stat-subtext">Immediate lab impact</div>
          </div>
          <div className="stat-icon cyan">
            <i className="fa-solid fa-triangle-exclamation"></i>
          </div>
        </div>
      </div>

      {/* Live SMS Feed Banner */}
      {myRecentSms.length > 0 && (
        <div
          className="card mb-4"
          style={{
            background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.08) 0%, rgba(58, 134, 255, 0.08) 100%)',
            borderColor: 'rgba(6, 182, 212, 0.3)',
          }}
        >
          <div className="card-body p-3 d-flex align-items-center justify-content-between flex-wrap gap-2">
            <div className="d-flex align-items-center gap-2">
              <span className="badge badge-primary">
                <i className="fa-solid fa-comment-sms me-1"></i> Recent SMS Dispatch
              </span>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-main)' }}>
                {myRecentSms[0].message}
              </span>
            </div>
            <button
              className="btn btn-outline btn-sm"
              onClick={() => setCurrentView('tech-sms')}
              style={{ fontSize: '0.75rem' }}
            >
              View SMS Center ({smsLogs.filter((s) => s.recipient_user_id === myId).length})
            </button>
          </div>
        </div>
      )}

      {/* Queue Tabs & Filters */}
      <div className="role-tabs mb-3" style={{ gridTemplateColumns: 'repeat(5, 1fr)' }}>
        <div
          className={`role-tab ${activeTab === 'all' ? 'active' : ''}`}
          onClick={() => setActiveTab('all')}
        >
          All Queue ({complaints.length})
        </div>
        <div
          className={`role-tab ${activeTab === 'pending' ? 'active' : ''}`}
          onClick={() => setActiveTab('pending')}
        >
          Pending ({newPending})
        </div>
        <div
          className={`role-tab ${activeTab === 'mine' ? 'active' : ''}`}
          onClick={() => setActiveTab('mine')}
        >
          My Tickets ({myAssigned + myInProgress})
        </div>
        <div
          className={`role-tab ${activeTab === 'inprogress' ? 'active' : ''}`}
          onClick={() => setActiveTab('inprogress')}
        >
          In Progress ({myInProgress})
        </div>
        <div
          className={`role-tab ${activeTab === 'resolved' ? 'active' : ''}`}
          onClick={() => setActiveTab('resolved')}
        >
          My Resolved
        </div>
      </div>

      <div className="filter-bar">
        <div style={{ flex: 1, minWidth: '220px' }}>
          <input
            type="text"
            className="form-control"
            placeholder="Search Ticket, Workstation, Lab, or description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div style={{ minWidth: '150px' }}>
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
        {(searchTerm || priorityFilter) && (
          <button
            className="btn btn-outline"
            onClick={() => {
              setSearchTerm('');
              setPriorityFilter('');
            }}
          >
            <i className="fa-solid fa-rotate-left"></i>
          </button>
        )}
      </div>

      {/* Complaints Table */}
      <div className="card">
        <div className="card-header">
          <div className="card-title">
            <i className="fa-solid fa-screwdriver-wrench text-primary me-2"></i> Active Workstation Repair Queue
          </div>
          <span className="badge badge-secondary">{tabComplaints.length} Work Orders</span>
        </div>
        <div className="card-body p-0">
          {tabComplaints.length === 0 ? (
            <div className="p-5 text-center text-muted">
              <i className="fa-solid fa-check-double mb-2" style={{ fontSize: '2.5rem', opacity: 0.5 }}></i>
              <h4>Queue Is Clear</h4>
              <p>No complaints match the selected tab or filter criteria.</p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table">
                <thead>
                  <tr>
                    <th>Ticket Code</th>
                    <th>Priority</th>
                    <th>Location & PC#</th>
                    <th>Problem Category & Symptom</th>
                    <th>Faculty Reporter</th>
                    <th>Status</th>
                    <th>Reported</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {tabComplaints.map((c) => {
                    const isPending = c.status === 'Pending';
                    const isAcceptedByMe = c.status === 'Accepted' && c.assigned_technician_id === myId;
                    const isInProgressByMe = c.status === 'In Progress' && c.assigned_technician_id === myId;

                    return (
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
                          <div
                            className="text-muted"
                            style={{
                              fontSize: '0.75rem',
                              maxWidth: '220px',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                            }}
                          >
                            {c.description}
                          </div>
                        </td>
                        <td>
                          <div className="fw-medium">{c.faculty_name}</div>
                          <div className="text-muted" style={{ fontSize: '0.725rem' }}>{c.faculty_email}</div>
                        </td>
                        <td>
                          <span className={`badge status-badge-${c.status.toLowerCase().replace(' ', '-')}`}>
                            {c.status}
                          </span>
                          {c.technician_name && (
                            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                              {c.technician_name}
                            </div>
                          )}
                        </td>
                        <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                          {c.reported_at.split(' ')[0]}
                        </td>
                        <td>
                          <div className="d-flex align-items-center gap-1">
                            <button
                              className="btn btn-outline btn-sm"
                              onClick={() => onOpenComplaint(c.complaint_code)}
                              title="View Details"
                            >
                              <i className="fa-solid fa-eye"></i>
                            </button>

                            {isPending && (
                              <button
                                className="btn btn-primary btn-sm"
                                onClick={() => acceptComplaint(c.id)}
                                title="Claim Ticket"
                              >
                                <i className="fa-solid fa-hand-holding-hand me-1"></i> Claim
                              </button>
                            )}

                            {isAcceptedByMe && (
                              <button
                                className="btn btn-warning btn-sm"
                                style={{ color: '#fff' }}
                                onClick={() => startRepair(c.id)}
                                title="Start Diagnostic Repair"
                              >
                                <i className="fa-solid fa-wrench me-1"></i> Start
                              </button>
                            )}

                            {isInProgressByMe && (
                              <button
                                className="btn btn-success btn-sm"
                                onClick={() => onOpenResolve(c)}
                                title="Complete & Resolve"
                              >
                                <i className="fa-solid fa-check me-1"></i> Resolve
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
