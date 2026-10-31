import React from 'react';
import { useApp } from '../context/AppContext';
import { Complaint } from '../types';

interface ComplaintDetailModalProps {
  complaintCode: string | null;
  onClose: () => void;
  onOpenResolve?: (complaint: Complaint) => void;
}

export const ComplaintDetailModal: React.FC<ComplaintDetailModalProps> = ({
  complaintCode,
  onClose,
  onOpenResolve,
}) => {
  const {
    complaints,
    computers,
    maintenanceRecords,
    currentUser,
    acceptComplaint,
    startRepair,
    setSelectedComputerId,
    setCurrentView,
  } = useApp();

  if (!complaintCode) return null;

  const complaint = complaints.find((c) => c.complaint_code === complaintCode);
  if (!complaint) return null;

  const computer = computers.find((c) => c.id === complaint.computer_id);
  const maintenance = maintenanceRecords.find((m) => m.complaint_id === complaint.id);

  // Stepper calculations
  const steps = [
    { key: 'Pending', label: 'Reported', time: complaint.reported_at },
    { key: 'Accepted', label: 'Accepted', time: complaint.accepted_at },
    { key: 'In Progress', label: 'In Repair', time: complaint.accepted_at ? 'Active' : null },
    { key: 'Resolved', label: 'Resolved', time: complaint.resolved_at },
  ];

  const getStepStatus = (stepKey: string) => {
    const order = ['Pending', 'Accepted', 'In Progress', 'Resolved'];
    const currentIdx = order.indexOf(complaint.status);
    const stepIdx = order.indexOf(stepKey);

    if (currentIdx > stepIdx || complaint.status === 'Resolved' || complaint.status === 'Closed') {
      return 'completed';
    }
    if (currentIdx === stepIdx) {
      return 'active';
    }
    return 'upcoming';
  };

  return (
    <div className="modal-overlay active" onClick={onClose}>
      <div
        className="modal-card"
        style={{ maxWidth: '780px' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="card-header">
          <div className="card-title">
            <i className="fa-solid fa-ticket-simple text-primary"></i>
            <span>Ticket Details: {complaint.complaint_code}</span>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              fontSize: '1.2rem',
              color: 'var(--text-muted)',
            }}
          >
            <i className="fa-solid fa-xmark"></i>
          </button>
        </div>

        <div className="card-body">
          {/* Header Row: Badges & Workstation */}
          <div className="d-flex align-items-center justify-content-between flex-wrap gap-2 mb-4">
            <div className="d-flex align-items-center gap-2">
              <span className={`badge priority-${complaint.priority.toLowerCase()}`}>
                {complaint.priority} Priority
              </span>
              <span
                className={`badge status-badge-${complaint.status.toLowerCase().replace(' ', '-')}`}
              >
                {complaint.status}
              </span>
              <span className="badge badge-secondary">{complaint.problem_category}</span>
            </div>

            {computer && (
              <button
                className="btn btn-outline btn-sm"
                onClick={() => {
                  setSelectedComputerId(computer.id);
                  setCurrentView('inventory-detail');
                  onClose();
                }}
              >
                <i className="fa-solid fa-desktop me-1"></i>
                {computer.computer_id_code}
              </button>
            )}
          </div>

          {/* Stepper Timeline */}
          <div className="timeline-stepper">
            {steps.map((st, idx) => {
              const statusClass = getStepStatus(st.key);
              return (
                <div key={st.key} className={`timeline-step ${statusClass}`}>
                  <div className="step-indicator">
                    {statusClass === 'completed' ? (
                      <i className="fa-solid fa-check"></i>
                    ) : (
                      idx + 1
                    )}
                  </div>
                  <div className="step-title">{st.label}</div>
                  <div className="step-time">
                    {st.time ? st.time.split(' ')[0] : '—'}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Workstation Location Card */}
          <div
            style={{
              background: 'var(--bg-surface-secondary)',
              padding: '1rem 1.25rem',
              borderRadius: 'var(--radius-md)',
              marginBottom: '1.5rem',
              border: '1px solid var(--border-color)',
            }}
          >
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>
              Workstation Location & Hardware
            </div>
            <div className="fw-bold" style={{ fontSize: '1rem', color: 'var(--text-main)' }}>
              {complaint.wing_name} → {complaint.floor_name} → {complaint.lab_name} ({complaint.lab_code}) →{' '}
              <span style={{ color: 'var(--primary)' }}>{complaint.pc_number}</span>
            </div>
            {computer && (
              <div
                style={{
                  fontSize: '0.825rem',
                  color: 'var(--text-muted)',
                  marginTop: '0.35rem',
                  display: 'flex',
                  gap: '1rem',
                  flexWrap: 'wrap',
                }}
              >
                <span><strong>Brand:</strong> {computer.brand} {computer.model}</span>
                <span><strong>Serial:</strong> {computer.serial_number}</span>
                <span><strong>CPU:</strong> {computer.processor}</span>
                <span><strong>RAM:</strong> {computer.ram}</span>
              </div>
            )}
          </div>

          {/* Problem Description */}
          <div className="mb-4">
            <h4 className="mb-2" style={{ fontSize: '1rem' }}>Problem Description</h4>
            <div
              style={{
                background: 'var(--bg-surface)',
                border: '1px solid var(--border-color)',
                padding: '1rem 1.25rem',
                borderRadius: 'var(--radius-md)',
                color: 'var(--text-main)',
                lineHeight: 1.6,
                fontSize: '0.925rem',
              }}
            >
              {complaint.description}
            </div>
          </div>

          {/* Reporter & Technician Info */}
          <div className="stats-grid" style={{ marginBottom: '1.5rem' }}>
            <div
              style={{
                background: 'var(--bg-surface)',
                border: '1px solid var(--border-color)',
                padding: '1rem',
                borderRadius: 'var(--radius-md)',
              }}
            >
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                REPORTED BY (FACULTY)
              </div>
              <div className="fw-bold text-main mt-1">{complaint.faculty_name}</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                {complaint.faculty_email || 'Department Faculty'}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                <i className="fa-regular fa-clock me-1"></i> {complaint.reported_at}
              </div>
            </div>

            <div
              style={{
                background: 'var(--bg-surface)',
                border: '1px solid var(--border-color)',
                padding: '1rem',
                borderRadius: 'var(--radius-md)',
              }}
            >
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                ASSIGNED TECHNICIAN
              </div>
              <div className="fw-bold text-main mt-1">
                {complaint.technician_name || 'Unassigned (Awaiting pickup)'}
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                {complaint.technician_name ? 'IT Maintenance Operations' : 'Open in Queue'}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                <i className="fa-regular fa-clock me-1"></i>{' '}
                {complaint.accepted_at ? `Claimed at ${complaint.accepted_at}` : 'Pending assignment'}
              </div>
            </div>
          </div>

          {/* Maintenance Record Section (if resolved) */}
          {maintenance && (
            <div
              style={{
                background: 'rgba(16, 185, 129, 0.05)',
                border: '1px solid rgba(16, 185, 129, 0.25)',
                borderRadius: 'var(--radius-md)',
                padding: '1.25rem',
                marginBottom: '1.5rem',
              }}
            >
              <div className="d-flex align-items-center justify-content-between mb-3">
                <div className="fw-bold text-success d-flex align-items-center gap-2">
                  <i className="fa-solid fa-circle-check"></i>
                  <span>Maintenance & Resolution Report</span>
                </div>
                <span className="badge badge-success">
                  <i className="fa-solid fa-shield-halved me-1"></i> Verified
                </span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '0.75rem' }}>
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>DIAGNOSIS</div>
                  <div style={{ fontSize: '0.875rem', color: 'var(--text-main)', marginTop: '0.2rem' }}>
                    {maintenance.diagnosis}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>ACTION TAKEN</div>
                  <div style={{ fontSize: '0.875rem', color: 'var(--text-main)', marginTop: '0.2rem' }}>
                    {maintenance.action_taken}
                  </div>
                </div>
              </div>

              <div className="mb-2">
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>PARTS REPLACED</div>
                <div style={{ fontSize: '0.875rem', color: 'var(--text-main)', marginTop: '0.2rem' }}>
                  {maintenance.parts_replaced}
                </div>
              </div>

              <div className="mb-2">
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>SOLUTION DESCRIPTION</div>
                <div style={{ fontSize: '0.875rem', color: 'var(--text-main)', marginTop: '0.2rem' }}>
                  {maintenance.solution_description}
                </div>
              </div>

              {maintenance.repair_notes && (
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>REPAIR NOTES</div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                    {maintenance.repair_notes}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Quick Actions for Technician */}
          {currentUser && currentUser.role === 'technician' && (
            <div className="d-flex justify-content-end gap-2 mt-4 pt-3 border-top" style={{ borderTop: '1px solid var(--border-color)' }}>
              {complaint.status === 'Pending' && (
                <button
                  className="btn btn-primary"
                  onClick={() => {
                    acceptComplaint(complaint.id);
                  }}
                >
                  <i className="fa-solid fa-hand-holding-hand me-1"></i> Accept & Claim Ticket
                </button>
              )}

              {complaint.status === 'Accepted' && (
                <button
                  className="btn btn-warning"
                  style={{ color: '#fff' }}
                  onClick={() => {
                    startRepair(complaint.id);
                  }}
                >
                  <i className="fa-solid fa-wrench me-1"></i> Start Hardware Repair
                </button>
              )}

              {complaint.status === 'In Progress' && onOpenResolve && (
                <button
                  className="btn btn-success"
                  onClick={() => {
                    onOpenResolve(complaint);
                  }}
                >
                  <i className="fa-solid fa-check-double me-1"></i> Complete & Resolve Repair
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
