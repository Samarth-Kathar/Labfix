import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';

export const InventoryReplace: React.FC = () => {
  const {
    computers,
    selectedComputerId,
    replaceComputer,
    setCurrentView,
    setSelectedComputerId,
  } = useApp();

  const currentComp = computers.find((c) => c.id === selectedComputerId) || computers[0];

  const [newCode, setNewCode] = useState(
    currentComp ? `${currentComp.computer_id_code}-GEN2` : 'COMP-NEW'
  );
  const [newBrand, setNewBrand] = useState(currentComp?.brand || 'Dell');
  const [newModel, setNewModel] = useState(currentComp?.model || 'OptiPlex 7090 Tower');
  const [newSerial, setNewSerial] = useState(`SN-REP-${Math.floor(1000 + Math.random() * 9000)}`);
  const [newProcessor, setNewProcessor] = useState(
    currentComp?.processor || 'Intel Core i7-12700 (12-Core 2.10GHz)'
  );
  const [newRam, setNewRam] = useState('32 GB DDR4 3200MHz');
  const [newStorage, setNewStorage] = useState('1 TB NVMe SSD');
  const [newOs, setNewOs] = useState('Windows 11 Pro 64-bit');
  const [reason, setReason] = useState('Hardware upgrade / Defective board replacement');
  const [notes, setNotes] = useState('New unit installed, drivers configured, connected to college AD domain.');
  const [error, setError] = useState('');

  if (!currentComp) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCode.trim() || !newSerial.trim() || !reason.trim()) {
      setError('New Computer ID Code, Serial Number, and Reason are required.');
      return;
    }

    try {
      const created = replaceComputer(currentComp.id, {
        computer_id_code: newCode.trim(),
        brand: newBrand,
        model: newModel,
        serial_number: newSerial.trim(),
        processor: newProcessor,
        ram: newRam,
        storage: newStorage,
        os: newOs,
        reason: reason.trim(),
        notes: notes.trim(),
      });
      setSelectedComputerId(created.id);
      setCurrentView('inventory-detail');
    } catch (err: any) {
      setError(err?.message || 'Error executing replacement.');
    }
  };

  return (
    <div className="page-container" style={{ maxWidth: '880px' }}>
      <div className="page-header">
        <div>
          <h1 className="page-title">Hardware Replacement Workflow</h1>
          <p className="page-subtitle">
            Hot-swap workstation at slot {currentComp.pc_number} in {currentComp.lab_code} while archiving legacy audit history
          </p>
        </div>
        <button
          className="btn btn-outline"
          onClick={() => setCurrentView('inventory-detail')}
        >
          <i className="fa-solid fa-arrow-left me-1"></i> Cancel
        </button>
      </div>

      {/* Legacy Computer Summary */}
      <div
        className="card mb-4"
        style={{
          background: 'var(--bg-surface-secondary)',
          border: '1.5px solid var(--border-color)',
        }}
      >
        <div className="card-header">
          <div className="card-title" style={{ fontSize: '1rem' }}>
            <i className="fa-solid fa-box-archive text-warning me-2"></i> Current Workstation Occupying Slot {currentComp.pc_number}
          </div>
          <span className="badge badge-warning">Will be Decommissioned & Archived</span>
        </div>
        <div className="card-body">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem', fontSize: '0.85rem' }}>
            <div><strong>Computer ID:</strong> {currentComp.computer_id_code}</div>
            <div><strong>Location:</strong> {currentComp.lab_code} ({currentComp.pc_number})</div>
            <div><strong>Serial Number:</strong> {currentComp.serial_number}</div>
            <div><strong>Hardware:</strong> {currentComp.brand} {currentComp.model}</div>
            <div><strong>Status:</strong> {currentComp.operational_status}</div>
          </div>
        </div>
      </div>

      {/* New Hardware Form */}
      <div className="card">
        <div className="card-header">
          <div className="card-title">
            <i className="fa-solid fa-repeat text-primary me-2"></i> New Workstation Deployment Details
          </div>
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
                  fontSize: '0.875rem',
                }}
              >
                {error}
              </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem', marginBottom: '1.25rem' }}>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">New Computer ID Code *</label>
                <input
                  type="text"
                  className="form-control"
                  value={newCode}
                  onChange={(e) => setNewCode(e.target.value)}
                  required
                />
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">New Manufacturer Serial Number *</label>
                <input
                  type="text"
                  className="form-control"
                  value={newSerial}
                  onChange={(e) => setNewSerial(e.target.value)}
                  required
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem', marginBottom: '1.25rem' }}>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Brand *</label>
                <select
                  className="form-select"
                  value={newBrand}
                  onChange={(e) => setNewBrand(e.target.value)}
                >
                  <option value="Dell">Dell</option>
                  <option value="HP">HP</option>
                  <option value="Lenovo">Lenovo</option>
                </select>
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Model *</label>
                <input
                  type="text"
                  className="form-control"
                  value={newModel}
                  onChange={(e) => setNewModel(e.target.value)}
                  required
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem', marginBottom: '1.25rem' }}>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Processor (CPU)</label>
                <input
                  type="text"
                  className="form-control"
                  value={newProcessor}
                  onChange={(e) => setNewProcessor(e.target.value)}
                />
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">RAM Memory</label>
                <input
                  type="text"
                  className="form-control"
                  value={newRam}
                  onChange={(e) => setNewRam(e.target.value)}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem', marginBottom: '1.25rem' }}>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Storage</label>
                <input
                  type="text"
                  className="form-control"
                  value={newStorage}
                  onChange={(e) => setNewStorage(e.target.value)}
                />
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Operating System</label>
                <input
                  type="text"
                  className="form-control"
                  value={newOs}
                  onChange={(e) => setNewOs(e.target.value)}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Replacement Reason *</label>
              <input
                type="text"
                className="form-control"
                placeholder="Reason for replacing the existing unit..."
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Installation & Benchmark Notes</label>
              <textarea
                className="form-control"
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              ></textarea>
            </div>
          </div>

          <div className="card-footer d-flex justify-content-end gap-2">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setCurrentView('inventory-detail')}
            >
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              <i className="fa-solid fa-repeat me-1"></i> Execute Hardware Replacement
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
