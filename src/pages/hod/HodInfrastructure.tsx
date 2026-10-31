import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Laboratory } from '../../types';

export const HodInfrastructure: React.FC = () => {
  const {
    wings,
    floors,
    laboratories,
    computers,
    users,
    setSelectedComputerId,
    setCurrentView,
  } = useApp();

  const [selectedWingId, setSelectedWingId] = useState<number>(1);
  const [activeLabModal, setActiveLabModal] = useState<Laboratory | null>(null);

  const selectedWing = wings.find((w) => w.id === selectedWingId) || wings[0];
  const wingFloors = floors.filter((f) => f.wing_id === selectedWingId);

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Campus Infrastructure</h1>
          <p className="page-subtitle">
            Computing Laboratories & Workstation Rack Layouts • NMIET Engineering Campus
          </p>
        </div>
      </div>

      {/* Wing Selector Tabs */}
      <div className="role-tabs responsive-wing-tabs mb-4">
        {wings.map((w) => {
          const wingFloorIds = floors.filter((f) => f.wing_id === w.id).map((f) => f.id);
          const wingLabs = laboratories.filter((l) => wingFloorIds.includes(l.floor_id));
          const wingLabIds = wingLabs.map((l) => l.id);
          const wingComps = computers.filter((c) => wingLabIds.includes(c.lab_id));
          const faults = wingComps.filter(
            (c) => c.operational_status === 'Fault Reported' || c.operational_status === 'Under Repair'
          ).length;

          return (
            <div
              key={w.id}
              className={`role-tab ${selectedWingId === w.id ? 'active' : ''}`}
              onClick={() => setSelectedWingId(w.id)}
              style={{ padding: '0.85rem' }}
            >
              <div className="fw-bold" style={{ fontSize: '1rem' }}>{w.name}</div>
              <div style={{ fontSize: '0.75rem', opacity: 0.8, marginTop: '0.2rem' }}>
                {w.description.split('-')[1]?.trim() || w.description}
              </div>
              <div className="d-flex align-items-center justify-content-center gap-2 mt-2" style={{ fontSize: '0.725rem' }}>
                <span>{wingComps.length} PCs</span>
                <span>•</span>
                <span style={{ color: faults > 0 ? 'var(--danger)' : 'var(--success)' }}>
                  {faults > 0 ? `${faults} Faults` : 'All Healthy'}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Floors & Labs for Selected Wing */}
      <div className="d-flex flex-column gap-4">
        {wingFloors.map((fl) => {
          const floorLabs = laboratories.filter((l) => l.floor_id === fl.id);

          return (
            <div key={fl.id} className="card">
              <div className="card-header">
                <div className="card-title">
                  <i className="fa-solid fa-layer-group text-primary me-2"></i>
                  <span>{selectedWing.name} — {fl.name}</span>
                </div>
                <span className="badge badge-secondary">{floorLabs.length} Laboratories</span>
              </div>

              <div className="card-body">
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '1.25rem' }}>
                  {floorLabs.map((lab) => {
                    const labComps = computers.filter((c) => c.lab_id === lab.id);
                    const working = labComps.filter((c) => c.operational_status === 'Working' || c.operational_status === 'Repaired').length;
                    const faults = labComps.filter((c) => c.operational_status === 'Fault Reported').length;
                    const repairs = labComps.filter((c) => c.operational_status === 'Under Repair').length;
                    const inCharge = users.find((u) => u.id === lab.in_charge_faculty_id);

                    const healthPct = labComps.length > 0 ? ((working / labComps.length) * 100).toFixed(0) : 100;

                    return (
                      <div
                        key={lab.id}
                        style={{
                          background: 'var(--bg-surface-secondary)',
                          border: '1.5px solid var(--border-color)',
                          borderRadius: 'var(--radius-md)',
                          padding: '1.25rem',
                          display: 'flex',
                          flexDirection: 'column',
                          justifyContent: 'space-between',
                          gap: '1rem',
                        }}
                      >
                        <div>
                          <div className="d-flex align-items-center justify-content-between mb-1">
                            <span
                              className="badge badge-primary"
                              style={{ fontFamily: 'JetBrains Mono', fontSize: '0.85rem' }}
                            >
                              {lab.lab_code}
                            </span>
                            <span
                              className={`badge ${
                                Number(healthPct) === 100
                                  ? 'badge-success'
                                  : Number(healthPct) >= 80
                                  ? 'badge-warning'
                                  : 'badge-danger'
                              }`}
                            >
                              {healthPct}% Health
                            </span>
                          </div>

                          <h3 style={{ fontSize: '1.1rem', margin: '0.4rem 0 0.2rem' }}>{lab.name}</h3>
                          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{lab.department}</div>

                          <div className="mt-3 pt-2 border-top" style={{ borderTop: '1px solid var(--border-color)', fontSize: '0.8rem' }}>
                            <div>Faculty In-Charge: <strong>{inCharge ? inCharge.full_name : 'Prof. Alan Turing'}</strong></div>
                            <div className="text-muted mt-1">Capacity: <strong>{lab.capacity} Workstations</strong></div>
                          </div>
                        </div>

                        {/* Status Counters */}
                        <div>
                          <div className="d-flex justify-content-between align-items-center mb-2" style={{ fontSize: '0.775rem' }}>
                            <span className="text-success"><i className="fa-solid fa-circle me-1" style={{ fontSize: '0.6rem' }}></i> {working} Operational</span>
                            {faults > 0 && <span className="text-danger"><i className="fa-solid fa-circle me-1" style={{ fontSize: '0.6rem' }}></i> {faults} Fault Reported</span>}
                            {repairs > 0 && <span className="text-warning"><i className="fa-solid fa-circle me-1" style={{ fontSize: '0.6rem' }}></i> {repairs} In Repair</span>}
                          </div>

                          <button
                            className="btn btn-outline btn-sm w-100"
                            onClick={() => setActiveLabModal(lab)}
                          >
                            <i className="fa-solid fa-table-cells me-1"></i> View 20 Workstations Rack
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Interactive Workstation Rack Modal */}
      {activeLabModal && (
        <div className="modal-overlay active" onClick={() => setActiveLabModal(null)}>
          <div
            className="modal-card"
            style={{ maxWidth: '850px' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="card-header">
              <div className="card-title">
                <i className="fa-solid fa-desktop text-primary me-2"></i>
                <span>Workstation Grid: {activeLabModal.name} ({activeLabModal.lab_code})</span>
              </div>
              <button
                onClick={() => setActiveLabModal(null)}
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
              <div className="d-flex align-items-center justify-content-between flex-wrap gap-2 mb-3">
                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  Click any workstation to inspect its full hardware specifications, maintenance logs, and serial number.
                </div>
                <div className="d-flex align-items-center gap-3" style={{ fontSize: '0.75rem' }}>
                  <span><i className="fa-solid fa-circle text-success me-1"></i> Working</span>
                  <span><i className="fa-solid fa-circle text-danger me-1"></i> Fault Reported</span>
                  <span><i className="fa-solid fa-circle text-warning me-1"></i> In Repair</span>
                </div>
              </div>

              {/* 20 Workstations Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '0.75rem' }}>
                {computers
                  .filter((c) => c.lab_id === activeLabModal.id)
                  .map((comp) => {
                    const isFault = comp.operational_status === 'Fault Reported';
                    const isRepair = comp.operational_status === 'Under Repair';

                    return (
                      <div
                        key={comp.id}
                        className={`workstation-cell ${isFault ? 'is-fault' : ''} ${isRepair ? 'is-repair' : ''}`}
                        onClick={() => {
                          setSelectedComputerId(comp.id);
                          setCurrentView('inventory-detail');
                          setActiveLabModal(null);
                        }}
                      >
                        <div className="d-flex align-items-center justify-content-between mb-1">
                          <span className="fw-bold" style={{ fontSize: '0.9rem', color: 'var(--text-main)' }}>
                            {comp.pc_number}
                          </span>
                          <span
                            className={`badge-dot ${
                              isFault
                                ? 'text-danger'
                                : isRepair
                                ? 'text-warning'
                                : 'text-success'
                            }`}
                          ></span>
                        </div>
                        <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>
                          {comp.brand}
                        </div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {comp.serial_number}
                        </div>
                        <div style={{ marginTop: '0.4rem' }}>
                          <span
                            className={`badge ${
                              isFault
                                ? 'badge-danger'
                                : isRepair
                                ? 'badge-warning'
                                : 'badge-success'
                            }`}
                            style={{ fontSize: '0.65rem', padding: '0.15rem 0.45rem' }}
                          >
                            {comp.operational_status}
                          </span>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>

            <div className="card-footer d-flex justify-content-end">
              <button className="btn btn-secondary" onClick={() => setActiveLabModal(null)}>
                Close Rack View
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
