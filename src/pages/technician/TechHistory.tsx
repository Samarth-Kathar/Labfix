import React from 'react';
import { useApp } from '../../context/AppContext';

interface TechHistoryProps {
  onOpenComplaint: (code: string) => void;
}

export const TechHistory: React.FC<TechHistoryProps> = ({ onOpenComplaint }) => {
  const { currentUser, maintenanceRecords, complaints } = useApp();

  const myRecords = maintenanceRecords.filter((m) => m.technician_id === currentUser?.id);

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Personal Repair History & Archive</h1>
          <p className="page-subtitle">
            All workstation overhauls, diagnostic reports, and hardware replacements signed off by {currentUser?.full_name}
          </p>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <div className="card-title">
            <i className="fa-solid fa-clock-rotate-left text-primary me-2"></i> Completed Repair Log
          </div>
          <span className="badge badge-success">{myRecords.length} Completed Repairs</span>
        </div>
        <div className="card-body p-0">
          {myRecords.length === 0 ? (
            <div className="p-5 text-center text-muted">
              <i className="fa-solid fa-wrench mb-2" style={{ fontSize: '2.5rem', opacity: 0.5 }}></i>
              <h4>No Repair History Recorded</h4>
              <p>When you resolve tickets in the queue, your maintenance logs will be logged here.</p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table">
                <thead>
                  <tr>
                    <th>Ticket Code</th>
                    <th>Diagnosis</th>
                    <th>Action Taken</th>
                    <th>Parts Replaced</th>
                    <th>Solution Description</th>
                    <th>Completed Time</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {myRecords.map((m) => {
                    const complaint = complaints.find((c) => c.id === m.complaint_id);
                    return (
                      <tr key={m.id}>
                        <td style={{ fontFamily: 'JetBrains Mono', fontWeight: 700, color: 'var(--primary)' }}>
                          {m.complaint_code || complaint?.complaint_code}
                        </td>
                        <td className="fw-medium text-main" style={{ maxWidth: '200px' }}>
                          {m.diagnosis}
                        </td>
                        <td style={{ maxWidth: '220px' }}>{m.action_taken}</td>
                        <td>
                          <span className="badge badge-secondary">{m.parts_replaced}</span>
                        </td>
                        <td style={{ maxWidth: '240px', fontSize: '0.85rem' }}>{m.solution_description}</td>
                        <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                          {m.completed_at}
                        </td>
                        <td>
                          {complaint && (
                            <button
                              className="btn btn-outline btn-sm"
                              onClick={() => onOpenComplaint(complaint.complaint_code)}
                            >
                              <i className="fa-solid fa-eye me-1"></i> Review
                            </button>
                          )}
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
