import React from 'react';
import { useApp } from '../../context/AppContext';

export const HodReports: React.FC = () => {
  const { computers, complaints, maintenanceRecords, showToast } = useApp();

  const totalComputers = computers.length;
  const dellComputers = computers.filter((c) => c.brand === 'Dell');
  const hpComputers = computers.filter((c) => c.brand === 'HP');
  const lenovoComputers = computers.filter((c) => c.brand === 'Lenovo');

  // Failure counts by brand
  const getBrandFaults = (brandName: string) => {
    const compIds = computers.filter((c) => c.brand === brandName).map((c) => c.id);
    return complaints.filter((cmp) => compIds.includes(cmp.computer_id)).length;
  };

  const dellFaults = getBrandFaults('Dell');
  const hpFaults = getBrandFaults('HP');
  const lenovoFaults = getBrandFaults('Lenovo');

  // Category counts
  const categoryCounts: Record<string, number> = {};
  complaints.forEach((c) => {
    categoryCounts[c.problem_category] = (categoryCounts[c.problem_category] || 0) + 1;
  });

  const handleExportCSV = () => {
    const headers = 'Ticket Code,Workstation ID,Lab,Category,Priority,Status,Reported Date,Resolved Date\n';
    const rows = complaints
      .map(
        (c) =>
          `"${c.complaint_code}","${c.computer_id_code}","${c.lab_code}","${c.problem_category}","${c.priority}","${c.status}","${c.reported_at}","${c.resolved_at || ''}"`
      )
      .join('\n');
    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `LabFix_Hardware_Report_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Report Exported', 'CSV summary downloaded to your system.', 'success');
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Reports & Reliability Analytics</h1>
          <p className="page-subtitle">
            Mean Time To Resolution (MTTR), brand durability comparisons, and peripheral failure indices
          </p>
        </div>
        <button className="btn btn-primary" onClick={handleExportCSV}>
          <i className="fa-solid fa-file-csv me-1"></i> Export Incident Report (CSV)
        </button>
      </div>

      {/* Brand Comparison Grid */}
      <div className="stats-grid mb-4">
        <div className="card" style={{ padding: '1.25rem' }}>
          <div className="d-flex align-items-center justify-content-between mb-2">
            <span className="fw-bold" style={{ fontSize: '1.1rem' }}>Dell OptiPlex</span>
            <span className="badge badge-secondary">{dellComputers.length} Deployed</span>
          </div>
          <div style={{ fontSize: '0.825rem', color: 'var(--text-muted)' }}>
            Recorded Faults: <strong>{dellFaults}</strong>
          </div>
          <div style={{ fontSize: '0.825rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
            Failure Rate: <strong>{((dellFaults / (dellComputers.length || 1)) * 100).toFixed(1)}%</strong>
          </div>
          <div style={{ height: '6px', background: 'var(--bg-surface-secondary)', borderRadius: '999px', overflow: 'hidden', marginTop: '0.75rem' }}>
            <div style={{ width: `${Math.min(100, (dellFaults / (dellComputers.length || 1)) * 100 * 5)}%`, height: '100%', background: '#3a86ff' }}></div>
          </div>
        </div>

        <div className="card" style={{ padding: '1.25rem' }}>
          <div className="d-flex align-items-center justify-content-between mb-2">
            <span className="fw-bold" style={{ fontSize: '1.1rem' }}>HP EliteDesk</span>
            <span className="badge badge-secondary">{hpComputers.length} Deployed</span>
          </div>
          <div style={{ fontSize: '0.825rem', color: 'var(--text-muted)' }}>
            Recorded Faults: <strong>{hpFaults}</strong>
          </div>
          <div style={{ fontSize: '0.825rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
            Failure Rate: <strong>{((hpFaults / (hpComputers.length || 1)) * 100).toFixed(1)}%</strong>
          </div>
          <div style={{ height: '6px', background: 'var(--bg-surface-secondary)', borderRadius: '999px', overflow: 'hidden', marginTop: '0.75rem' }}>
            <div style={{ width: `${Math.min(100, (hpFaults / (hpComputers.length || 1)) * 100 * 5)}%`, height: '100%', background: '#10b981' }}></div>
          </div>
        </div>

        <div className="card" style={{ padding: '1.25rem' }}>
          <div className="d-flex align-items-center justify-content-between mb-2">
            <span className="fw-bold" style={{ fontSize: '1.1rem' }}>Lenovo ThinkCentre</span>
            <span className="badge badge-secondary">{lenovoComputers.length} Deployed</span>
          </div>
          <div style={{ fontSize: '0.825rem', color: 'var(--text-muted)' }}>
            Recorded Faults: <strong>{lenovoFaults}</strong>
          </div>
          <div style={{ fontSize: '0.825rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
            Failure Rate: <strong>{((lenovoFaults / (lenovoComputers.length || 1)) * 100).toFixed(1)}%</strong>
          </div>
          <div style={{ height: '6px', background: 'var(--bg-surface-secondary)', borderRadius: '999px', overflow: 'hidden', marginTop: '0.75rem' }}>
            <div style={{ width: `${Math.min(100, (lenovoFaults / (lenovoComputers.length || 1)) * 100 * 5)}%`, height: '100%', background: '#f59e0b' }}></div>
          </div>
        </div>
      </div>

      {/* Problem Breakdown Card */}
      <div className="card mb-4">
        <div className="card-header">
          <div className="card-title">
            <i className="fa-solid fa-chart-bar text-primary me-2"></i> Failure Distribution by Problem Type
          </div>
        </div>
        <div className="card-body">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
            {Object.entries(categoryCounts).map(([cat, count]) => {
              const pct = ((count / (complaints.length || 1)) * 100).toFixed(0);
              return (
                <div
                  key={cat}
                  style={{
                    padding: '1rem',
                    background: 'var(--bg-surface-secondary)',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-color)',
                  }}
                >
                  <div className="d-flex justify-content-between align-items-center mb-1">
                    <span className="fw-semibold text-main">{cat}</span>
                    <span className="badge badge-primary">{count} reports</span>
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.4rem' }}>
                    {pct}% of campus tickets
                  </div>
                  <div style={{ height: '6px', background: 'var(--border-color)', borderRadius: '999px', overflow: 'hidden' }}>
                    <div style={{ width: `${pct}%`, height: '100%', background: 'var(--primary)' }}></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Completed Maintenance Verification Records */}
      <div className="card">
        <div className="card-header">
          <div className="card-title">
            <i className="fa-solid fa-clipboard-check text-success me-2"></i> Verified Maintenance Log Book
          </div>
          <span className="badge badge-success">{maintenanceRecords.length} Completed Overhauls</span>
        </div>
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>Ticket</th>
                  <th>Technician</th>
                  <th>Diagnosis</th>
                  <th>Action Taken</th>
                  <th>Parts Replaced</th>
                  <th>Completion Time</th>
                  <th>Verification</th>
                </tr>
              </thead>
              <tbody>
                {maintenanceRecords.map((m) => (
                  <tr key={m.id}>
                    <td style={{ fontFamily: 'JetBrains Mono', fontWeight: 700, color: 'var(--primary)' }}>
                      {m.complaint_code}
                    </td>
                    <td className="fw-medium">{m.technician_name}</td>
                    <td>{m.diagnosis}</td>
                    <td>{m.action_taken}</td>
                    <td>
                      <span className="badge badge-secondary">{m.parts_replaced}</span>
                    </td>
                    <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{m.completed_at}</td>
                    <td>
                      <span className="badge badge-success">
                        <i className="fa-solid fa-check me-1"></i> {m.verification_status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
