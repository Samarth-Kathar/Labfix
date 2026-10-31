import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';

interface InventoryDetailProps {
  onOpenComplaint: (code: string) => void;
}

export const InventoryDetail: React.FC<InventoryDetailProps> = ({ onOpenComplaint }) => {
  const {
    computers,
    selectedComputerId,
    complaints,
    maintenanceRecords,
    decommissionComputer,
    setCurrentView,
  } = useApp();

  const [showDecommissionModal, setShowDecommissionModal] = useState(false);
  const [decommissionReason, setDecommissionReason] = useState('');

  const computer = computers.find((c) => c.id === selectedComputerId) || computers[0];
  if (!computer) return null;

  const compComplaints = complaints.filter((c) => c.computer_id === computer.id);
  const compMaintenance = maintenanceRecords.filter((m) => m.computer_id === computer.id);

  const handleDecommission = (e: React.FormEvent) => {
    e.preventDefault();
    if (!decommissionReason.trim()) return;
    decommissionComputer(computer.id, decommissionReason.trim());
    setShowDecommissionModal(false);
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <div className="d-flex align-items-center gap-3">
            <h1 className="page-title">{computer.computer_id_code}</h1>
            <span
              className={`badge status-badge-${computer.operational_status.toLowerCase().replace(' ', '-')}`}
              style={{ fontSize: '0.85rem' }}
            >
              {computer.operational_status}
            </span>
          </div>
          <p className="page-subtitle">
            {computer.wing_name} → {computer.floor_name} → {computer.lab_name} ({computer.lab_code}) →{' '}
            <strong>{computer.pc_number}</strong>
          </p>
        </div>

        <div className="d-flex gap-2">
          <button
            className="btn btn-outline"
            onClick={() => setCurrentView('inventory-list')}
          >
            <i className="fa-solid fa-arrow-left me-1"></i> Back
          </button>

          {computer.operational_status !== 'Decommissioned' && (
            <>
              <button
                className="btn btn-secondary"
                onClick={() => setCurrentView('inventory-replace')}
              >
                <i className="fa-solid fa-repeat me-1"></i> Replace Hardware
              </button>
              <button
                className="btn btn-outline text-danger"
                onClick={() => setShowDecommissionModal(true)}
              >
                <i className="fa-solid fa-ban me-1"></i> Decommission
              </button>
            </>
          )}
        </div>
      </div>

      {/* Specifications Card */}
      <div className="card mb-4">
        <div className="card-header">
          <div className="card-title">
            <i className="fa-solid fa-microchip text-primary me-2"></i> Hardware Specifications & Identity
          </div>
          <span className="badge badge-secondary">Serial: {computer.serial_number}</span>
        </div>
        <div className="card-body">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.25rem' }}>
            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700 }}>
                BRAND & MODEL
              </div>
              <div className="fw-bold text-main" style={{ fontSize: '1.05rem', marginTop: '0.2rem' }}>
                {computer.brand} {computer.model}
              </div>
            </div>

            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700 }}>
                PROCESSOR (CPU)
              </div>
              <div className="fw-semibold text-main" style={{ fontSize: '0.95rem', marginTop: '0.2rem' }}>
                {computer.processor}
              </div>
            </div>

            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700 }}>
                RAM MEMORY
              </div>
              <div className="fw-semibold text-main" style={{ fontSize: '0.95rem', marginTop: '0.2rem' }}>
                {computer.ram}
              </div>
            </div>

            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700 }}>
                STORAGE
              </div>
              <div className="fw-semibold text-main" style={{ fontSize: '0.95rem', marginTop: '0.2rem' }}>
                {computer.storage}
              </div>
            </div>

            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700 }}>
                OPERATING SYSTEM
              </div>
              <div className="fw-semibold text-main" style={{ fontSize: '0.95rem', marginTop: '0.2rem' }}>
                {computer.os}
              </div>
            </div>

            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700 }}>
                INSTALLATION DATE
              </div>
              <div className="fw-semibold text-main" style={{ fontSize: '0.95rem', marginTop: '0.2rem' }}>
                {computer.installation_date}
              </div>
            </div>
          </div>

          {computer.decommission_reason && (
            <div
              style={{
                marginTop: '1.5rem',
                padding: '1rem',
                background: 'var(--danger-bg)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                borderRadius: 'var(--radius-md)',
                color: 'var(--danger)',
                fontSize: '0.875rem',
              }}
            >
              <strong>Decommissioned on {computer.decommissioned_at}:</strong> {computer.decommission_reason}
            </div>
          )}
        </div>
      </div>

      {/* Maintenance History */}
      <div className="card mb-4">
        <div className="card-header">
          <div className="card-title">
            <i className="fa-solid fa-wrench text-success me-2"></i> Maintenance & Overhaul History
          </div>
          <span className="badge badge-secondary">{compMaintenance.length} Records</span>
        </div>
        <div className="card-body p-0">
          {compMaintenance.length === 0 ? (
            <div className="p-4 text-center text-muted">
              <div>No maintenance records logged for this computer yet.</div>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table">
                <thead>
                  <tr>
                    <th>Ticket Code</th>
                    <th>Technician</th>
                    <th>Diagnosis</th>
                    <th>Action Taken</th>
                    <th>Parts Replaced</th>
                    <th>Completed Date</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {compMaintenance.map((m) => (
                    <tr key={m.id}>
                      <td style={{ fontFamily: 'JetBrains Mono', fontWeight: 700, color: 'var(--primary)' }}>
                        {m.complaint_code}
                      </td>
                      <td>{m.technician_name}</td>
                      <td>{m.diagnosis}</td>
                      <td>{m.action_taken}</td>
                      <td>
                        <span className="badge badge-secondary">{m.parts_replaced}</span>
                      </td>
                      <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{m.completed_at}</td>
                      <td>
                        <span className="badge badge-success">{m.verification_status}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Incident & Complaints History */}
      <div className="card">
        <div className="card-header">
          <div className="card-title">
            <i className="fa-solid fa-ticket-simple text-cyan me-2"></i> Incident & Complaint Tickets
          </div>
          <span className="badge badge-secondary">{compComplaints.length} Filed Tickets</span>
        </div>
        <div className="card-body p-0">
          {compComplaints.length === 0 ? (
            <div className="p-4 text-center text-muted">
              <div>No hardware tickets raised for this workstation. Pristine record!</div>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table">
                <thead>
                  <tr>
                    <th>Code</th>
                    <th>Priority</th>
                    <th>Category</th>
                    <th>Reporter</th>
                    <th>Technician</th>
                    <th>Status</th>
                    <th>Reported Date</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {compComplaints.map((c) => (
                    <tr key={c.id}>
                      <td style={{ fontFamily: 'JetBrains Mono', fontWeight: 700, color: 'var(--primary)' }}>
                        {c.complaint_code}
                      </td>
                      <td>
                        <span className={`badge priority-${c.priority.toLowerCase()}`}>{c.priority}</span>
                      </td>
                      <td>{c.problem_category}</td>
                      <td>{c.faculty_name}</td>
                      <td>{c.technician_name || 'Unassigned'}</td>
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
                          <i className="fa-solid fa-eye me-1"></i> View
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

      {/* Decommission Modal */}
      {showDecommissionModal && (
        <div className="modal-overlay active" onClick={() => setShowDecommissionModal(false)}>
          <div
            className="modal-card"
            style={{ maxWidth: '500px' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="card-header">
              <div className="card-title text-danger">
                <i className="fa-solid fa-triangle-exclamation me-2"></i> Decommission Workstation
              </div>
              <button
                onClick={() => setShowDecommissionModal(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.2rem', color: 'var(--text-muted)' }}
              >
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>
            <form onSubmit={handleDecommission}>
              <div className="card-body">
                <p className="text-muted mb-3" style={{ fontSize: '0.875rem' }}>
                  Are you sure you want to retire <strong>{computer.computer_id_code}</strong>? It will no
                  longer be available for faculty fault reporting.
                </p>
                <div className="form-group">
                  <label className="form-label">Decommission Reason *</label>
                  <textarea
                    className="form-control"
                    rows={3}
                    placeholder="e.g. Beyond economical repair, motherboard burned, obsolete platform..."
                    value={decommissionReason}
                    onChange={(e) => setDecommissionReason(e.target.value)}
                    required
                  ></textarea>
                </div>
              </div>
              <div className="card-footer d-flex justify-content-end gap-2">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowDecommissionModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-danger">
                  Confirm Decommission
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
