import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  User,
  Wing,
  Floor,
  Laboratory,
  Computer,
  Complaint,
  MaintenanceRecord,
  Notification,
  AuditLog,
  SMSLog,
  ComputerReplacement,
  ComputerStatus,
  ComplaintPriority,
} from '../types';
import {
  INITIAL_USERS,
  INITIAL_WINGS,
  generateInitialFloorsAndLabs,
  generateInitialComputers,
  INITIAL_COMPLAINTS,
  INITIAL_MAINTENANCE,
  INITIAL_NOTIFICATIONS,
  INITIAL_AUDIT_LOGS,
  INITIAL_SMS_LOGS,
} from '../data/seedData';

export interface ToastItem {
  id: string;
  title: string;
  message: string;
  type: 'success' | 'danger' | 'warning' | 'info';
}

interface AppContextType {
  currentUser: User | null;
  users: User[];
  wings: Wing[];
  floors: Floor[];
  laboratories: Laboratory[];
  computers: Computer[];
  complaints: Complaint[];
  maintenanceRecords: MaintenanceRecord[];
  notifications: Notification[];
  auditLogs: AuditLog[];
  smsLogs: SMSLog[];
  replacements: ComputerReplacement[];
  theme: 'light' | 'dark';
  toasts: ToastItem[];
  currentView: string;
  selectedComplaintCode: string | null;
  selectedComputerId: number | null;
  // Actions
  setCurrentView: (view: string) => void;
  setSelectedComplaintCode: (code: string | null) => void;
  setSelectedComputerId: (id: number | null) => void;
  login: (username: string) => boolean;
  logout: () => void;
  switchUser: (userId: number) => void;
  toggleTheme: () => void;
  showToast: (title: string, message: string, type?: 'success' | 'danger' | 'warning' | 'info') => void;
  removeToast: (id: string) => void;
  markNotificationRead: (id: number) => void;
  markAllNotificationsRead: () => void;
  createComplaint: (data: {
    computer_id: number;
    problem_category: string;
    priority: ComplaintPriority;
    description: string;
    attachment_filename?: string;
  }) => Complaint;
  acceptComplaint: (complaintId: number) => { success: boolean; message: string };
  startRepair: (complaintId: number) => { success: boolean; message: string };
  resolveComplaint: (
    complaintId: number,
    data: {
      diagnosis: string;
      action_taken: string;
      parts_replaced: string;
      solution_description: string;
      repair_notes: string;
      computer_operational_status: ComputerStatus;
    }
  ) => { success: boolean; message: string };
  updateTechnicianPhone: (newPhone: string) => void;
  addComputer: (data: Omit<Computer, 'id' | 'is_active' | 'operational_status'>) => Computer;
  decommissionComputer: (computerId: number, reason: string) => void;
  replaceComputer: (
    oldComputerId: number,
    newData: {
      computer_id_code: string;
      brand: string;
      model: string;
      serial_number: string;
      processor: string;
      ram: string;
      storage: string;
      os: string;
      reason: string;
      notes?: string;
    }
  ) => Computer;
  resetToDemoDefaults: () => void;
}

const STORAGE_KEY = 'labfix_state_v1';

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Theme initialization
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const saved = localStorage.getItem('labfix_theme');
    return saved === 'dark' ? 'dark' : 'light';
  });

  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const [currentView, setCurrentView] = useState<string>('overview');
  const [selectedComplaintCode, setSelectedComplaintCode] = useState<string | null>(null);
  const [selectedComputerId, setSelectedComputerId] = useState<number | null>(null);

  // Core Data State
  const [users, setUsers] = useState<User[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_users`);
    return saved ? JSON.parse(saved) : INITIAL_USERS;
  });

  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_current_user`);
    if (saved) return JSON.parse(saved);
    return users.find((u) => u.role === 'hod') || users[0];
  });

  const [wings] = useState<Wing[]>(INITIAL_WINGS);

  const [floors] = useState<Floor[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_floors`);
    if (saved) return JSON.parse(saved);
    const { floors } = generateInitialFloorsAndLabs();
    return floors;
  });

  const [laboratories] = useState<Laboratory[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_laboratories`);
    if (saved) return JSON.parse(saved);
    const { laboratories } = generateInitialFloorsAndLabs();
    return laboratories;
  });

  const [computers, setComputers] = useState<Computer[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_computers`);
    if (saved) return JSON.parse(saved);
    const comps = generateInitialComputers(wings, floors, laboratories);
    // Apply demo initial statuses
    // COMP-A1-01-PC-05 -> Fault Reported
    const c5 = comps.find((c) => c.computer_id_code === 'COMP-A1-01-PC-05');
    if (c5) c5.operational_status = 'Fault Reported';
    // COMP-B2-01-PC-12 -> Fault Reported
    const c12 = comps.find((c) => c.computer_id_code === 'COMP-B2-01-PC-12');
    if (c12) c12.operational_status = 'Fault Reported';
    // COMP-C3-02-PC-08 -> Under Repair
    const c8 = comps.find((c) => c.computer_id_code === 'COMP-C3-02-PC-08');
    if (c8) c8.operational_status = 'Under Repair';
    // COMP-A2-02-PC-03 -> Repaired
    const c3 = comps.find((c) => c.computer_id_code === 'COMP-A2-02-PC-03');
    if (c3) {
      c3.operational_status = 'Repaired';
      c3.last_maintenance_date = '2026-10-08 13:45:00';
    }
    // COMP-B1-02-PC-18 -> Working (Repaired)
    const c18 = comps.find((c) => c.computer_id_code === 'COMP-B1-02-PC-18');
    if (c18) {
      c18.operational_status = 'Working';
      c18.last_maintenance_date = '2026-10-07 16:15:00';
    }
    return comps;
  });

  const [complaints, setComplaints] = useState<Complaint[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_complaints`);
    return saved ? JSON.parse(saved) : INITIAL_COMPLAINTS;
  });

  const [maintenanceRecords, setMaintenanceRecords] = useState<MaintenanceRecord[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_maintenance`);
    return saved ? JSON.parse(saved) : INITIAL_MAINTENANCE;
  });

  const [notifications, setNotifications] = useState<Notification[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_notifications`);
    return saved ? JSON.parse(saved) : INITIAL_NOTIFICATIONS;
  });

  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_audit`);
    return saved ? JSON.parse(saved) : INITIAL_AUDIT_LOGS;
  });

  const [smsLogs, setSmsLogs] = useState<SMSLog[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_sms`);
    return saved ? JSON.parse(saved) : INITIAL_SMS_LOGS;
  });

  const [replacements, setReplacements] = useState<ComputerReplacement[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_replacements`);
    return saved ? JSON.parse(saved) : [];
  });

  // Sync theme attribute
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('labfix_theme', theme);
  }, [theme]);

  // Persist core state
  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_users`, JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem(`${STORAGE_KEY}_current_user`, JSON.stringify(currentUser));
    } else {
      localStorage.removeItem(`${STORAGE_KEY}_current_user`);
    }
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_computers`, JSON.stringify(computers));
  }, [computers]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_complaints`, JSON.stringify(complaints));
  }, [complaints]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_maintenance`, JSON.stringify(maintenanceRecords));
  }, [maintenanceRecords]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_notifications`, JSON.stringify(notifications));
  }, [notifications]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_audit`, JSON.stringify(auditLogs));
  }, [auditLogs]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_sms`, JSON.stringify(smsLogs));
  }, [smsLogs]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_replacements`, JSON.stringify(replacements));
  }, [replacements]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  const showToast = (
    title: string,
    message: string,
    type: 'success' | 'danger' | 'warning' | 'info' = 'info'
  ) => {
    const id = `${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    setToasts((prev) => [...prev, { id, title, message, type }]);
    setTimeout(() => {
      removeToast(id);
    }, 4500);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const login = (username: string) => {
    const user = users.find(
      (u) =>
        u.username.toLowerCase() === username.toLowerCase() ||
        u.email.toLowerCase() === username.toLowerCase()
    );
    if (user) {
      setCurrentUser(user);
      // Auto-navigate to appropriate home
      if (user.role === 'hod') setCurrentView('overview');
      else if (user.role === 'faculty') setCurrentView('faculty-dashboard');
      else setCurrentView('tech-dashboard');

      showToast('Welcome back', `Signed in as ${user.full_name} (${user.role.toUpperCase()})`, 'success');
      return true;
    }
    showToast('Login Failed', 'Invalid username or credentials.', 'danger');
    return false;
  };

  const logout = () => {
    setCurrentUser(null);
    setCurrentView('login');
    showToast('Logged Out', 'You have been securely signed out.', 'info');
  };

  const switchUser = (userId: number) => {
    const user = users.find((u) => u.id === userId);
    if (user) {
      setCurrentUser(user);
      if (user.role === 'hod') setCurrentView('overview');
      else if (user.role === 'faculty') setCurrentView('faculty-dashboard');
      else setCurrentView('tech-dashboard');
      showToast('Switched User', `Active profile: ${user.full_name} [${user.role.toUpperCase()}]`, 'info');
    }
  };

  const markNotificationRead = (id: number) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, is_read: 1 } : n))
    );
  };

  const markAllNotificationsRead = () => {
    if (!currentUser) return;
    setNotifications((prev) =>
      prev.map((n) =>
        n.user_id === currentUser.id || (!n.user_id && n.target_role === currentUser.role)
          ? { ...n, is_read: 1 }
          : n
      )
    );
    showToast('Notifications Cleared', 'All notifications marked as read.', 'info');
  };

  const createComplaint = (data: {
    computer_id: number;
    problem_category: string;
    priority: ComplaintPriority;
    description: string;
    attachment_filename?: string;
  }): Complaint => {
    const comp = computers.find((c) => c.id === data.computer_id);
    const now = new Date();
    const dateStr = now.toISOString().replace('T', ' ').substring(0, 19);

    // Generate code
    const maxId = complaints.reduce((max, c) => Math.max(max, c.id), 0);
    const nextId = maxId + 1;
    const nextCode = `LF-${(1000 + nextId).toString()}`;

    const faculty = currentUser || users[1];

    const newComplaint: Complaint = {
      id: nextId,
      complaint_code: nextCode,
      faculty_id: faculty.id,
      faculty_name: faculty.full_name,
      faculty_email: faculty.email,
      computer_id: data.computer_id,
      computer_id_code: comp?.computer_id_code || `COMP-${data.computer_id}`,
      pc_number: comp?.pc_number || 'PC-??',
      lab_code: comp?.lab_code || '',
      lab_name: comp?.lab_name || '',
      floor_name: comp?.floor_name || '',
      wing_name: comp?.wing_name || '',
      problem_category: data.problem_category,
      priority: data.priority,
      description: data.description,
      status: 'Pending',
      attachment_filename: data.attachment_filename || null,
      reported_at: dateStr,
      accepted_at: null,
      resolved_at: null,
      assigned_technician_id: null,
    };

    setComplaints((prev) => [newComplaint, ...prev]);

    // Update computer status
    setComputers((prev) =>
      prev.map((c) =>
        c.id === data.computer_id ? { ...c, operational_status: 'Fault Reported' } : c
      )
    );

    // Add In-App Notifications
    const newNotifs: Notification[] = [
      {
        id: Date.now(),
        target_role: 'technician',
        title: `New ${data.priority} Complaint: ${nextCode}`,
        message: `${data.problem_category} reported by ${faculty.full_name} in ${comp?.lab_code} (${comp?.pc_number}).`,
        link: 'tech-dashboard',
        type: 'complaint_new',
        is_read: 0,
        created_at: dateStr,
      },
      {
        id: Date.now() + 1,
        target_role: 'hod',
        title: `New Complaint Filed: ${nextCode}`,
        message: `Priority: ${data.priority} | ${data.problem_category} in ${comp?.lab_code}.`,
        link: 'hod-complaints',
        type: 'complaint_new',
        is_read: 0,
        created_at: dateStr,
      },
    ];
    setNotifications((prev) => [...newNotifs, ...prev]);

    // Simulated SMS Dispatch to Technicians
    const technicians = users.filter((u) => u.role === 'technician');
    const newSmsLogs: SMSLog[] = technicians.map((tech, idx) => ({
      id: Date.now() + idx,
      complaint_id: nextId,
      complaint_code: nextCode,
      recipient_user_id: tech.id,
      recipient_name: tech.full_name,
      recipient_phone: tech.phone,
      message: `[LabFix Alert] ${data.priority.toUpperCase()} FAULT ${nextCode} raised in Lab ${comp?.lab_code} (${comp?.pc_number}). Category: ${data.problem_category}. Reported by ${faculty.full_name}.`,
      gateway_provider: 'SIMULATED-TELCO-GATEWAY',
      status: 'DELIVERED',
      response_data: JSON.stringify({ status: 'delivered', msg_id: `sms_${Date.now()}_${idx}` }),
      sent_at: dateStr,
    }));
    setSmsLogs((prev) => [...newSmsLogs, ...prev]);

    // Audit Log
    const newAudit: AuditLog = {
      id: Date.now(),
      user_id: faculty.id,
      user_name: faculty.full_name,
      user_role: faculty.role,
      action: 'REPORT_FAULT',
      entity_type: 'COMPLAINT',
      entity_id: nextId.toString(),
      details: `Raised ${nextCode} for ${comp?.computer_id_code} (Category: ${data.problem_category}, Priority: ${data.priority})`,
      ip_address: '10.0.4.12',
      created_at: dateStr,
    };
    setAuditLogs((prev) => [newAudit, ...prev]);

    showToast('Fault Ticket Raised', `${nextCode} filed successfully. Technicians alerted via SMS.`, 'success');

    return newComplaint;
  };

  const acceptComplaint = (complaintId: number) => {
    const complaint = complaints.find((c) => c.id === complaintId);
    if (!complaint) return { success: false, message: 'Complaint not found.' };
    if (complaint.status !== 'Pending') {
      return { success: false, message: `Ticket is already ${complaint.status}.` };
    }

    const tech = currentUser || users.find((u) => u.role === 'technician') || users[3];
    const nowStr = new Date().toISOString().replace('T', ' ').substring(0, 19);

    setComplaints((prev) =>
      prev.map((c) =>
        c.id === complaintId
          ? {
              ...c,
              status: 'Accepted',
              assigned_technician_id: tech.id,
              technician_name: tech.full_name,
              accepted_at: nowStr,
            }
          : c
      )
    );

    // Notify faculty
    setNotifications((prev) => [
      {
        id: Date.now(),
        user_id: complaint.faculty_id,
        target_role: 'faculty',
        title: `Complaint Accepted (${complaint.complaint_code})`,
        message: `${tech.full_name} accepted your complaint and will attend to it shortly.`,
        link: 'faculty-complaints',
        type: 'complaint_assigned',
        is_read: 0,
        created_at: nowStr,
      },
      ...prev,
    ]);

    // Audit
    setAuditLogs((prev) => [
      {
        id: Date.now(),
        user_id: tech.id,
        user_name: tech.full_name,
        user_role: tech.role,
        action: 'ACCEPT_COMPLAINT',
        entity_type: 'COMPLAINT',
        entity_id: complaintId.toString(),
        details: `Technician ${tech.full_name} claimed ticket ${complaint.complaint_code}`,
        ip_address: '10.0.8.21',
        created_at: nowStr,
      },
      ...prev,
    ]);

    showToast('Ticket Claimed', `You have accepted ${complaint.complaint_code}.`, 'success');
    return { success: true, message: 'Complaint accepted successfully.' };
  };

  const startRepair = (complaintId: number) => {
    const complaint = complaints.find((c) => c.id === complaintId);
    if (!complaint) return { success: false, message: 'Complaint not found.' };

    const tech = currentUser || users.find((u) => u.role === 'technician') || users[3];
    const nowStr = new Date().toISOString().replace('T', ' ').substring(0, 19);

    setComplaints((prev) =>
      prev.map((c) => (c.id === complaintId ? { ...c, status: 'In Progress' } : c))
    );

    setComputers((prev) =>
      prev.map((comp) =>
        comp.id === complaint.computer_id ? { ...comp, operational_status: 'Under Repair' } : comp
      )
    );

    // Notify faculty
    setNotifications((prev) => [
      {
        id: Date.now(),
        user_id: complaint.faculty_id,
        target_role: 'faculty',
        title: `Repair In Progress (${complaint.complaint_code})`,
        message: `Technician ${tech.full_name} is actively troubleshooting and fixing the computer.`,
        link: 'faculty-complaints',
        type: 'complaint_in_progress',
        is_read: 0,
        created_at: nowStr,
      },
      ...prev,
    ]);

    // Audit
    setAuditLogs((prev) => [
      {
        id: Date.now(),
        user_id: tech.id,
        user_name: tech.full_name,
        user_role: tech.role,
        action: 'START_REPAIR',
        entity_type: 'COMPLAINT',
        entity_id: complaintId.toString(),
        details: `Technician ${tech.full_name} started repair on ${complaint.complaint_code}`,
        ip_address: '10.0.8.21',
        created_at: nowStr,
      },
      ...prev,
    ]);

    showToast('Repair Underway', `${complaint.complaint_code} marked as In Progress.`, 'info');
    return { success: true, message: 'Repair marked In Progress.' };
  };

  const resolveComplaint = (
    complaintId: number,
    data: {
      diagnosis: string;
      action_taken: string;
      parts_replaced: string;
      solution_description: string;
      repair_notes: string;
      computer_operational_status: ComputerStatus;
    }
  ) => {
    const complaint = complaints.find((c) => c.id === complaintId);
    if (!complaint) return { success: false, message: 'Complaint not found.' };

    const tech = currentUser || users.find((u) => u.role === 'technician') || users[3];
    const nowStr = new Date().toISOString().replace('T', ' ').substring(0, 19);

    // 1. Update complaint
    setComplaints((prev) =>
      prev.map((c) =>
        c.id === complaintId
          ? {
              ...c,
              status: 'Resolved',
              resolved_at: nowStr,
            }
          : c
      )
    );

    // 2. Add Maintenance Record
    const nextMaintId = maintenanceRecords.reduce((max, m) => Math.max(max, m.id), 0) + 1;
    const newRecord: MaintenanceRecord = {
      id: nextMaintId,
      complaint_id: complaintId,
      complaint_code: complaint.complaint_code,
      computer_id: complaint.computer_id,
      technician_id: tech.id,
      technician_name: tech.full_name,
      diagnosis: data.diagnosis,
      action_taken: data.action_taken,
      parts_replaced: data.parts_replaced || 'None',
      solution_description: data.solution_description,
      repair_notes: data.repair_notes || '',
      started_at: complaint.accepted_at || nowStr,
      completed_at: nowStr,
      verification_status: 'Verified',
    };
    setMaintenanceRecords((prev) => [newRecord, ...prev]);

    // 3. Update computer
    setComputers((prev) =>
      prev.map((comp) =>
        comp.id === complaint.computer_id
          ? {
              ...comp,
              operational_status: data.computer_operational_status,
              last_maintenance_date: nowStr,
            }
          : comp
      )
    );

    // 4. Notifications
    setNotifications((prev) => [
      {
        id: Date.now(),
        user_id: complaint.faculty_id,
        target_role: 'faculty',
        title: `Problem Resolved: ${complaint.complaint_code}`,
        message: `Your issue was resolved. Solution: ${data.solution_description.substring(0, 75)}...`,
        link: 'faculty-complaints',
        type: 'complaint_resolved',
        is_read: 0,
        created_at: nowStr,
      },
      {
        id: Date.now() + 1,
        target_role: 'hod',
        title: `Complaint Resolved: ${complaint.complaint_code}`,
        message: `${tech.full_name} resolved issue on ${complaint.computer_id_code}.`,
        link: 'hod-complaints',
        type: 'complaint_resolved',
        is_read: 0,
        created_at: nowStr,
      },
      ...prev,
    ]);

    // 5. Audit
    setAuditLogs((prev) => [
      {
        id: Date.now(),
        user_id: tech.id,
        user_name: tech.full_name,
        user_role: tech.role,
        action: 'RESOLVE_COMPLAINT',
        entity_type: 'COMPLAINT',
        entity_id: complaintId.toString(),
        details: `Technician ${tech.full_name} resolved ${complaint.complaint_code} (Status: ${data.computer_operational_status})`,
        ip_address: '10.0.8.21',
        created_at: nowStr,
      },
      ...prev,
    ]);

    showToast('Workstation Repaired', `${complaint.complaint_code} resolved and maintenance logged.`, 'success');
    return { success: true, message: 'Complaint resolved successfully.' };
  };

  const updateTechnicianPhone = (newPhone: string) => {
    if (!currentUser) return;
    const cleanPhone = newPhone.trim();
    setUsers((prev) =>
      prev.map((u) => (u.id === currentUser.id ? { ...u, phone: cleanPhone } : u))
    );
    setCurrentUser((prev) => (prev ? { ...prev, phone: cleanPhone } : prev));

    setAuditLogs((prev) => [
      {
        id: Date.now(),
        user_id: currentUser.id,
        user_name: currentUser.full_name,
        user_role: currentUser.role,
        action: 'UPDATE_PHONE',
        entity_type: 'USER',
        entity_id: currentUser.id.toString(),
        details: `Updated emergency SMS dispatch mobile number to ${cleanPhone}`,
        ip_address: '10.0.8.21',
        created_at: new Date().toISOString().replace('T', ' ').substring(0, 19),
      },
      ...prev,
    ]);

    showToast('Phone Updated', `SMS dispatch alert phone changed to ${cleanPhone}.`, 'success');
  };

  const addComputer = (data: Omit<Computer, 'id' | 'is_active' | 'operational_status'>): Computer => {
    const nextId = computers.reduce((max, c) => Math.max(max, c.id), 0) + 1;
    const lab = laboratories.find((l) => l.id === data.lab_id);
    const floor = lab ? floors.find((f) => f.id === lab.floor_id) : undefined;
    const wing = floor ? wings.find((w) => w.id === floor.wing_id) : undefined;

    const newComp: Computer = {
      ...data,
      id: nextId,
      operational_status: 'Working',
      is_active: 1,
      last_maintenance_date: null,
      lab_code: lab?.lab_code,
      lab_name: lab?.name,
      floor_name: floor?.name,
      wing_name: wing?.name,
    };

    setComputers((prev) => [newComp, ...prev]);

    const user = currentUser || users[0];
    setAuditLogs((prev) => [
      {
        id: Date.now(),
        user_id: user.id,
        user_name: user.full_name,
        user_role: user.role,
        action: 'CREATE_COMPUTER',
        entity_type: 'COMPUTER',
        entity_id: nextId.toString(),
        details: `Added new workstation ${newComp.computer_id_code} (${newComp.brand} ${newComp.model}) in ${newComp.lab_code}`,
        ip_address: '127.0.0.1',
        created_at: new Date().toISOString().replace('T', ' ').substring(0, 19),
      },
      ...prev,
    ]);

    showToast('Computer Added', `Workstation ${newComp.computer_id_code} successfully inventoried.`, 'success');
    return newComp;
  };

  const decommissionComputer = (computerId: number, reason: string) => {
    const comp = computers.find((c) => c.id === computerId);
    if (!comp) return;

    const nowStr = new Date().toISOString().replace('T', ' ').substring(0, 19);

    setComputers((prev) =>
      prev.map((c) =>
        c.id === computerId
          ? {
              ...c,
              operational_status: 'Decommissioned',
              is_active: 0,
              decommissioned_at: nowStr,
              decommission_reason: reason,
            }
          : c
      )
    );

    const user = currentUser || users[0];
    setAuditLogs((prev) => [
      {
        id: Date.now(),
        user_id: user.id,
        user_name: user.full_name,
        user_role: user.role,
        action: 'DECOMMISSION_COMPUTER',
        entity_type: 'COMPUTER',
        entity_id: computerId.toString(),
        details: `Decommissioned ${comp.computer_id_code} (Serial: ${comp.serial_number}). Reason: ${reason}`,
        ip_address: '127.0.0.1',
        created_at: nowStr,
      },
      ...prev,
    ]);

    showToast('Workstation Decommissioned', `${comp.computer_id_code} has been retired.`, 'warning');
  };

  const replaceComputer = (
    oldComputerId: number,
    newData: {
      computer_id_code: string;
      brand: string;
      model: string;
      serial_number: string;
      processor: string;
      ram: string;
      storage: string;
      os: string;
      reason: string;
      notes?: string;
    }
  ): Computer => {
    const oldComp = computers.find((c) => c.id === oldComputerId);
    if (!oldComp) throw new Error('Target computer not found.');

    const nowStr = new Date().toISOString().replace('T', ' ').substring(0, 19);
    const installDate = nowStr.split(' ')[0];
    const nextCompId = computers.reduce((max, c) => Math.max(max, c.id), 0) + 1;
    const user = currentUser || users[0];

    // Create new computer with the original pc_number in this lab
    const newComp: Computer = {
      id: nextCompId,
      lab_id: oldComp.lab_id,
      pc_number: oldComp.pc_number,
      computer_id_code: newData.computer_id_code,
      brand: newData.brand,
      model: newData.model,
      serial_number: newData.serial_number,
      processor: newData.processor,
      ram: newData.ram,
      storage: newData.storage,
      os: newData.os,
      installation_date: installDate,
      operational_status: 'Working',
      last_maintenance_date: null,
      is_active: 1,
      lab_code: oldComp.lab_code,
      lab_name: oldComp.lab_name,
      floor_name: oldComp.floor_name,
      wing_name: oldComp.wing_name,
    };

    // Update old computer: decommission it and rename pc_number slightly
    const updatedComputers = computers.map((c) => {
      if (c.id === oldComputerId) {
        return {
          ...c,
          pc_number: `${oldComp.pc_number}-ARCHIVED`,
          operational_status: 'Decommissioned' as ComputerStatus,
          is_active: 0,
          decommissioned_at: nowStr,
          decommission_reason: `Replaced by new hardware: ${newData.reason}`,
        };
      }
      return c;
    });

    setComputers([newComp, ...updatedComputers]);

    // Record replacement
    const nextRepId = replacements.reduce((max, r) => Math.max(max, r.id), 0) + 1;
    const repRecord: ComputerReplacement = {
      id: nextRepId,
      old_computer_id: oldComputerId,
      new_computer_id: nextCompId,
      replacement_date: nowStr,
      reason: newData.reason,
      performed_by_user_id: user.id,
      notes: newData.notes || '',
    };
    setReplacements((prev) => [repRecord, ...prev]);

    // Audit Log
    setAuditLogs((prev) => [
      {
        id: Date.now(),
        user_id: user.id,
        user_name: user.full_name,
        user_role: user.role,
        action: 'REPLACE_COMPUTER',
        entity_type: 'COMPUTER',
        entity_id: nextCompId.toString(),
        details: `Replaced ${oldComp.computer_id_code} (Old SN: ${oldComp.serial_number}) with ${newData.computer_id_code} (New SN: ${newData.serial_number}). Reason: ${newData.reason}`,
        ip_address: '127.0.0.1',
        created_at: nowStr,
      },
      ...prev,
    ]);

    showToast(
      'Hardware Replaced',
      `Slot ${oldComp.pc_number} now equipped with ${newData.computer_id_code}. History preserved.`,
      'success'
    );

    return newComp;
  };

  const resetToDemoDefaults = () => {
    localStorage.clear();
    setUsers(INITIAL_USERS);
    setCurrentUser(INITIAL_USERS[0]);
    const { floors: f, laboratories: l } = generateInitialFloorsAndLabs();
    const c = generateInitialComputers(INITIAL_WINGS, f, l);
    // Apply demo statuses
    const c5 = c.find((x) => x.computer_id_code === 'COMP-A1-01-PC-05');
    if (c5) c5.operational_status = 'Fault Reported';
    const c12 = c.find((x) => x.computer_id_code === 'COMP-B2-01-PC-12');
    if (c12) c12.operational_status = 'Fault Reported';
    const c8 = c.find((x) => x.computer_id_code === 'COMP-C3-02-PC-08');
    if (c8) c8.operational_status = 'Under Repair';
    const c3 = c.find((x) => x.computer_id_code === 'COMP-A2-02-PC-03');
    if (c3) {
      c3.operational_status = 'Repaired';
      c3.last_maintenance_date = '2026-10-08 13:45:00';
    }
    const c18 = c.find((x) => x.computer_id_code === 'COMP-B1-02-PC-18');
    if (c18) {
      c18.operational_status = 'Working';
      c18.last_maintenance_date = '2026-10-07 16:15:00';
    }
    setComputers(c);
    setComplaints(INITIAL_COMPLAINTS);
    setMaintenanceRecords(INITIAL_MAINTENANCE);
    setNotifications(INITIAL_NOTIFICATIONS);
    setAuditLogs(INITIAL_AUDIT_LOGS);
    setSmsLogs(INITIAL_SMS_LOGS);
    setReplacements([]);
    showToast('Reset Complete', 'Restored pristine college dataset and demonstration records.', 'info');
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        users,
        wings,
        floors,
        laboratories,
        computers,
        complaints,
        maintenanceRecords,
        notifications,
        auditLogs,
        smsLogs,
        replacements,
        theme,
        toasts,
        currentView,
        selectedComplaintCode,
        selectedComputerId,
        setCurrentView,
        setSelectedComplaintCode,
        setSelectedComputerId,
        login,
        logout,
        switchUser,
        toggleTheme,
        showToast,
        removeToast,
        markNotificationRead,
        markAllNotificationsRead,
        createComplaint,
        acceptComplaint,
        startRepair,
        resolveComplaint,
        updateTechnicianPhone,
        addComputer,
        decommissionComputer,
        replaceComputer,
        resetToDemoDefaults,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
