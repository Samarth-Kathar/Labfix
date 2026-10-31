import React, { useState } from 'react';
import { useApp } from './context/AppContext';
import { Sidebar } from './components/Sidebar';
import { Topbar } from './components/Topbar';
import { ToastContainer } from './components/ToastContainer';
import { ComplaintDetailModal } from './components/ComplaintDetailModal';
import { ResolveModal } from './components/ResolveModal';

import { Login } from './pages/Login';
import { HodDashboard } from './pages/hod/HodDashboard';
import { HodInfrastructure } from './pages/hod/HodInfrastructure';
import { HodComplaints } from './pages/hod/HodComplaints';
import { HodHealth } from './pages/hod/HodHealth';
import { HodTechnicians } from './pages/hod/HodTechnicians';
import { HodReports } from './pages/hod/HodReports';
import { HodAuditLogs } from './pages/hod/HodAuditLogs';
import { HodSmsLogs } from './pages/hod/HodSmsLogs';

import { FacultyDashboard } from './pages/faculty/FacultyDashboard';
import { FacultyReportFault } from './pages/faculty/FacultyReportFault';
import { FacultyComplaints } from './pages/faculty/FacultyComplaints';

import { TechDashboard } from './pages/technician/TechDashboard';
import { TechSmsAlerts } from './pages/technician/TechSmsAlerts';
import { TechHistory } from './pages/technician/TechHistory';

import { InventoryList } from './pages/inventory/InventoryList';
import { InventoryAdd } from './pages/inventory/InventoryAdd';
import { InventoryDetail } from './pages/inventory/InventoryDetail';
import { InventoryReplace } from './pages/inventory/InventoryReplace';

import { Complaint } from './types';

export const AppContent: React.FC = () => {
  const {
    currentUser,
    currentView,
    selectedComplaintCode,
    setSelectedComplaintCode,
  } = useApp();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [resolvingComplaint, setResolvingComplaint] = useState<Complaint | null>(null);

  if (!currentUser || currentView === 'login') {
    return (
      <>
        <Login />
        <ToastContainer />
      </>
    );
  }

  const handleOpenComplaint = (code: string) => {
    setSelectedComplaintCode(code);
  };

  const handleCloseComplaint = () => {
    setSelectedComplaintCode(null);
  };

  const handleOpenResolve = (complaint: Complaint) => {
    setSelectedComplaintCode(null);
    setResolvingComplaint(complaint);
  };

  const renderCurrentView = () => {
    switch (currentView) {
      // HOD Views
      case 'overview':
        return <HodDashboard onOpenComplaint={handleOpenComplaint} />;
      case 'hod-infrastructure':
        return <HodInfrastructure />;
      case 'hod-complaints':
        return <HodComplaints onOpenComplaint={handleOpenComplaint} />;
      case 'hod-health':
        return <HodHealth />;
      case 'hod-technicians':
        return <HodTechnicians onOpenComplaint={handleOpenComplaint} />;
      case 'hod-reports':
        return <HodReports />;
      case 'hod-audit-logs':
        return <HodAuditLogs />;
      case 'hod-sms-logs':
        return <HodSmsLogs />;

      // Faculty Views
      case 'faculty-dashboard':
        return <FacultyDashboard onOpenComplaint={handleOpenComplaint} />;
      case 'faculty-report':
        return <FacultyReportFault onOpenComplaint={handleOpenComplaint} />;
      case 'faculty-complaints':
        return <FacultyComplaints onOpenComplaint={handleOpenComplaint} />;

      // Technician Views
      case 'tech-dashboard':
        return (
          <TechDashboard
            onOpenComplaint={handleOpenComplaint}
            onOpenResolve={handleOpenResolve}
          />
        );
      case 'tech-sms':
        return <TechSmsAlerts />;
      case 'tech-history':
        return <TechHistory onOpenComplaint={handleOpenComplaint} />;

      // Inventory Operations
      case 'inventory-list':
        return <InventoryList />;
      case 'inventory-add':
        return <InventoryAdd />;
      case 'inventory-detail':
        return <InventoryDetail onOpenComplaint={handleOpenComplaint} />;
      case 'inventory-replace':
        return <InventoryReplace />;

      default:
        return <HodDashboard onOpenComplaint={handleOpenComplaint} />;
    }
  };

  return (
    <div className="dashboard-layout">
      <Sidebar mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />

      {mobileOpen && (
        <div
          className="sidebar-backdrop"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <div className="main-wrapper">
        <Topbar setMobileOpen={setMobileOpen} />
        {renderCurrentView()}
      </div>

      {/* Ticket Details Inspection Modal */}
      {selectedComplaintCode && (
        <ComplaintDetailModal
          complaintCode={selectedComplaintCode}
          onClose={handleCloseComplaint}
          onOpenResolve={handleOpenResolve}
        />
      )}

      {/* Technician Resolve Modal */}
      {resolvingComplaint && (
        <ResolveModal
          complaint={resolvingComplaint}
          onClose={() => setResolvingComplaint(null)}
        />
      )}

      <ToastContainer />
    </div>
  );
};
