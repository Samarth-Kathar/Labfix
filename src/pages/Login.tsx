import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { UserRole } from '../types';

export const Login: React.FC = () => {
  const { login, users } = useApp();
  const [selectedRole, setSelectedRole] = useState<UserRole>('hod');
  const [username, setUsername] = useState('hod');
  const [password, setPassword] = useState('Password@123');
  const [showPassword, setShowPassword] = useState(false);

  const handleRoleTabClick = (role: UserRole) => {
    setSelectedRole(role);
    if (role === 'hod') {
      setUsername('hod');
    } else if (role === 'faculty') {
      setUsername('faculty');
    } else {
      setUsername('tech');
    }
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    login(username);
  };

  const handleQuickDemoClick = (uname: string) => {
    login(uname);
  };

  return (
    <div className="auth-wrapper">
      {/* Left Hero Side */}
      <div className="auth-hero-side">
        <div className="auth-brand">
          <div className="auth-brand-icon">
            <i className="fa-solid fa-microchip"></i>
          </div>
          <div>
            <div className="auth-brand-text">LabFix</div>
            <div style={{ fontSize: '0.75rem', color: '#38bdf8', fontWeight: 700, letterSpacing: '0.08em' }}>
              NMIET PUNE CAMPUS
            </div>
          </div>
        </div>

        <div className="auth-hero-content">
          <div className="hero-tag">
            <i className="fa-solid fa-shield-halved"></i>
            <span>Computing Infrastructure Portal</span>
          </div>
          <h1 className="auth-hero-title">
            Smart Lab Maintenance & <span>Hardware Asset Ops</span>
          </h1>
          <p className="auth-hero-desc">
            Centralized asset tracking across 18 computing laboratories and 360 workstations.
            Instant fault tickets, technician queue dispatch, and automated SMS alerts.
          </p>

          {/* Campus Image Showcase Card */}
          <div
            style={{
              marginTop: '1.75rem',
              borderRadius: 'var(--radius-lg)',
              overflow: 'hidden',
              border: '1px solid rgba(255, 255, 255, 0.25)',
              boxShadow: '0 12px 32px rgba(0, 0, 0, 0.45)',
              position: 'relative',
              maxWidth: '520px',
            }}
          >
            <img
              src="/nmiet_campus.jpg"
              alt="Nutan Maharashtra Institute of Engineering and Technology (NMIET) Campus, Pune"
              style={{
                width: '100%',
                height: '190px',
                objectFit: 'cover',
                display: 'block',
              }}
            />
            <div
              style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                background: 'linear-gradient(to top, rgba(11, 19, 43, 0.95) 0%, rgba(11, 19, 43, 0.6) 65%, transparent 100%)',
                padding: '0.75rem 1.1rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div>
                <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#ffffff' }}>
                  NMIET Campus Building
                </div>
                <div style={{ fontSize: '0.725rem', color: '#38bdf8' }}>
                  Nutan Maharashtra Institute of Engineering and Technology, Pune
                </div>
              </div>
              <span className="badge badge-primary" style={{ fontSize: '0.65rem' }}>
                <i className="fa-solid fa-location-dot me-1"></i> Talegaon, Pune
              </span>
            </div>
          </div>
        </div>

        <div className="auth-hero-footer">
          <div><i className="fa-solid fa-server me-1 text-cyan"></i> 360 Active Workstations</div>
          <div><i className="fa-solid fa-bolt me-1 text-cyan"></i> Real-Time SMS Routing</div>
          <div><i className="fa-solid fa-building-columns me-1 text-cyan"></i> 18 Computer Labs</div>
        </div>
      </div>

      {/* Right Form Side */}
      <div className="auth-form-side">
        <div className="auth-card">
          {/* Top Campus Card Banner */}
          <div
            style={{
              marginBottom: '1.5rem',
              borderRadius: 'var(--radius-md)',
              overflow: 'hidden',
              border: '1px solid var(--border-color)',
              boxShadow: 'var(--card-shadow)',
              position: 'relative',
            }}
          >
            <img
              src="/nmiet_campus.jpg"
              alt="NMIET Campus"
              style={{
                width: '100%',
                height: '120px',
                objectFit: 'cover',
                display: 'block',
              }}
            />
            <div
              style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                background: 'linear-gradient(to top, rgba(15, 23, 42, 0.85) 0%, transparent 100%)',
                padding: '0.5rem 0.85rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#ffffff' }}>
                <i className="fa-solid fa-building-columns me-1 text-cyan"></i> NMIET Campus
              </div>
              <span style={{ fontSize: '0.7rem', color: '#cbd5e1' }}>Talegaon Dabhade, Pune</span>
            </div>
          </div>

          <div className="auth-header">
            <h2 className="auth-title">Welcome to LabFix</h2>
            <div className="auth-subtitle">Select your role or enter credentials to access your portal</div>
          </div>

          {/* Role Tabs */}
          <div className="role-tabs">
            <div
              className={`role-tab ${selectedRole === 'hod' ? 'active' : ''}`}
              onClick={() => handleRoleTabClick('hod')}
            >
              <i className="fa-solid fa-crown me-1"></i> HOD
            </div>
            <div
              className={`role-tab ${selectedRole === 'faculty' ? 'active' : ''}`}
              onClick={() => handleRoleTabClick('faculty')}
            >
              <i className="fa-solid fa-chalkboard-user me-1"></i> Faculty
            </div>
            <div
              className={`role-tab ${selectedRole === 'technician' ? 'active' : ''}`}
              onClick={() => handleRoleTabClick('technician')}
            >
              <i className="fa-solid fa-screwdriver-wrench me-1"></i> Technician
            </div>
          </div>

          <form onSubmit={handleLoginSubmit}>
            <div className="form-group">
              <label className="form-label">Username or College Email</label>
              <input
                type="text"
                className="form-control"
                placeholder="Enter username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <div className="password-input-group" style={{ position: 'relative' }}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="form-control"
                  placeholder="Enter password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  className="password-toggle-btn"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  <i className={showPassword ? 'fa-solid fa-eye-slash' : 'fa-solid fa-eye'}></i>
                </button>
              </div>
            </div>

            <button type="submit" className="btn btn-primary w-100 btn-lg mt-3">
              <i className="fa-solid fa-arrow-right-to-bracket"></i> Sign In to LabFix
            </button>
          </form>

          {/* 1-Click Demo Accounts */}
          <div className="demo-accounts-panel">
            <div className="demo-title">
              <span>Quick Demo Personas</span>
              <span className="badge badge-primary">Instant Access</span>
            </div>
            <div className="demo-buttons-row">
              <button
                type="button"
                className="demo-btn"
                onClick={() => handleQuickDemoClick('hod')}
                title="HOD - Dr. Sarah Jenkins"
              >
                HOD
              </button>
              <button
                type="button"
                className="demo-btn"
                onClick={() => handleQuickDemoClick('faculty')}
                title="Faculty - Prof. Alan Turing"
              >
                Prof. Turing
              </button>
              <button
                type="button"
                className="demo-btn"
                onClick={() => handleQuickDemoClick('faculty2')}
                title="Faculty - Dr. Grace Hopper"
              >
                Dr. Hopper
              </button>
              <button
                type="button"
                className="demo-btn"
                onClick={() => handleQuickDemoClick('tech')}
                title="Technician - Alex Rivera"
              >
                Tech Alex
              </button>
              <button
                type="button"
                className="demo-btn"
                onClick={() => handleQuickDemoClick('tech2')}
                title="Technician - Marcus Vance"
              >
                Tech Marcus
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
