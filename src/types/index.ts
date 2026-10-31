export type UserRole = 'hod' | 'faculty' | 'technician';

export interface User {
  id: number;
  username: string;
  email: string;
  full_name: string;
  role: UserRole;
  department: string;
  phone: string;
  avatar_url?: string;
  created_at?: string;
}

export interface Wing {
  id: number;
  name: string;
  code: string;
  description: string;
}

export interface Floor {
  id: number;
  wing_id: number;
  floor_number: number;
  name: string;
}

export interface Laboratory {
  id: number;
  floor_id: number;
  lab_code: string;
  name: string;
  capacity: number;
  department: string;
  in_charge_faculty_id?: number;
}

export type ComputerStatus = 'Working' | 'Fault Reported' | 'Under Repair' | 'Repaired' | 'Decommissioned';

export interface Computer {
  id: number;
  lab_id: number;
  pc_number: string;
  computer_id_code: string;
  brand: string;
  model: string;
  serial_number: string;
  processor: string;
  ram: string;
  storage: string;
  os: string;
  installation_date: string;
  operational_status: ComputerStatus;
  last_maintenance_date?: string | null;
  decommissioned_at?: string | null;
  decommission_reason?: string | null;
  is_active: number;
  // joined fields
  lab_code?: string;
  lab_name?: string;
  floor_name?: string;
  wing_name?: string;
}

export type ComplaintPriority = 'Low' | 'Medium' | 'High' | 'Critical';
export type ComplaintStatus = 'Pending' | 'Accepted' | 'In Progress' | 'Resolved' | 'Closed';

export interface Complaint {
  id: number;
  complaint_code: string;
  faculty_id: number;
  computer_id: number;
  problem_category: string;
  priority: ComplaintPriority;
  description: string;
  status: ComplaintStatus;
  attachment_filename?: string | null;
  reported_at: string;
  accepted_at?: string | null;
  resolved_at?: string | null;
  assigned_technician_id?: number | null;
  // joined fields
  faculty_name?: string;
  faculty_email?: string;
  technician_name?: string;
  computer_id_code?: string;
  pc_number?: string;
  lab_code?: string;
  lab_name?: string;
  floor_name?: string;
  wing_name?: string;
}

export interface MaintenanceRecord {
  id: number;
  complaint_id: number;
  computer_id: number;
  technician_id: number;
  diagnosis: string;
  action_taken: string;
  parts_replaced: string;
  solution_description: string;
  repair_notes: string;
  started_at: string;
  completed_at: string;
  verification_status: string;
  technician_name?: string;
  complaint_code?: string;
}

export interface Notification {
  id: number;
  user_id?: number | null;
  target_role?: UserRole | null;
  title: string;
  message: string;
  link: string;
  type: string;
  is_read: number;
  created_at: string;
}

export interface AuditLog {
  id: number;
  user_id: number;
  user_name?: string;
  user_role?: string;
  action: string;
  entity_type: string;
  entity_id: string;
  details: string;
  ip_address: string;
  created_at: string;
}

export interface SMSLog {
  id: number;
  complaint_id?: number | null;
  complaint_code?: string | null;
  recipient_user_id: number;
  recipient_name: string;
  recipient_phone: string;
  message: string;
  gateway_provider: string;
  status: 'SENT' | 'DELIVERED' | 'FAILED' | 'SIMULATED';
  response_data: string;
  sent_at: string;
}

export interface ComputerReplacement {
  id: number;
  old_computer_id: number;
  new_computer_id: number;
  replacement_date: string;
  reason: string;
  performed_by_user_id: number;
  notes: string;
}
