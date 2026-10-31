import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';

export const InventoryList: React.FC = () => {
  const {
    computers,
    wings,
    setSelectedComputerId,
    setCurrentView,
  } = useApp();

  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [wing, setWing] = useState('');
  const [sortBy, setSortBy] = useState('id');

  // Filter & Sort
  const filtered = computers.filter((c) => {
    if (status && c.operational_status !== status) return false;
    if (wing && c.wing_name !== wing) return false;
    if (search) {
      const q = search.toLowerCase();
      const match =
        c.computer_id_code.toLowerCase().includes(q) ||
        c.serial_number.toLowerCase().includes(q) ||
        c.brand.toLowerCase().includes(q) ||
        c.model.toLowerCase().includes(q) ||
        c.pc_number.toLowerCase().includes(q) ||
        (c.lab_code || '').toLowerCase().includes(q);
      if (!match) return false;
    }
    return true;
  });

  filtered.sort((a, b) => {
    if (sortBy === 'pc_number') return a.pc_number.localeCompare(b.pc_number);
    if (sortBy === 'brand') return a.brand.localeCompare(b.brand);
    if (sortBy === 'status') return a.operational_status.localeCompare(b.operational_status);
    return a.id - b.id;
  });

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Computer Asset Inventory</h1>
          <p className="page-subtitle">
            Centralized asset tracking across 18 computing laboratories and 360 workstations
          </p>
        </div>
        <button
          className="btn btn-primary"
          onClick={() => setCurrentView('inventory-add')}
        >
          <i className="fa-solid fa-plus-circle me-1"></i> Add New Computer
        </button>
      </div>

      {/* Filters Bar */}
      <div className="filter-bar">
        <div style={{ flex: 1, minWidth: '220px' }}>
          <input
            type="text"
            className="form-control"
            placeholder="Search Computer ID, Serial, Brand, Model, or PC#..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div style={{ minWidth: '140px' }}>
          <select
            className="form-select"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          >
            <option value="">All Statuses</option>
            <option value="Working">Working</option>
            <option value="Fault Reported">Fault Reported</option>
            <option value="Under Repair">Under Repair</option>
            <option value="Repaired">Repaired</option>
            <option value="Decommissioned">Decommissioned</option>
          </select>
        </div>

        <div style={{ minWidth: '130px' }}>
          <select
            className="form-select"
            value={wing}
            onChange={(e) => setWing(e.target.value)}
          >
            <option value="">All Wings</option>
            {wings.map((w) => (
              <option key={w.id} value={w.name}>
                {w.name}
              </option>
            ))}
          </select>
        </div>

        <div style={{ minWidth: '140px' }}>
          <select
            className="form-select"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="id">Sort: Default ID</option>
            <option value="pc_number">Sort: PC Number</option>
            <option value="brand">Sort: Brand</option>
            <option value="status">Sort: Status</option>
          </select>
        </div>

        {(search || status || wing || sortBy !== 'id') && (
          <button
            className="btn btn-outline"
            onClick={() => {
              setSearch('');
              setStatus('');
              setWing('');
              setSortBy('id');
            }}
            title="Reset Filters"
          >
            <i className="fa-solid fa-rotate-left"></i>
          </button>
        )}
      </div>

      {/* Inventory Table Card */}
      <div className="card">
        <div className="card-header">
          <div className="card-title">
            <i className="fa-solid fa-desktop text-primary me-2"></i> Workstation Directory
          </div>
          <span className="badge badge-secondary">{filtered.length} Workstations Listed</span>
        </div>

        <div className="card-body p-0">
          {filtered.length === 0 ? (
            <div className="p-5 text-center text-muted">
              <i className="fa-solid fa-desktop mb-2" style={{ fontSize: '2.5rem', opacity: 0.5 }}></i>
              <h4>No Computers Found</h4>
              <p>No inventory records match your search criteria.</p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table">
                <thead>
                  <tr>
                    <th>Computer ID</th>
                    <th>PC Number</th>
                    <th>Location</th>
                    <th>Brand & Model</th>
                    <th>Serial Number</th>
                    <th>Operational Status</th>
                    <th>Last Maintenance</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.slice(0, 100).map((c) => {
                    const isDecommissioned = c.operational_status === 'Decommissioned';

                    return (
                      <tr key={c.id}>
                        <td
                          className="fw-bold"
                          style={{ fontFamily: 'monospace', color: 'var(--primary)' }}
                        >
                          {c.computer_id_code}
                        </td>
                        <td className="fw-semibold text-main">{c.pc_number}</td>
                        <td>
                          <div className="fw-medium text-main">{c.lab_code}</div>
                          <div className="text-muted" style={{ fontSize: '0.75rem' }}>
                            {c.wing_name} • {c.floor_name}
                          </div>
                        </td>
                        <td>
                          <div className="fw-medium">{c.brand} {c.model}</div>
                          <div className="text-muted" style={{ fontSize: '0.75rem' }}>
                            {c.processor}
                          </div>
                        </td>
                        <td style={{ fontFamily: 'monospace', fontSize: '0.825rem' }}>
                          {c.serial_number}
                        </td>
                        <td>
                          <span
                            className={`badge status-badge-${c.operational_status.toLowerCase().replace(' ', '-')}`}
                          >
                            {c.operational_status}
                          </span>
                        </td>
                        <td className="text-muted" style={{ fontSize: '0.8rem' }}>
                          {c.last_maintenance_date || 'None recorded'}
                        </td>
                        <td>
                          <div className="d-flex align-items-center gap-1">
                            <button
                              className="btn btn-outline btn-sm"
                              onClick={() => {
                                setSelectedComputerId(c.id);
                                setCurrentView('inventory-detail');
                              }}
                              title="View Specifications & History"
                            >
                              <i className="fa-solid fa-eye"></i> Details
                            </button>
                            {!isDecommissioned && (
                              <button
                                className="btn btn-secondary btn-sm"
                                onClick={() => {
                                  setSelectedComputerId(c.id);
                                  setCurrentView('inventory-replace');
                                }}
                                title="Replace Hardware"
                              >
                                <i className="fa-solid fa-repeat"></i> Replace
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
