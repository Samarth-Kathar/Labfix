import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';

export const InventoryAdd: React.FC = () => {
  const { laboratories, addComputer, setCurrentView } = useApp();

  const [labId, setLabId] = useState<number>(laboratories[0]?.id || 1);
  const [pcNumber, setPcNumber] = useState('PC-21');
  const [computerIdCode, setComputerIdCode] = useState('COMP-A1-01-PC-21');
  const [brand, setBrand] = useState('Dell');
  const [model, setModel] = useState('OptiPlex 7090 Tower');
  const [serialNumber, setSerialNumber] = useState(`SN-A101-${Math.floor(100 + Math.random() * 900)}`);
  const [processor, setProcessor] = useState('Intel Core i7-11700 (8-Core 2.50GHz)');
  const [ram, setRam] = useState('16 GB DDR4 3200MHz');
  const [storage, setStorage] = useState('512 GB M.2 NVMe SSD');
  const [os, setOs] = useState('Windows 11 Pro 64-bit');
  const [installationDate, setInstallationDate] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [error, setError] = useState('');

  const handleLabChange = (newLabId: number) => {
    setLabId(newLabId);
    const lab = laboratories.find((l) => l.id === newLabId);
    if (lab) {
      setComputerIdCode(`COMP-${lab.lab_code}-${pcNumber}`);
      setSerialNumber(`SN-${lab.lab_code.replace('-', '')}-${Math.floor(100 + Math.random() * 900)}`);
    }
  };

  const handlePcNumChange = (newPcNum: string) => {
    setPcNumber(newPcNum);
    const lab = laboratories.find((l) => l.id === labId);
    if (lab) {
      setComputerIdCode(`COMP-${lab.lab_code}-${newPcNum}`);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!computerIdCode.trim() || !serialNumber.trim()) {
      setError('Computer ID Code and Serial Number are required.');
      return;
    }

    try {
      addComputer({
        lab_id: labId,
        pc_number: pcNumber,
        computer_id_code: computerIdCode.trim(),
        brand,
        model,
        serial_number: serialNumber.trim(),
        processor,
        ram,
        storage,
        os,
        installation_date: installationDate,
      });
      setCurrentView('inventory-list');
    } catch (err: any) {
      setError(err?.message || 'Error adding workstation.');
    }
  };

  return (
    <div className="page-container" style={{ maxWidth: '850px' }}>
      <div className="page-header">
        <div>
          <h1 className="page-title">Add Workstation to Inventory</h1>
          <p className="page-subtitle">
            Deploy a new computer into a laboratory and register hardware specifications
          </p>
        </div>
        <button
          className="btn btn-outline"
          onClick={() => setCurrentView('inventory-list')}
        >
          <i className="fa-solid fa-arrow-left me-1"></i> Back to Inventory
        </button>
      </div>

      <div className="card">
        <div className="card-header">
          <div className="card-title">
            <i className="fa-solid fa-plus-circle text-primary me-2"></i> Computer Specifications Form
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
                  marginBottom: '1rem',
                  fontSize: '0.875rem',
                }}
              >
                {error}
              </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem', marginBottom: '1.25rem' }}>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Assign to Laboratory *</label>
                <select
                  className="form-select"
                  value={labId}
                  onChange={(e) => handleLabChange(Number(e.target.value))}
                >
                  {laboratories.map((l) => (
                    <option key={l.id} value={l.id}>
                      {l.lab_code} — {l.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Workstation Slot (PC Number) *</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g. PC-21"
                  value={pcNumber}
                  onChange={(e) => handlePcNumChange(e.target.value)}
                  required
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem', marginBottom: '1.25rem' }}>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Computer ID Code *</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="COMP-A1-01-PC-21"
                  value={computerIdCode}
                  onChange={(e) => setComputerIdCode(e.target.value)}
                  required
                />
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Manufacturer Serial Number *</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="SN-A101-021"
                  value={serialNumber}
                  onChange={(e) => setSerialNumber(e.target.value)}
                  required
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem', marginBottom: '1.25rem' }}>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Brand *</label>
                <select
                  className="form-select"
                  value={brand}
                  onChange={(e) => setBrand(e.target.value)}
                >
                  <option value="Dell">Dell</option>
                  <option value="HP">HP</option>
                  <option value="Lenovo">Lenovo</option>
                </select>
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Hardware Model *</label>
                <input
                  type="text"
                  className="form-control"
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
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
                  value={processor}
                  onChange={(e) => setProcessor(e.target.value)}
                />
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">RAM Memory</label>
                <input
                  type="text"
                  className="form-control"
                  value={ram}
                  onChange={(e) => setRam(e.target.value)}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem', marginBottom: '1.25rem' }}>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Storage Drive</label>
                <input
                  type="text"
                  className="form-control"
                  value={storage}
                  onChange={(e) => setStorage(e.target.value)}
                />
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Operating System</label>
                <input
                  type="text"
                  className="form-control"
                  value={os}
                  onChange={(e) => setOs(e.target.value)}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Installation Date</label>
              <input
                type="date"
                className="form-control"
                value={installationDate}
                onChange={(e) => setInstallationDate(e.target.value)}
              />
            </div>
          </div>

          <div className="card-footer d-flex justify-content-end gap-2">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setCurrentView('inventory-list')}
            >
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              <i className="fa-solid fa-plus-circle me-1"></i> Register Workstation
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
