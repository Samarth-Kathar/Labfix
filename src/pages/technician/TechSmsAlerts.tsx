import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';

export const TechSmsAlerts: React.FC = () => {
  const { currentUser, smsLogs, updateTechnicianPhone, showToast } = useApp();
  const [phoneInput, setPhoneInput] = useState(currentUser?.phone || '+1 (555) 567-8901');

  const mySms = smsLogs.filter((s) => s.recipient_user_id === currentUser?.id);

  const handlePhoneSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!phoneInput.trim()) return;
    updateTechnicianPhone(phoneInput.trim());
  };

  const handleTestSms = () => {
    showToast('SMS Dispatch Simulated', `Test alert dispatched to registered number: ${currentUser?.phone}`, 'success');
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Technician SMS Alert Center</h1>
          <p className="page-subtitle">
            Configure mobile alert destination and view live dispatched telecommunication notifications
          </p>
        </div>
        <button className="btn btn-outline" onClick={handleTestSms}>
          <i className="fa-solid fa-paper-plane me-1"></i> Send Test Alert to Mobile
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        {/* Phone Config Card */}
        <div className="card">
          <div className="card-header">
            <div className="card-title">
              <i className="fa-solid fa-mobile-screen-button text-primary me-2"></i> Registered Alert Phone
            </div>
            <span className="badge badge-success">Gateway Active</span>
          </div>

          <form onSubmit={handlePhoneSubmit}>
            <div className="card-body">
              <p className="text-muted mb-3" style={{ fontSize: '0.875rem' }}>
                Whenever a faculty member reports a <strong>High</strong> or <strong>Critical</strong> priority
                hardware fault in any lab, an automated carrier SMS is immediately dispatched to this number.
              </p>

              <div className="form-group">
                <label className="form-label">Technician Mobile Number</label>
                <div className="d-flex gap-2">
                  <input
                    type="text"
                    className="form-control"
                    placeholder="+1 (555) 000-0000"
                    value={phoneInput}
                    onChange={(e) => setPhoneInput(e.target.value)}
                    required
                  />
                  <button type="submit" className="btn btn-primary">
                    Update
                  </button>
                </div>
              </div>

              <div
                style={{
                  background: 'var(--bg-surface-secondary)',
                  padding: '1rem',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-color)',
                  fontSize: '0.8rem',
                  color: 'var(--text-muted)',
                }}
              >
                <div><strong>Technician Name:</strong> {currentUser?.full_name}</div>
                <div><strong>Department:</strong> {currentUser?.department}</div>
                <div><strong>Gateway Route:</strong> Telco High-Priority SMS API (NMIET Campus)</div>
              </div>
            </div>
          </form>
        </div>

        {/* SMS Device Mockup View */}
        <div className="card">
          <div className="card-header">
            <div className="card-title">
              <i className="fa-solid fa-messages text-cyan me-2"></i> Mobile Message Inbox ({mySms.length})
            </div>
            <span className="badge badge-primary">{currentUser?.phone}</span>
          </div>
          <div className="card-body p-0" style={{ maxHeight: '420px', overflowY: 'auto' }}>
            {mySms.length === 0 ? (
              <div className="p-4 text-center text-muted">
                <i className="fa-solid fa-comment-slash mb-2" style={{ fontSize: '2rem', opacity: 0.5 }}></i>
                <div>No SMS alerts received on this mobile number yet.</div>
              </div>
            ) : (
              <div style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {mySms.map((sms) => (
                  <div
                    key={sms.id}
                    style={{
                      background: 'var(--bg-surface-secondary)',
                      border: '1px solid var(--border-color)',
                      borderLeft: '4px solid #06b6d4',
                      borderRadius: 'var(--radius-md)',
                      padding: '0.85rem 1rem',
                    }}
                  >
                    <div className="d-flex align-items-center justify-content-between mb-1">
                      <div className="fw-bold" style={{ fontSize: '0.85rem', color: 'var(--primary)' }}>
                        <i className="fa-solid fa-tower-broadcast me-1"></i> LabFix Gateway
                      </div>
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                        {sms.sent_at}
                      </span>
                    </div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-main)', lineHeight: 1.4 }}>
                      {sms.message}
                    </div>
                    <div className="d-flex justify-content-between align-items-center mt-2" style={{ fontSize: '0.725rem', color: 'var(--text-muted)' }}>
                      <span>Ticket: <strong>{sms.complaint_code || 'N/A'}</strong></span>
                      <span className="text-success"><i className="fa-solid fa-check-double me-1"></i> {sms.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
