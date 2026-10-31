import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';

export const HodSmsLogs: React.FC = () => {
  const { smsLogs } = useApp();
  const [filterRecipient, setFilterRecipient] = useState('');

  const filtered = smsLogs.filter((s) => {
    if (filterRecipient && !s.recipient_name.toLowerCase().includes(filterRecipient.toLowerCase())) {
      return false;
    }
    return true;
  });

  const total = smsLogs.length;
  const delivered = smsLogs.filter((s) => s.status === 'DELIVERED' || s.status === 'SENT').length;

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">SMS Alert Dispatch Logs</h1>
          <p className="page-subtitle">
            Carrier gateway transmission records, emergency technician alerts, and SMS receipts
          </p>
        </div>
      </div>

      <div className="stats-grid mb-4">
        <div className="stat-card stat-blue">
          <div>
            <div className="stat-label">Total SMS Dispatched</div>
            <div className="stat-value">{total}</div>
            <div className="stat-subtext">Automatic Alert Triggers</div>
          </div>
          <div className="stat-icon blue">
            <i className="fa-solid fa-comment-sms"></i>
          </div>
        </div>

        <div className="stat-card stat-green">
          <div>
            <div className="stat-label">Successfully Delivered</div>
            <div className="stat-value">{delivered}</div>
            <div className="stat-subtext">100% Delivery Success</div>
          </div>
          <div className="stat-icon green">
            <i className="fa-solid fa-check-double"></i>
          </div>
        </div>

        <div className="stat-card stat-cyan">
          <div>
            <div className="stat-label">SMS Gateway</div>
            <div className="stat-value" style={{ fontSize: '1.4rem', marginTop: '0.4rem' }}>
              TELCO API
            </div>
            <div className="stat-subtext">Low-latency Priority Route</div>
          </div>
          <div className="stat-icon cyan">
            <i className="fa-solid fa-tower-broadcast"></i>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <div className="card-title">
            <i className="fa-solid fa-clock-rotate-left text-primary me-2"></i> Transmission History
          </div>
          <span className="badge badge-secondary">{filtered.length} Dispatches</span>
        </div>
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>Dispatch Time</th>
                  <th>Ticket</th>
                  <th>Recipient Technician</th>
                  <th>Phone Number</th>
                  <th>Message Body</th>
                  <th>Status</th>
                  <th>Gateway Details</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((s) => (
                  <tr key={s.id}>
                    <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                      {s.sent_at}
                    </td>
                    <td>
                      <span className="badge badge-primary" style={{ fontFamily: 'JetBrains Mono' }}>
                        {s.complaint_code || 'LF-ALERT'}
                      </span>
                    </td>
                    <td className="fw-medium text-main">{s.recipient_name}</td>
                    <td style={{ fontFamily: 'monospace', fontSize: '0.85rem' }}>{s.recipient_phone}</td>
                    <td style={{ fontSize: '0.85rem', color: 'var(--text-main)', maxWidth: '380px' }}>
                      {s.message}
                    </td>
                    <td>
                      <span className="badge badge-success">
                        <i className="fa-solid fa-check me-1"></i> {s.status}
                      </span>
                    </td>
                    <td style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      {s.gateway_provider}
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
