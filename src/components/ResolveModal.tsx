import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Complaint, ComputerStatus } from '../types';

interface ResolveModalProps {
  complaint: Complaint | null;
  onClose: () => void;
}

export const ResolveModal: React.FC<ResolveModalProps> = ({ complaint, onClose }) => {
  const { resolveComplaint } = useApp();

  const [diagnosis, setDiagnosis] = useState('');
  const [actionTaken, setActionTaken] = useState('');
  const [partsReplaced, setPartsReplaced] = useState('None');
  const [solutionDescription, setSolutionDescription] = useState('');
  const [repairNotes, setRepairNotes] = useState('');
  const [compStatus, setCompStatus] = useState<ComputerStatus>('Working');
  const [error, setError] = useState('');

  if (!complaint) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!diagnosis.trim() || !actionTaken.trim() || !solutionDescription.trim()) {
      setError('Diagnosis, Action Taken, and Solution Description are required.');
      return;
    }

    const res = resolveComplaint(complaint.id, {
      diagnosis: diagnosis.trim(),
      action_taken: actionTaken.trim(),
      parts_replaced: partsReplaced.trim() || 'None',
      solution_description: solutionDescription.trim(),
      repair_notes: repairNotes.trim(),
      computer_operational_status: compStatus,
    });

    if (res.success) {
      onClose();
    } else {
      setError(res.message);
    }
  };

  return (
    <div className="modal-overlay active" onClick={onClose}>
      <div
        className="modal-card"
        style={{ maxWidth: '640px' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="card-header">
          <div className="card-title">
            <i className="fa-solid fa-screwdriver-wrench text-success"></i>
            <span>Log Maintenance & Resolve {complaint.complaint_code}</span>
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

        <form onSubmit={handleSubmit}>
          <div className="card-body">
            <div
              style={{
                background: 'var(--bg-surface-secondary)',
                padding: '0.85rem 1rem',
                borderRadius: 'var(--radius-md)',
                marginBottom: '1.25rem',
                fontSize: '0.85rem',
              }}
            >
              <div>
                <strong>Workstation:</strong> {complaint.computer_id_code} ({complaint.pc_number}) in{' '}
                {complaint.lab_code}
              </div>
              <div className="text-muted mt-1">
                <strong>Reported Issue:</strong> {complaint.problem_category} — {complaint.description}
              </div>
            </div>

            {error && (
              <div
                style={{
                  background: 'var(--danger-bg)',
                  color: 'var(--danger)',
                  padding: '0.75rem',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '0.85rem',
                  marginBottom: '1rem',
                }}
              >
                {error}
              </div>
            )}

            <div className="form-group">
              <label className="form-label">Technical Diagnosis *</label>
              <input
                type="text"
                className="form-control"
                placeholder="e.g. Bad power supply rail / corrupted RAM module"
                value={diagnosis}
                onChange={(e) => setDiagnosis(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Action Taken *</label>
              <input
                type="text"
                className="form-control"
                placeholder="e.g. Reseated RAM modules, ran memory diagnostic sweep"
                value={actionTaken}
                onChange={(e) => setActionTaken(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Hardware Parts Replaced</label>
              <input
                type="text"
                className="form-control"
                placeholder="None or list component replaced (e.g. 16GB DDR4 RAM stick)"
                value={partsReplaced}
                onChange={(e) => setPartsReplaced(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Solution Description *</label>
              <textarea
                className="form-control"
                rows={3}
                placeholder="Describe resolution outcome and verified tests..."
                value={solutionDescription}
                onChange={(e) => setSolutionDescription(e.target.value)}
                required
              ></textarea>
            </div>

            <div className="form-group">
              <label className="form-label">Internal Repair Notes</label>
              <input
                type="text"
                className="form-control"
                placeholder="Optional benchmark observations or notes"
                value={repairNotes}
                onChange={(e) => setRepairNotes(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Computer Workstation Status After Repair *</label>
              <select
                className="form-select"
                value={compStatus}
                onChange={(e) => setCompStatus(e.target.value as ComputerStatus)}
              >
                <option value="Working">Working (Fully operational and bench tested)</option>
                <option value="Repaired">Repaired (Operational, monitoring required)</option>
              </select>
            </div>
          </div>

          <div className="card-footer d-flex justify-content-end gap-2">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-success">
              <i className="fa-solid fa-circle-check me-1"></i> Submit & Mark Resolved
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
