import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';

export const HodHealth: React.FC = () => {
  const { laboratories, computers, setSelectedComputerId, setCurrentView } = useApp();
  const [filterNeedsAttention, setFilterNeedsAttention] = useState(false);

  const labHealthData = laboratories.map((lab) => {
    const labComps = computers.filter((c) => c.lab_id === lab.id);
    const working = labComps.filter(
      (c) => c.operational_status === 'Working' || c.operational_status === 'Repaired'
    ).length;
    const faults = labComps.filter((c) => c.operational_status === 'Fault Reported').length;
    const repairs = labComps.filter((c) => c.operational_status === 'Under Repair').length;
    const decommissioned = labComps.filter((c) => c.operational_status === 'Decommissioned').length;
    const healthScore = labComps.length > 0 ? (working / labComps.length) * 100 : 100;

    return {
      lab,
      total: labComps.length,
      working,
      faults,
      repairs,
      decommissioned,
      healthScore,
      computers: labComps,
    };
  });

  const displayedLabs = filterNeedsAttention
    ? labHealthData.filter((l) => l.faults > 0 || l.repairs > 0)
    : labHealthData;

  const totalHealthOverall =
    labHealthData.reduce((acc, curr) => acc + curr.healthScore, 0) / (labHealthData.length || 1);

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Workstation Health Matrix</h1>
          <p className="page-subtitle">
            Reliability indices and real-time operational availability across all 18 computer laboratories
          </p>
        </div>
        <div className="d-flex align-items-center gap-2">
          <button
            className={`btn ${filterNeedsAttention ? 'btn-danger' : 'btn-outline'}`}
            onClick={() => setFilterNeedsAttention(!filterNeedsAttention)}
          >
            <i className="fa-solid fa-triangle-exclamation me-1"></i>
            {filterNeedsAttention ? 'Showing Faulty Labs Only' : 'Filter Labs Needing Attention'}
          </button>
        </div>
      </div>

      {/* Campus Health Overview Banner */}
      <div
        className="card mb-4"
        style={{
          background: 'linear-gradient(135deg, rgba(37, 99, 235, 0.08) 0%, rgba(6, 182, 212, 0.08) 100%)',
          borderColor: 'rgba(37, 99, 235, 0.2)',
        }}
      >
        <div className="card-body d-flex align-items-center justify-content-between flex-wrap gap-3">
          <div>
            <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)' }}>
              OVERALL CAMPUS WORKSTATION AVAILABILITY
            </div>
            <div className="fw-bold" style={{ fontSize: '2.5rem', color: 'var(--primary)', lineHeight: 1.1 }}>
              {totalHealthOverall.toFixed(1)}%
            </div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
              360 Total Physical Assets • 18 Computing Environments
            </div>
          </div>
          <div className="d-flex gap-4">
            <div className="text-center">
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>100% HEALTH LABS</div>
              <div className="fw-bold text-success" style={{ fontSize: '1.5rem' }}>
                {labHealthData.filter((l) => l.healthScore === 100).length} / 18
              </div>
            </div>
            <div className="text-center">
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>ACTIVE FAULT WORKSTATIONS</div>
              <div className="fw-bold text-danger" style={{ fontSize: '1.5rem' }}>
                {computers.filter((c) => c.operational_status === 'Fault Reported').length}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Grid of Labs Health */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '1.5rem' }}>
        {displayedLabs.map(({ lab, total, working, faults, repairs, healthScore, computers: labComps }) => (
          <div key={lab.id} className="card">
            <div className="card-header">
              <div>
                <div className="card-title">
                  <span style={{ fontFamily: 'JetBrains Mono', color: 'var(--primary)' }}>{lab.lab_code}</span>
                  <span className="ms-2">{lab.name}</span>
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                  {lab.department}
                </div>
              </div>
              <span
                className={`badge ${
                  healthScore === 100
                    ? 'badge-success'
                    : healthScore >= 80
                    ? 'badge-warning'
                    : 'badge-danger'
                }`}
                style={{ fontSize: '0.85rem' }}
              >
                {healthScore.toFixed(0)}%
              </span>
            </div>

            <div className="card-body">
              {/* Health Bar */}
              <div className="mb-3">
                <div className="d-flex justify-content-between mb-1" style={{ fontSize: '0.75rem' }}>
                  <span className="text-muted">Workstation Status Distribution</span>
                  <span className="fw-semibold text-main">{working} of {total} Available</span>
                </div>
                <div style={{ height: '8px', background: 'var(--bg-surface-secondary)', borderRadius: '999px', overflow: 'hidden', display: 'flex' }}>
                  <div style={{ width: `${(working / total) * 100}%`, background: 'var(--success)' }}></div>
                  <div style={{ width: `${(faults / total) * 100}%`, background: 'var(--danger)' }}></div>
                  <div style={{ width: `${(repairs / total) * 100}%`, background: 'var(--warning)' }}></div>
                </div>
              </div>

              {/* 20 PCs Micro Badges Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '0.4rem', marginTop: '1rem' }}>
                {labComps.map((comp) => {
                  const isFault = comp.operational_status === 'Fault Reported';
                  const isRepair = comp.operational_status === 'Under Repair';

                  return (
                    <div
                      key={comp.id}
                      onClick={() => {
                        setSelectedComputerId(comp.id);
                        setCurrentView('inventory-detail');
                      }}
                      title={`${comp.computer_id_code} — ${comp.operational_status}`}
                      style={{
                        padding: '0.35rem 0.2rem',
                        textAlign: 'center',
                        fontSize: '0.7rem',
                        fontWeight: 600,
                        borderRadius: 'var(--radius-sm)',
                        cursor: 'pointer',
                        background: isFault
                          ? 'var(--danger-bg)'
                          : isRepair
                          ? 'var(--warning-bg)'
                          : 'var(--bg-surface-secondary)',
                        color: isFault
                          ? 'var(--danger)'
                          : isRepair
                          ? '#d97706'
                          : 'var(--text-main)',
                        border: `1px solid ${
                          isFault
                            ? 'rgba(239, 68, 68, 0.3)'
                            : isRepair
                            ? 'rgba(245, 158, 11, 0.3)'
                            : 'var(--border-color)'
                        }`,
                        transition: 'transform var(--transition-fast)',
                      }}
                    >
                      {comp.pc_number}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
