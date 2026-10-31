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
} from '../types';

export const INITIAL_USERS: User[] = [
  {
    id: 1,
    username: 'hod',
    email: 'hod@labfix.edu',
    full_name: 'Dr. Sarah Jenkins',
    role: 'hod',
    department: 'Computer Science & Engineering',
    phone: '+1 (555) 234-5678',
    created_at: '2024-01-15 08:00:00',
  },
  {
    id: 2,
    username: 'faculty',
    email: 'faculty@labfix.edu',
    full_name: 'Prof. Alan Turing',
    role: 'faculty',
    department: 'Computer Science & Engineering',
    phone: '+1 (555) 345-6789',
    created_at: '2024-01-16 09:15:00',
  },
  {
    id: 3,
    username: 'faculty2',
    email: 'grace.hopper@labfix.edu',
    full_name: 'Dr. Grace Hopper',
    role: 'faculty',
    department: 'Information Technology',
    phone: '+1 (555) 456-7890',
    created_at: '2024-01-18 10:30:00',
  },
  {
    id: 4,
    username: 'tech',
    email: 'tech@labfix.edu',
    full_name: 'Alex Rivera',
    role: 'technician',
    department: 'IT Maintenance Operations',
    phone: '+1 (555) 567-8901',
    created_at: '2024-01-20 11:00:00',
  },
  {
    id: 5,
    username: 'tech2',
    email: 'tech2@labfix.edu',
    full_name: 'Marcus Vance',
    role: 'technician',
    department: 'Hardware & Networking',
    phone: '+1 (555) 678-9012',
    created_at: '2024-01-22 13:45:00',
  },
];

export const INITIAL_WINGS: Wing[] = [
  {
    id: 1,
    name: 'Wing A',
    code: 'A',
    description: 'North Academic Block - Computing & Data Sciences',
  },
  {
    id: 2,
    name: 'Wing B',
    code: 'B',
    description: 'Central Technology Hub - AI & Software Engineering',
  },
  {
    id: 3,
    name: 'Wing C',
    code: 'C',
    description: 'South Engineering Complex - Networking & Cyber Security',
  },
];

export function generateInitialFloorsAndLabs(): { floors: Floor[]; laboratories: Laboratory[] } {
  const floors: Floor[] = [];
  const laboratories: Laboratory[] = [];
  let floorIdCounter = 1;
  let labIdCounter = 1;

  INITIAL_WINGS.forEach((wing) => {
    [1, 2, 3].forEach((floorNum) => {
      const currentFloorId = floorIdCounter++;
      floors.push({
        id: currentFloorId,
        wing_id: wing.id,
        floor_number: floorNum,
        name: `Floor ${floorNum}`,
      });

      // 2 laboratories per floor: e.g. A1-01, A1-02
      [1, 2].forEach((labIdx) => {
        const labCode = `${wing.code}${floorNum}-0${labIdx}`;
        const dept =
          wing.code === 'A'
            ? 'Computer Science & Engineering'
            : wing.code === 'B'
            ? 'Information Technology'
            : 'Electronics & Networking';

        laboratories.push({
          id: labIdCounter++,
          floor_id: currentFloorId,
          lab_code: labCode,
          name: `Lab ${labCode}`,
          capacity: 20,
          department: dept,
          in_charge_faculty_id: labIdx === 1 ? 2 : 3,
        });
      });
    });
  });

  return { floors, laboratories };
}

export function generateInitialComputers(
  wings: Wing[],
  floors: Floor[],
  labs: Laboratory[]
): Computer[] {
  const brands = ['Dell', 'HP', 'Lenovo'];
  const models: Record<string, string> = {
    Dell: 'OptiPlex 7090 Tower',
    HP: 'EliteDesk 800 G6',
    Lenovo: 'ThinkCentre M70q',
  };
  const processors = [
    'Intel Core i7-11700 (8-Core 2.50GHz)',
    'Intel Core i5-11500 (6-Core 2.70GHz)',
    'AMD Ryzen 7 PRO 5750G',
  ];
  const rams = ['16 GB DDR4 3200MHz', '32 GB DDR4 3200MHz', '16 GB DDR4 3200MHz'];
  const storages = ['512 GB M.2 NVMe SSD', '1 TB NVMe SSD', '512 GB NVMe SSD + 1TB HDD'];
  const oses = ['Windows 11 Pro 64-bit', 'Ubuntu 22.04 LTS 64-bit', 'Windows 11 Pro 64-bit'];

  const computers: Computer[] = [];
  let compIdCounter = 1;

  labs.forEach((lab) => {
    const floor = floors.find((f) => f.id === lab.floor_id);
    const wing = floor ? wings.find((w) => w.id === floor.wing_id) : undefined;

    for (let pcIdx = 1; pcIdx <= 20; pcIdx++) {
      const pcNumber = `PC-${pcIdx < 10 ? '0' : ''}${pcIdx}`;
      const compIdCode = `COMP-${lab.lab_code}-${pcNumber}`;
      const brandIdx = ((wing?.id || 1) + (floor?.floor_number || 1) + pcIdx) % 3;
      const brand = brands[brandIdx];
      const model = models[brand];
      const serial = `SN-${wing?.code || 'A'}${floor?.floor_number || 1}${lab.id.toString().padStart(2, '0')}-${pcIdx.toString().padStart(3, '0')}`;

      // Default status Working, demo will modify a few
      computers.push({
        id: compIdCounter++,
        lab_id: lab.id,
        pc_number: pcNumber,
        computer_id_code: compIdCode,
        brand,
        model,
        serial_number: serial,
        processor: processors[brandIdx],
        ram: rams[brandIdx],
        storage: storages[brandIdx],
        os: oses[brandIdx],
        installation_date: '2024-06-15',
        operational_status: 'Working',
        last_maintenance_date: null,
        is_active: 1,
        lab_code: lab.lab_code,
        lab_name: lab.name,
        floor_name: floor?.name,
        wing_name: wing?.name,
      });
    }
  });

  return computers;
}

export const INITIAL_COMPLAINTS: Complaint[] = [
  {
    id: 1,
    complaint_code: 'LF-1001',
    faculty_id: 2,
    faculty_name: 'Prof. Alan Turing',
    faculty_email: 'faculty@labfix.edu',
    computer_id: 5,
    computer_id_code: 'COMP-A1-01-PC-05',
    pc_number: 'PC-05',
    lab_code: 'A1-01',
    lab_name: 'Lab A1-01',
    floor_name: 'Floor 1',
    wing_name: 'Wing A',
    problem_category: 'Computer Not Starting',
    priority: 'High',
    description: 'System does not power on after pressing power button. Front LED blinks orange three times.',
    status: 'Pending',
    attachment_filename: null,
    reported_at: '2026-10-10 09:30:00',
    accepted_at: null,
    resolved_at: null,
    assigned_technician_id: null,
    technician_name: undefined,
  },
  {
    id: 2,
    complaint_code: 'LF-1002',
    faculty_id: 3,
    faculty_name: 'Dr. Grace Hopper',
    faculty_email: 'grace.hopper@labfix.edu',
    computer_id: 172,
    computer_id_code: 'COMP-B2-01-PC-12',
    pc_number: 'PC-12',
    lab_code: 'B2-01',
    lab_name: 'Lab B2-01',
    floor_name: 'Floor 2',
    wing_name: 'Wing B',
    problem_category: 'Network Problem',
    priority: 'Critical',
    description: 'Ethernet port damaged and no internet connection during lab session. IP configuration fails.',
    status: 'Accepted',
    attachment_filename: null,
    reported_at: '2026-10-10 11:15:00',
    accepted_at: '2026-10-10 11:45:00',
    resolved_at: null,
    assigned_technician_id: 4,
    technician_name: 'Alex Rivera',
  },
  {
    id: 3,
    complaint_code: 'LF-1003',
    faculty_id: 2,
    faculty_name: 'Prof. Alan Turing',
    faculty_email: 'faculty@labfix.edu',
    computer_id: 348,
    computer_id_code: 'COMP-C3-02-PC-08',
    pc_number: 'PC-08',
    lab_code: 'C3-02',
    lab_name: 'Lab C3-02',
    floor_name: 'Floor 3',
    wing_name: 'Wing C',
    problem_category: 'Monitor Problem',
    priority: 'Medium',
    description: 'Display flickers continuously and exhibits horizontal colored scan lines after 10 minutes of use.',
    status: 'In Progress',
    attachment_filename: null,
    reported_at: '2026-10-09 14:20:00',
    accepted_at: '2026-10-09 15:00:00',
    resolved_at: null,
    assigned_technician_id: 5,
    technician_name: 'Marcus Vance',
  },
  {
    id: 4,
    complaint_code: 'LF-1004',
    faculty_id: 3,
    faculty_name: 'Dr. Grace Hopper',
    faculty_email: 'grace.hopper@labfix.edu',
    computer_id: 63,
    computer_id_code: 'COMP-A2-02-PC-03',
    pc_number: 'PC-03',
    lab_code: 'A2-02',
    lab_name: 'Lab A2-02',
    floor_name: 'Floor 2',
    wing_name: 'Wing A',
    problem_category: 'Keyboard Problem',
    priority: 'Low',
    description: 'Multiple keys (W, A, S, Spacebar) are unresponsive and sticky.',
    status: 'Resolved',
    attachment_filename: null,
    reported_at: '2026-10-08 10:00:00',
    accepted_at: '2026-10-08 10:30:00',
    resolved_at: '2026-10-08 13:45:00',
    assigned_technician_id: 4,
    technician_name: 'Alex Rivera',
  },
  {
    id: 5,
    complaint_code: 'LF-1005',
    faculty_id: 2,
    faculty_name: 'Prof. Alan Turing',
    faculty_email: 'faculty@labfix.edu',
    computer_id: 158,
    computer_id_code: 'COMP-B1-02-PC-18',
    pc_number: 'PC-18',
    lab_code: 'B1-02',
    lab_name: 'Lab B1-02',
    floor_name: 'Floor 1',
    wing_name: 'Wing B',
    problem_category: 'Slow Performance',
    priority: 'Medium',
    description: 'Excessive thermal throttling and system freezes when running IDEs.',
    status: 'Resolved',
    attachment_filename: null,
    reported_at: '2026-10-07 13:00:00',
    accepted_at: '2026-10-07 13:30:00',
    resolved_at: '2026-10-07 16:15:00',
    assigned_technician_id: 5,
    technician_name: 'Marcus Vance',
  },
];

export const INITIAL_MAINTENANCE: MaintenanceRecord[] = [
  {
    id: 1,
    complaint_id: 4,
    computer_id: 63,
    technician_id: 4,
    technician_name: 'Alex Rivera',
    complaint_code: 'LF-1004',
    diagnosis: 'Defective peripheral switches and liquid residue on membrane switches.',
    action_taken: 'Disassembled unit, replaced keyboard assembly and bench tested all input buffers.',
    parts_replaced: 'Dell Membrane Keyboard Assembly',
    solution_description: 'Hardware replaced and verified full operational stability under peak load.',
    repair_notes: 'Workstation restored to service. Informed lab in-charge.',
    started_at: '2026-10-08 10:30:00',
    completed_at: '2026-10-08 13:45:00',
    verification_status: 'Verified',
  },
  {
    id: 2,
    complaint_id: 5,
    computer_id: 158,
    technician_id: 5,
    technician_name: 'Marcus Vance',
    complaint_code: 'LF-1005',
    diagnosis: 'Thermal paste degradation and dust clogging heatsink intake.',
    action_taken: 'Cleaned heatsink fins, applied high-conductivity thermal paste, reseated CPU cooler.',
    parts_replaced: 'Thermal Paste Arctic MX-4 & CPU Cooler Fan',
    solution_description: 'Stress tested temperatures: dropped from 94°C under load to 62°C.',
    repair_notes: 'Unit bench-tested successfully. Returned to active service.',
    started_at: '2026-10-07 13:30:00',
    completed_at: '2026-10-07 16:15:00',
    verification_status: 'Verified',
  },
];

export const INITIAL_NOTIFICATIONS: Notification[] = [
  {
    id: 1,
    user_id: 1,
    target_role: 'hod',
    title: 'High Priority Issue Reported',
    message: 'Complaint LF-1001: Computer Not Starting reported in Lab A1-01 (PC-05)',
    link: 'hod-complaints',
    type: 'alert',
    is_read: 0,
    created_at: '2026-10-10 09:31:00',
  },
  {
    id: 2,
    user_id: 4,
    target_role: 'technician',
    title: 'New Complaint in Queue',
    message: 'New complaint LF-1001 awaiting technician pickup in Wing A.',
    link: 'tech-dashboard',
    type: 'info',
    is_read: 0,
    created_at: '2026-10-10 09:31:00',
  },
  {
    id: 3,
    user_id: 3,
    target_role: 'faculty',
    title: 'Complaint Accepted',
    message: 'Technician Alex Rivera accepted your complaint LF-1002 for Lab B2-01.',
    link: 'faculty-complaints',
    type: 'success',
    is_read: 0,
    created_at: '2026-10-10 11:45:00',
  },
];

export const INITIAL_AUDIT_LOGS: AuditLog[] = [
  {
    id: 1,
    user_id: 1,
    user_name: 'Dr. Sarah Jenkins',
    user_role: 'hod',
    action: 'SYSTEM_INITIALIZATION',
    entity_type: 'SYSTEM',
    entity_id: '0',
    details: 'Initial college structure initialized with 3 wings, 9 floors, 18 laboratories, and 360 computers.',
    ip_address: '127.0.0.1',
    created_at: '2026-10-01 08:00:00',
  },
  {
    id: 2,
    user_id: 2,
    user_name: 'Prof. Alan Turing',
    user_role: 'faculty',
    action: 'REPORT_FAULT',
    entity_type: 'COMPLAINT',
    entity_id: '1',
    details: 'Raised LF-1001 for computer COMP-A1-01-PC-05 (Category: Computer Not Starting, Priority: High)',
    ip_address: '10.0.4.12',
    created_at: '2026-10-10 09:30:00',
  },
  {
    id: 3,
    user_id: 4,
    user_name: 'Alex Rivera',
    user_role: 'technician',
    action: 'ACCEPT_COMPLAINT',
    entity_type: 'COMPLAINT',
    entity_id: '2',
    details: 'Technician #4 claimed complaint LF-1002 (COMP-B2-01-PC-12)',
    ip_address: '10.0.8.21',
    created_at: '2026-10-10 11:45:00',
  },
  {
    id: 4,
    user_id: 4,
    user_name: 'Alex Rivera',
    user_role: 'technician',
    action: 'RESOLVE_COMPLAINT',
    entity_type: 'COMPLAINT',
    entity_id: '4',
    details: 'Technician #4 marked LF-1004 Resolved (Comp status: Repaired)',
    ip_address: '10.0.8.21',
    created_at: '2026-10-08 13:45:00',
  },
];

export const INITIAL_SMS_LOGS: SMSLog[] = [
  {
    id: 1,
    complaint_id: 1,
    complaint_code: 'LF-1001',
    recipient_user_id: 4,
    recipient_name: 'Alex Rivera',
    recipient_phone: '+1 (555) 567-8901',
    message: '[LabFix Alert] New HIGH Priority Complaint LF-1001 raised in Lab A1-01 (PC-05). Issue: Computer Not Starting. Reported by: Prof. Alan Turing.',
    gateway_provider: 'SIMULATED-TELCO-GATEWAY',
    status: 'DELIVERED',
    response_data: '{"status": "delivered", "msg_id": "sms_982181"}',
    sent_at: '2026-10-10 09:30:05',
  },
  {
    id: 2,
    complaint_id: 1,
    complaint_code: 'LF-1001',
    recipient_user_id: 5,
    recipient_name: 'Marcus Vance',
    recipient_phone: '+1 (555) 678-9012',
    message: '[LabFix Alert] New HIGH Priority Complaint LF-1001 raised in Lab A1-01 (PC-05). Issue: Computer Not Starting. Reported by: Prof. Alan Turing.',
    gateway_provider: 'SIMULATED-TELCO-GATEWAY',
    status: 'DELIVERED',
    response_data: '{"status": "delivered", "msg_id": "sms_982182"}',
    sent_at: '2026-10-10 09:30:06',
  },
  {
    id: 3,
    complaint_id: 2,
    complaint_code: 'LF-1002',
    recipient_user_id: 4,
    recipient_name: 'Alex Rivera',
    recipient_phone: '+1 (555) 567-8901',
    message: '[LabFix Alert] CRITICAL FAULT LF-1002 reported in Lab B2-01 (PC-12). Issue: Network Problem. Urgent attention required.',
    gateway_provider: 'SIMULATED-TELCO-GATEWAY',
    status: 'DELIVERED',
    response_data: '{"status": "delivered", "msg_id": "sms_982245"}',
    sent_at: '2026-10-10 11:15:04',
  },
];
