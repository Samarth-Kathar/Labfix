import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { ComplaintPriority, Complaint } from '../../types';

interface FacultyReportFaultProps {
  onOpenComplaint: (code: string) => void;
}

const CATEGORIES = [
  'Computer Not Starting',
  'Monitor Problem',
  'Keyboard Problem',
  'Mouse Problem',
  'Internet Problem',
  'Network Problem',
  'Software Problem',
  'Operating System Problem',
  'Slow Performance',
  'Other',
];

export const FacultyReportFault: React.FC<FacultyReportFaultProps> = ({ onOpenComplaint }) => {
  const {
    wings,
    floors,
    laboratories,
    computers,
    createComplaint,
    setCurrentView,
  } = useApp();

  const [selectedWingId, setSelectedWingId] = useState<number>(1);
  const [selectedFloorId, setSelectedFloorId] = useState<number>(1);
  const [selectedLabId, setSelectedLabId] = useState<number>(1);
  const [selectedCompId, setSelectedCompId] = useState<number>(5);

  const [category, setCategory] = useState<string>('Computer Not Starting');
  const [priority, setPriority] = useState<ComplaintPriority>('High');
  const [description, setDescription] = useState<string>('');
  const [attachmentName, setAttachmentName] = useState<string>('');

  const [submittedComplaint, setSubmittedComplaint] = useState<Complaint | null>(null);
  const [error, setError] = useState<string>('');

  // Cascading floor and lab options
  const availableFloors = floors.filter((f) => f.wing_id === selectedWingId);
  const availableLabs = laboratories.filter((l) => l.floor_id === selectedFloorId);
  const availableComputers = computers.filter(
    (c) => c.lab_id === selectedLabId && c.operational_status !== 'Decommissioned'
  );

  const selectedComputer = computers.find((c) => c.id === selectedCompId);

  const handleWingChange = (wingId: number) => {
    setSelectedWingId(wingId);
    const fls = floors.filter((f) => f.wing_id === wingId);
    if (fls.length > 0) {
      setSelectedFloorId(fls[0].id);
      const lbs = laboratories.filter((l) => l.floor_id === fls[0].id);
      if (lbs.length > 0) {
        setSelectedLabId(lbs[0].id);
        const pcs = computers.filter((c) => c.lab_id === lbs[0].id);
        if (pcs.length > 0) setSelectedCompId(pcs[0].id);
      }
    }
  };

  const handleFloorChange = (floorId: number) => {
    setSelectedFloorId(floorId);
    const lbs = laboratories.filter((l) => l.floor_id === floorId);
    if (lbs.length > 0) {
      setSelectedLabId(lbs[0].id);
      const pcs = computers.filter((c) => c.lab_id === lbs[0].id);
      if (pcs.length > 0) setSelectedCompId(pcs[0].id);
    }
  };

  const handleLabChange = (labId: number) => {
    setSelectedLabId(labId);
    const pcs = computers.filter((c) => c.lab_id === labId);
    if (pcs.length > 0) setSelectedCompId(pcs[0].id);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCompId) {
      setError('Please select a workstation.');
      return;
    }
    if (!description.trim()) {
      setError('Please provide a description of the problem.');
      return;
    }

    try {
      const created = createComplaint({
        computer_id: selectedCompId,
        problem_category: category,
        priority,
        description: description.trim(),
        attachment_filename: attachmentName || undefined,
      });
      setSubmittedComplaint(created);
    } catch (err: any) {
      setError(err?.message || 'Error creating complaint.');
    }
  };

  // Success view
  if (submittedComplaint) {
    return (
      <div className="page-container" style={{ maxWidth: '800px' }}>
        <div className="card text-center p-5">
          <div
            style={{
              width: '72px',
              height: '72px',
              borderRadius: '50%',
              background: 'var(--success-bg)',
              color: 'var(--success)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '2.5rem',
              margin: '0 auto 1.5rem',
            }}
          >
            <i className="fa-solid fa-circle-check"></i>
          </div>

          <h1 style={{ fontSize: '1.75rem', marginBottom: '0.5rem' }}>Fault Report Submitted!</h1>
          <p className="text-muted" style={{ fontSize: '1rem', marginBottom: '1.5rem' }}>
            Complaint ticket has been registered in the system and broadcast to on-duty technicians.
          </p>

          <div
            style={{
              background: 'var(--bg-surface-secondary)',
              padding: '1.5rem',
              borderRadius: 'var(--radius-lg)',
              maxWidth: '540px',
              margin: '0 auto 2rem',
              textAlign: 'left',
              border: '1px solid var(--border-color)',
            }}
          >
            <div className="d-flex justify-content-between align-items-center mb-2">
              <span className="text-muted" style={{ fontSize: '0.85rem' }}>Complaint Code:</span>
              <span
                style={{
                  fontFamily: 'JetBrains Mono',
                  fontWeight: 800,
                  fontSize: '1.15rem',
                  color: 'var(--primary)',
                }}
              >
                {submittedComplaint.complaint_code}
              </span>
            </div>
            <div className="d-flex justify-content-between align-items-center mb-2">
              <span className="text-muted" style={{ fontSize: '0.85rem' }}>Workstation:</span>
              <span className="fw-semibold text-main">
                {submittedComplaint.computer_id_code} ({submittedComplaint.pc_number})
              </span>
            </div>
            <div className="d-flex justify-content-between align-items-center mb-2">
              <span className="text-muted" style={{ fontSize: '0.85rem' }}>Location:</span>
              <span className="fw-medium text-main">
                {submittedComplaint.wing_name} • {submittedComplaint.lab_code}
              </span>
            </div>
            <div className="d-flex justify-content-between align-items-center mb-2">
              <span className="text-muted" style={{ fontSize: '0.85rem' }}>Category & Priority:</span>
              <div className="d-flex gap-2">
                <span className="badge badge-secondary">{submittedComplaint.problem_category}</span>
                <span className={`badge priority-${submittedComplaint.priority.toLowerCase()}`}>
                  {submittedComplaint.priority}
                </span>
              </div>
            </div>
            <div className="d-flex justify-content-between align-items-center">
              <span className="text-muted" style={{ fontSize: '0.85rem' }}>SMS Alerts:</span>
              <span className="badge badge-success">
                <i className="fa-solid fa-comment-sms me-1"></i> Dispatched to Technicians
              </span>
            </div>
          </div>

          <div className="d-flex justify-content-center gap-3">
            <button
              className="btn btn-primary"
              onClick={() => onOpenComplaint(submittedComplaint.complaint_code)}
            >
              <i className="fa-solid fa-eye me-1"></i> Track Ticket Progress
            </button>
            <button
              className="btn btn-outline"
              onClick={() => {
                setSubmittedComplaint(null);
                setDescription('');
                setAttachmentName('');
              }}
            >
              <i className="fa-solid fa-plus me-1"></i> Report Another Workstation
            </button>
            <button
              className="btn btn-secondary"
              onClick={() => setCurrentView('faculty-dashboard')}
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container" style={{ maxWidth: '1000px' }}>
      <div className="page-header">
        <div>
          <h1 className="page-title">Report Hardware Fault</h1>
          <p className="page-subtitle">
            Specify laboratory workstation location, diagnose symptom, and trigger emergency technician dispatch
          </p>
        </div>
        <button
          className="btn btn-outline"
          onClick={() => setCurrentView('faculty-dashboard')}
        >
          <i className="fa-solid fa-arrow-left me-1"></i> Back
        </button>
      </div>

      <div className="card">
        <div className="card-header">
          <div className="card-title">
            <i className="fa-solid fa-triangle-exclamation text-danger me-2"></i> Workstation Fault Report Form
          </div>
          <span className="badge badge-primary">Auto-SMS Enabled</span>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="card-body">
            {error && (
              <div
                style={{
                  background: 'var(--danger-bg)',
                  color: 'var(--danger)',
                  padding: '0.85rem',
                  borderRadius: 'var(--radius-md)',
                  marginBottom: '1.25rem',
                  fontSize: '0.9rem',
                }}
              >
                {error}
              </div>
            )}

            {/* Step 1: Location Hierarchy Dropdowns */}
            <h4 className="mb-3" style={{ fontSize: '1.05rem', color: 'var(--primary)' }}>
              1. Workstation Location Hierarchy
            </h4>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Academic Wing *</label>
                <select
                  className="form-select"
                  value={selectedWingId}
                  onChange={(e) => handleWingChange(Number(e.target.value))}
                >
                  {wings.map((w) => (
                    <option key={w.id} value={w.id}>
                      {w.name} ({w.code})
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Floor *</label>
                <select
                  className="form-select"
                  value={selectedFloorId}
                  onChange={(e) => handleFloorChange(Number(e.target.value))}
                >
                  {availableFloors.map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Computing Lab *</label>
                <select
                  className="form-select"
                  value={selectedLabId}
                  onChange={(e) => handleLabChange(Number(e.target.value))}
                >
                  {availableLabs.map((l) => (
                    <option key={l.id} value={l.id}>
                      {l.lab_code} — {l.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Workstation (PC#) *</label>
                <select
                  className="form-select"
                  value={selectedCompId}
                  onChange={(e) => setSelectedCompId(Number(e.target.value))}
                >
                  {availableComputers.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.pc_number} ({c.operational_status})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Live Workstation Specs Card */}
            {selectedComputer && (
              <div
                style={{
                  background: 'var(--bg-surface-secondary)',
                  border: '1.5px solid var(--border-color)',
                  borderRadius: 'var(--radius-md)',
                  padding: '1.25rem',
                  marginBottom: '2rem',
                }}
              >
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <div className="d-flex align-items-center gap-2">
                    <i className="fa-solid fa-desktop text-primary"></i>
                    <span className="fw-bold" style={{ fontFamily: 'JetBrains Mono', color: 'var(--text-main)' }}>
                      {selectedComputer.computer_id_code}
                    </span>
                    <span className="text-muted">({selectedComputer.pc_number})</span>
                  </div>
                  <span
                    className={`badge ${
                      selectedComputer.operational_status === 'Working'
                        ? 'badge-success'
                        : selectedComputer.operational_status === 'Repaired'
                        ? 'badge-primary'
                        : 'badge-warning'
                    }`}
                  >
                    Current: {selectedComputer.operational_status}
                  </span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.75rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  <div><strong>Brand / Model:</strong> {selectedComputer.brand} {selectedComputer.model}</div>
                  <div><strong>Serial Number:</strong> {selectedComputer.serial_number}</div>
                  <div><strong>Processor:</strong> {selectedComputer.processor}</div>
                  <div><strong>RAM:</strong> {selectedComputer.ram}</div>
                  <div><strong>Storage:</strong> {selectedComputer.storage}</div>
                  <div><strong>Operating System:</strong> {selectedComputer.os}</div>
                </div>
              </div>
            )}

            {/* Step 2: Fault Information */}
            <h4 className="mb-3" style={{ fontSize: '1.05rem', color: 'var(--primary)' }}>
              2. Problem Classification & Urgency
            </h4>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Problem Category *</label>
                <select
                  className="form-select"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Priority Level *</label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.4rem' }}>
                  {(['Low', 'Medium', 'High', 'Critical'] as ComplaintPriority[]).map((prio) => (
                    <button
                      key={prio}
                      type="button"
                      onClick={() => setPriority(prio)}
                      className={`btn btn-sm ${priority === prio ? (prio === 'Critical' ? 'btn-danger' : 'btn-primary') : 'btn-outline'}`}
                      style={{ fontSize: '0.775rem' }}
                    >
                      {prio}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Detailed Symptom Description *</label>
              <textarea
                className="form-control"
                rows={4}
                placeholder="Describe what occurred, error messages observed, LED indications, or abnormal behavior..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
              ></textarea>
            </div>

            <div className="form-group">
              <label className="form-label">Attachment / Error Photo (Optional)</label>
              <input
                type="file"
                className="form-control"
                accept="image/*"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    setAttachmentName(e.target.files[0].name);
                  }
                }}
              />
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                Accepts screenshot or photo of screen, error dialog, or cable damage (PNG, JPG, WEBP).
              </div>
            </div>
          </div>

          <div className="card-footer d-flex justify-content-between align-items-center">
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              <i className="fa-solid fa-bell text-primary me-1"></i>
              Submitting triggers real-time technician SMS alert dispatch.
            </div>
            <button type="submit" className="btn btn-primary btn-lg">
              <i className="fa-solid fa-paper-plane me-1"></i> Submit Fault Report
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
