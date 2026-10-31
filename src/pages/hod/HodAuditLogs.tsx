import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';

export const HodAuditLogs: React.FC = () => {
  const { auditLogs } = useApp();
  const [search, setSearch] = useState('');

  const filtered = auditLogs.filter((log) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      log.action.toLowerCase().includes(q) ||
      (log.user_name || '').toLowerCase().includes(q) ||
      log.details.toLowerCase().includes(q) ||
      log.entity_type.toLowerCase().includes(q)
    );
  });

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Administrative & Operational Audit Logs</h1>
          <p className="page-subtitle">
            Immutable tracking of hardware decommissioning, ticket dispatch, repairs, and replacements
          </p>
        </div>
      </div>

      <div className="filter-bar">
        <div style={{ flex: 1, minWidth: '220px' }}>
          <input
            type="text"
            className="form-control"
            placeholder="Search action, user, or details..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        {search && (
          <button className="btn btn-outline" onClick={() => setSearch('')}>
            <i className="fa-solid fa-rotate-left"></i>
          </button>
        )}
      </div>

      <div className="card">
        <div className="card-header">
          <div className="card-title">
            <i className="fa-solid fa-clipboard-list text-primary me-2"></i> Audit Trail
          </div>
          <span className="badge badge-secondary">{filtered.length} Events Logged</span>
        </div>
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>Timestamp</th>
                  <th>Action</th>
                  <th>User / Operator</th>
                  <th>Entity Type</th>
                  <th>Details</th>
                  <th>IP Address</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((log) => (
                  <tr key={log.id}>
                    <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                      {log.created_at}
                    </td>
                    <td>
                      <span className="badge badge-primary" style={{ fontFamily: 'JetBrains Mono', fontSize: '0.75rem' }}>
                        {log.action}
                      </span>
                    </td>
                    <td>
                      <div className="fw-medium text-main">{log.user_name || `User #${log.user_id}`}</div>
                      <div className="text-muted" style={{ fontSize: '0.725rem' }}>
                        {log.user_role?.toUpperCase()}
                      </div>
                    </td>
                    <td>
                      <span className="badge badge-secondary">{log.entity_type}</span>
                    </td>
                    <td style={{ fontSize: '0.875rem', color: 'var(--text-main)', maxWidth: '400px' }}>
                      {log.details}
                    </td>
                    <td style={{ fontFamily: 'monospace', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      {log.ip_address}
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
