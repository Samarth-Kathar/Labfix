import sqlite3
from datetime import datetime
from werkzeug.security import check_password_hash, generate_password_hash
from database import query_db, execute_db, get_db

class User:
    """Represents a system user (HOD, Faculty, or Technician)."""
    def __init__(self, id, username, email, full_name, role, department='', phone='', avatar_url='', created_at=None, password_hash=None):
        self.id = id
        self.username = username
        self.email = email
        self.full_name = full_name
        self.role = role
        self.department = department
        self.phone = phone
        self.avatar_url = avatar_url
        self.created_at = created_at
        self._password_hash = password_hash

    @classmethod
    def from_row(cls, row):
        if not row:
            return None
        return cls(
            id=row['id'],
            username=row['username'],
            email=row['email'],
            full_name=row['full_name'],
            role=row['role'],
            department=row['department'],
            phone=row['phone'],
            avatar_url=row['avatar_url'],
            created_at=row['created_at'],
            password_hash=row['password_hash'] if 'password_hash' in row.keys() else None
        )

    @classmethod
    def find_by_id(cls, user_id):
        row = query_db("SELECT * FROM users WHERE id = ?", (user_id,), one=True)
        return cls.from_row(row)

    @classmethod
    def find_by_username(cls, username):
        row = query_db("SELECT * FROM users WHERE username = ? OR email = ?", (username, username), one=True)
        return cls.from_row(row)

    @classmethod
    def get_all_by_role(cls, role):
        rows = query_db("SELECT * FROM users WHERE role = ? ORDER BY full_name", (role,))
        return [cls.from_row(r) for r in rows]

    def verify_password(self, password):
        if not self._password_hash:
            row = query_db("SELECT password_hash FROM users WHERE id = ?", (self.id,), one=True)
            if row:
                self._password_hash = row['password_hash']
        return check_password_hash(self._password_hash, password) if self._password_hash else False

    def is_hod(self):
        return self.role == 'hod'

    def is_faculty(self):
        return self.role == 'faculty'

    def is_technician(self):
        return self.role == 'technician'

    def to_dict(self):
        return {
            'id': self.id,
            'username': self.username,
            'email': self.email,
            'full_name': self.full_name,
            'role': self.role,
            'department': self.department,
            'phone': self.phone,
            'avatar_url': self.avatar_url,
            'created_at': str(self.created_at) if self.created_at else None
        }


class Computer:
    """Represents a computer workstation located in a specific laboratory."""
    STATUS_WORKING = 'Working'
    STATUS_FAULT_REPORTED = 'Fault Reported'
    STATUS_UNDER_REPAIR = 'Under Repair'
    STATUS_REPAIRED = 'Repaired'
    STATUS_DECOMMISSIONED = 'Decommissioned'

    def __init__(self, id, lab_id, pc_number, computer_id_code, brand, model, serial_number,
                 processor, ram, storage, os, installation_date, operational_status='Working',
                 last_maintenance_date=None, decommissioned_at=None, decommission_reason=None,
                 is_active=1, lab_code=None, lab_name=None, floor_name=None, wing_name=None):
        self.id = id
        self.lab_id = lab_id
        self.pc_number = pc_number
        self.computer_id_code = computer_id_code
        self.brand = brand
        self.model = model
        self.serial_number = serial_number
        self.processor = processor
        self.ram = ram
        self.storage = storage
        self.os = os
        self.installation_date = installation_date
        self.operational_status = operational_status
        self.last_maintenance_date = last_maintenance_date
        self.decommissioned_at = decommissioned_at
        self.decommission_reason = decommission_reason
        self.is_active = is_active
        # Location labels
        self.lab_code = lab_code
        self.lab_name = lab_name
        self.floor_name = floor_name
        self.wing_name = wing_name

    @classmethod
    def from_row(cls, row):
        if not row:
            return None
        keys = row.keys()
        return cls(
            id=row['id'],
            lab_id=row['lab_id'],
            pc_number=row['pc_number'],
            computer_id_code=row['computer_id_code'],
            brand=row['brand'],
            model=row['model'],
            serial_number=row['serial_number'],
            processor=row['processor'],
            ram=row['ram'],
            storage=row['storage'],
            os=row['os'],
            installation_date=row['installation_date'],
            operational_status=row['operational_status'],
            last_maintenance_date=row['last_maintenance_date'] if 'last_maintenance_date' in keys else None,
            decommissioned_at=row['decommissioned_at'] if 'decommissioned_at' in keys else None,
            decommission_reason=row['decommission_reason'] if 'decommission_reason' in keys else None,
            is_active=row['is_active'] if 'is_active' in keys else 1,
            lab_code=row['lab_code'] if 'lab_code' in keys else None,
            lab_name=row['lab_name'] if 'lab_name' in keys else None,
            floor_name=row['floor_name'] if 'floor_name' in keys else None,
            wing_name=row['wing_name'] if 'wing_name' in keys else None
        )

    @classmethod
    def find_by_id(cls, computer_id):
        sql = '''
            SELECT c.*, l.lab_code, l.name as lab_name, f.name as floor_name, w.name as wing_name
            FROM computers c
            JOIN laboratories l ON c.lab_id = l.id
            JOIN floors f ON l.floor_id = f.id
            JOIN wings w ON f.wing_id = w.id
            WHERE c.id = ?
        '''
        row = query_db(sql, (computer_id,), one=True)
        return cls.from_row(row)

    @classmethod
    def find_by_code(cls, computer_id_code):
        sql = '''
            SELECT c.*, l.lab_code, l.name as lab_name, f.name as floor_name, w.name as wing_name
            FROM computers c
            JOIN laboratories l ON c.lab_id = l.id
            JOIN floors f ON l.floor_id = f.id
            JOIN wings w ON f.wing_id = w.id
            WHERE c.computer_id_code = ?
        '''
        row = query_db(sql, (computer_id_code,), one=True)
        return cls.from_row(row)

    @classmethod
    def get_all(cls, search=None, wing=None, floor=None, lab=None, status=None, sort_by='id', order='ASC'):
        sql = '''
            SELECT c.*, l.lab_code, l.name as lab_name, f.name as floor_name, w.name as wing_name
            FROM computers c
            JOIN laboratories l ON c.lab_id = l.id
            JOIN floors f ON l.floor_id = f.id
            JOIN wings w ON f.wing_id = w.id
            WHERE 1=1
        '''
        args = []
        if search:
            sql += ''' AND (c.computer_id_code LIKE ? OR c.serial_number LIKE ? 
                            OR c.brand LIKE ? OR c.model LIKE ? OR c.pc_number LIKE ?)'''
            term = f"%{search}%"
            args.extend([term, term, term, term, term])
        if wing:
            sql += ' AND w.name = ?'
            args.append(wing)
        if floor:
            sql += ' AND f.name = ?'
            args.append(floor)
        if lab:
            sql += ' AND (l.id = ? OR l.lab_code = ?)'
            args.extend([lab, lab])
        if status:
            sql += ' AND c.operational_status = ?'
            args.append(status)

        allowed_sorts = {
            'id': 'c.id',
            'pc_number': 'c.pc_number',
            'code': 'c.computer_id_code',
            'brand': 'c.brand',
            'status': 'c.operational_status',
            'installation_date': 'c.installation_date'
        }
        col = allowed_sorts.get(sort_by, 'c.id')
        dir_order = 'DESC' if order.upper() == 'DESC' else 'ASC'
        sql += f" ORDER BY {col} {dir_order}"

        rows = query_db(sql, args)
        return [cls.from_row(r) for r in rows]

    @classmethod
    def get_active_by_lab(cls, lab_id):
        sql = '''
            SELECT * FROM computers 
            WHERE lab_id = ? AND operational_status != 'Decommissioned' AND is_active = 1
            ORDER BY pc_number ASC
        '''
        rows = query_db(sql, (lab_id,))
        return [cls.from_row(r) for r in rows]

    @classmethod
    def create(cls, lab_id, pc_number, computer_id_code, brand, model, serial_number,
               processor, ram, storage, os, installation_date):
        sql = '''
            INSERT INTO computers (
                lab_id, pc_number, computer_id_code, brand, model, serial_number,
                processor, ram, storage, os, installation_date, operational_status, is_active
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Working', 1)
        '''
        last_id, _ = execute_db(sql, (
            lab_id, pc_number, computer_id_code, brand, model, serial_number,
            processor, ram, storage, os, installation_date
        ))
        return cls.find_by_id(last_id)

    def update_status(self, new_status, last_maintenance=None):
        sql = 'UPDATE computers SET operational_status = ?'
        args = [new_status]
        if last_maintenance:
            sql += ', last_maintenance_date = ?'
            args.append(last_maintenance)
        sql += ' WHERE id = ?'
        args.append(self.id)
        execute_db(sql, args)
        self.operational_status = new_status

    def decommission(self, reason, user_id):
        now = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
        execute_db('''
            UPDATE computers 
            SET operational_status = 'Decommissioned',
                is_active = 0,
                decommissioned_at = ?,
                decommission_reason = ?
            WHERE id = ?
        ''', (now, reason, self.id))
        self.operational_status = 'Decommissioned'
        self.is_active = 0
        self.decommissioned_at = now
        self.decommission_reason = reason

        AuditLog.log_action(
            user_id=user_id,
            action='DECOMMISSION_COMPUTER',
            entity_type='COMPUTER',
            entity_id=self.id,
            details=f"Decommissioned {self.computer_id_code} (Serial: {self.serial_number}). Reason: {reason}"
        )

    def replace_with(self, new_computer_id_code, new_serial, new_brand, new_model,
                     new_processor, new_ram, new_storage, new_os, replacement_date,
                     reason, user_id, notes=''):
        """
        Replaces this computer with a new one at the exact same location.
        Preserves this computer's history by marking it decommissioned/replaced,
        and creates the new active computer entity in this slot.
        """
        db = get_db()
        cur = db.cursor()

        # 1. Update old computer: decommission it and rename pc_number slightly to release unique constraint
        old_pc_num = self.pc_number
        archived_pc_num = f"{old_pc_num}-ARCHIVED"
        cur.execute('''
            UPDATE computers 
            SET pc_number = ?,
                operational_status = 'Decommissioned',
                is_active = 0,
                decommissioned_at = ?,
                decommission_reason = ?
            WHERE id = ?
        ''', (archived_pc_num, replacement_date, f"Replaced by new hardware: {reason}", self.id))

        # 2. Insert new computer with the original pc_number in this lab
        install_date = replacement_date.split(' ')[0] if replacement_date else datetime.now().strftime('%Y-%m-%d')
        cur.execute('''
            INSERT INTO computers (
                lab_id, pc_number, computer_id_code, brand, model, serial_number,
                processor, ram, storage, os, installation_date, operational_status, is_active
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Working', 1)
        ''', (
            self.lab_id, old_pc_num, new_computer_id_code, new_brand, new_model,
            new_serial, new_processor, new_ram, new_storage, new_os, install_date
        ))
        new_comp_id = cur.lastrowid

        # 3. Create computer_replacements record
        cur.execute('''
            INSERT INTO computer_replacements (
                old_computer_id, new_computer_id, replacement_date, reason, performed_by_user_id, notes
            ) VALUES (?, ?, ?, ?, ?, ?)
        ''', (self.id, new_comp_id, replacement_date, reason, user_id, notes))

        db.commit()

        AuditLog.log_action(
            user_id=user_id,
            action='REPLACE_COMPUTER',
            entity_type='COMPUTER',
            entity_id=str(new_comp_id),
            details=f"Replaced {self.computer_id_code} (Old SN: {self.serial_number}) with {new_computer_id_code} (New SN: {new_serial}). Reason: {reason}"
        )

        return Computer.find_by_id(new_comp_id)

    def get_maintenance_history(self):
        sql = '''
            SELECT m.*, u.full_name as technician_name, c.complaint_code, c.problem_category, c.priority
            FROM maintenance_records m
            JOIN users u ON m.technician_id = u.id
            JOIN complaints c ON m.complaint_id = c.id
            WHERE m.computer_id = ?
            ORDER BY m.completed_at DESC
        '''
        return query_db(sql, (self.id,))

    def get_complaints(self):
        sql = '''
            SELECT c.*, u.full_name as faculty_name, t.full_name as technician_name
            FROM complaints c
            JOIN users u ON c.faculty_id = u.id
            LEFT JOIN users t ON c.assigned_technician_id = t.id
            WHERE c.computer_id = ?
            ORDER BY c.reported_at DESC
        '''
        return query_db(sql, (self.id,))

    def to_dict(self):
        return {
            'id': self.id,
            'lab_id': self.lab_id,
            'pc_number': self.pc_number,
            'computer_id_code': self.computer_id_code,
            'brand': self.brand,
            'model': self.model,
            'serial_number': self.serial_number,
            'processor': self.processor,
            'ram': self.ram,
            'storage': self.storage,
            'os': self.os,
            'installation_date': str(self.installation_date),
            'operational_status': self.operational_status,
            'last_maintenance_date': str(self.last_maintenance_date) if self.last_maintenance_date else None,
            'decommissioned_at': str(self.decommissioned_at) if self.decommissioned_at else None,
            'decommission_reason': self.decommission_reason,
            'is_active': self.is_active,
            'lab_code': self.lab_code,
            'lab_name': self.lab_name,
            'floor_name': self.floor_name,
            'wing_name': self.wing_name,
            'location_full': f"{self.wing_name} → {self.floor_name} → {self.lab_name} ({self.lab_code}) → {self.pc_number}" if self.wing_name else self.pc_number
        }


class Complaint:
    """Represents a fault complaint ticket raised by a faculty member."""
    STATUS_PENDING = 'Pending'
    STATUS_ACCEPTED = 'Accepted'
    STATUS_IN_PROGRESS = 'In Progress'
    STATUS_RESOLVED = 'Resolved'
    STATUS_CLOSED = 'Closed'

    PRIORITY_LOW = 'Low'
    PRIORITY_MEDIUM = 'Medium'
    PRIORITY_HIGH = 'High'
    PRIORITY_CRITICAL = 'Critical'

    CATEGORIES = [
        'Computer Not Starting',
        'Monitor Problem',
        'Keyboard Problem',
        'Mouse Problem',
        'Internet Problem',
        'Network Problem',
        'Software Problem',
        'Operating System Problem',
        'Slow Performance',
        'Other'
    ]

    def __init__(self, id, complaint_code, faculty_id, computer_id, problem_category,
                 priority, description, status='Pending', attachment_filename=None,
                 reported_at=None, accepted_at=None, resolved_at=None, assigned_technician_id=None,
                 faculty_name=None, faculty_email=None, technician_name=None,
                 computer_id_code=None, pc_number=None, lab_code=None, lab_name=None,
                 floor_name=None, wing_name=None):
        self.id = id
        self.complaint_code = complaint_code
        self.faculty_id = faculty_id
        self.computer_id = computer_id
        self.problem_category = problem_category
        self.priority = priority
        self.description = description
        self.status = status
        self.attachment_filename = attachment_filename
        self.reported_at = reported_at
        self.accepted_at = accepted_at
        self.resolved_at = resolved_at
        self.assigned_technician_id = assigned_technician_id
        # Joined fields
        self.faculty_name = faculty_name
        self.faculty_email = faculty_email
        self.technician_name = technician_name
        self.computer_id_code = computer_id_code
        self.pc_number = pc_number
        self.lab_code = lab_code
        self.lab_name = lab_name
        self.floor_name = floor_name
        self.wing_name = wing_name

    @classmethod
    def from_row(cls, row):
        if not row:
            return None
        keys = row.keys()
        return cls(
            id=row['id'],
            complaint_code=row['complaint_code'],
            faculty_id=row['faculty_id'],
            computer_id=row['computer_id'],
            problem_category=row['problem_category'],
            priority=row['priority'],
            description=row['description'],
            status=row['status'],
            attachment_filename=row['attachment_filename'] if 'attachment_filename' in keys else None,
            reported_at=row['reported_at'] if 'reported_at' in keys else None,
            accepted_at=row['accepted_at'] if 'accepted_at' in keys else None,
            resolved_at=row['resolved_at'] if 'resolved_at' in keys else None,
            assigned_technician_id=row['assigned_technician_id'] if 'assigned_technician_id' in keys else None,
            faculty_name=row['faculty_name'] if 'faculty_name' in keys else None,
            faculty_email=row['faculty_email'] if 'faculty_email' in keys else None,
            technician_name=row['technician_name'] if 'technician_name' in keys else None,
            computer_id_code=row['computer_id_code'] if 'computer_id_code' in keys else None,
            pc_number=row['pc_number'] if 'pc_number' in keys else None,
            lab_code=row['lab_code'] if 'lab_code' in keys else None,
            lab_name=row['lab_name'] if 'lab_name' in keys else None,
            floor_name=row['floor_name'] if 'floor_name' in keys else None,
            wing_name=row['wing_name'] if 'wing_name' in keys else None,
        )

    @staticmethod
    def generate_next_code():
        row = query_db("SELECT MAX(id) as max_id FROM complaints", one=True)
        next_num = (row['max_id'] or 0) + 1
        return f"LF-{next_num:04d}"

    @classmethod
    def find_by_id(cls, complaint_id):
        sql = '''
            SELECT c.*, 
                   u.full_name as faculty_name, u.email as faculty_email,
                   t.full_name as technician_name,
                   cmp.computer_id_code, cmp.pc_number,
                   l.lab_code, l.name as lab_name,
                   f.name as floor_name,
                   w.name as wing_name
            FROM complaints c
            JOIN users u ON c.faculty_id = u.id
            LEFT JOIN users t ON c.assigned_technician_id = t.id
            JOIN computers cmp ON c.computer_id = cmp.id
            JOIN laboratories l ON cmp.lab_id = l.id
            JOIN floors f ON l.floor_id = f.id
            JOIN wings w ON f.wing_id = w.id
            WHERE c.id = ?
        '''
        row = query_db(sql, (complaint_id,), one=True)
        return cls.from_row(row)

    @classmethod
    def find_by_code(cls, complaint_code):
        sql = '''
            SELECT c.*, 
                   u.full_name as faculty_name, u.email as faculty_email,
                   t.full_name as technician_name,
                   cmp.computer_id_code, cmp.pc_number,
                   l.lab_code, l.name as lab_name,
                   f.name as floor_name,
                   w.name as wing_name
            FROM complaints c
            JOIN users u ON c.faculty_id = u.id
            LEFT JOIN users t ON c.assigned_technician_id = t.id
            JOIN computers cmp ON c.computer_id = cmp.id
            JOIN laboratories l ON cmp.lab_id = l.id
            JOIN floors f ON l.floor_id = f.id
            JOIN wings w ON f.wing_id = w.id
            WHERE c.complaint_code = ?
        '''
        row = query_db(sql, (complaint_code,), one=True)
        return cls.from_row(row)

    @classmethod
    def get_all(cls, status=None, priority=None, wing=None, floor=None, lab=None, date=None, search=None):
        sql = '''
            SELECT c.*, 
                   u.full_name as faculty_name, u.email as faculty_email,
                   t.full_name as technician_name,
                   cmp.computer_id_code, cmp.pc_number,
                   l.lab_code, l.name as lab_name,
                   f.name as floor_name,
                   w.name as wing_name
            FROM complaints c
            JOIN users u ON c.faculty_id = u.id
            LEFT JOIN users t ON c.assigned_technician_id = t.id
            JOIN computers cmp ON c.computer_id = cmp.id
            JOIN laboratories l ON cmp.lab_id = l.id
            JOIN floors f ON l.floor_id = f.id
            JOIN wings w ON f.wing_id = w.id
            WHERE 1=1
        '''
        args = []
        if status:
            sql += ' AND c.status = ?'
            args.append(status)
        if priority:
            sql += ' AND c.priority = ?'
            args.append(priority)
        if wing:
            sql += ' AND w.name = ?'
            args.append(wing)
        if floor:
            sql += ' AND f.name = ?'
            args.append(floor)
        if lab:
            sql += ' AND (l.id = ? OR l.lab_code = ?)'
            args.extend([lab, lab])
        if date:
            sql += ' AND DATE(c.reported_at) = ?'
            args.append(date)
        if search:
            sql += ''' AND (c.complaint_code LIKE ? OR c.description LIKE ? 
                            OR cmp.computer_id_code LIKE ? OR u.full_name LIKE ?)'''
            term = f"%{search}%"
            args.extend([term, term, term, term])

        sql += ' ORDER BY CASE c.priority WHEN "Critical" THEN 1 WHEN "High" THEN 2 WHEN "Medium" THEN 3 ELSE 4 END, c.reported_at DESC'
        rows = query_db(sql, args)
        return [cls.from_row(r) for r in rows]

    @classmethod
    def get_by_faculty(cls, faculty_id):
        sql = '''
            SELECT c.*, 
                   u.full_name as faculty_name, u.email as faculty_email,
                   t.full_name as technician_name,
                   cmp.computer_id_code, cmp.pc_number,
                   l.lab_code, l.name as lab_name,
                   f.name as floor_name,
                   w.name as wing_name
            FROM complaints c
            JOIN users u ON c.faculty_id = u.id
            LEFT JOIN users t ON c.assigned_technician_id = t.id
            JOIN computers cmp ON c.computer_id = cmp.id
            JOIN laboratories l ON cmp.lab_id = l.id
            JOIN floors f ON l.floor_id = f.id
            JOIN wings w ON f.wing_id = w.id
            WHERE c.faculty_id = ?
            ORDER BY c.reported_at DESC
        '''
        rows = query_db(sql, (faculty_id,))
        return [cls.from_row(r) for r in rows]

    @classmethod
    def create(cls, faculty_id, computer_id, problem_category, priority, description, attachment_filename=None):
        code = cls.generate_next_code()
        sql = '''
            INSERT INTO complaints (
                complaint_code, faculty_id, computer_id, problem_category, priority,
                description, attachment_filename, status, reported_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, 'Pending', CURRENT_TIMESTAMP)
        '''
        last_id, _ = execute_db(sql, (
            code, faculty_id, computer_id, problem_category, priority, description, attachment_filename
        ))

        # Update computer operational status to 'Fault Reported'
        execute_db("UPDATE computers SET operational_status = 'Fault Reported' WHERE id = ?", (computer_id,))

        # Create notifications
        Notification.create(
            target_role='technician',
            title=f"New {priority} Complaint: {code}",
            message=f"{problem_category} reported by faculty. Click to view in queue.",
            link=f"/technician/dashboard",
            type='complaint_new'
        )
        Notification.create(
            target_role='hod',
            title=f"New Complaint Filed: {code}",
            message=f"Priority: {priority} | {problem_category}",
            link=f"/hod/complaints",
            type='complaint_new'
        )

        AuditLog.log_action(
            user_id=faculty_id,
            action='REPORT_FAULT',
            entity_type='COMPLAINT',
            entity_id=str(last_id),
            details=f"Raised {code} for computer #{computer_id} (Category: {problem_category}, Priority: {priority})"
        )

        return cls.find_by_id(last_id)

    def accept_by_technician(self, technician_id):
        """
        Concurrency check: ensure complaint is still Pending.
        """
        db = get_db()
        cur = db.cursor()
        cur.execute("SELECT status, assigned_technician_id FROM complaints WHERE id = ?", (self.id,))
        curr = cur.fetchone()
        if not curr:
            return False, "Complaint not found."
        if curr['status'] != 'Pending':
            return False, f"Complaint has already been claimed or processed (Current status: {curr['status']})."

        now = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
        cur.execute('''
            UPDATE complaints 
            SET status = 'Accepted',
                assigned_technician_id = ?,
                accepted_at = ?
            WHERE id = ? AND status = 'Pending'
        ''', (technician_id, now, self.id))
        
        if cur.rowcount == 0:
            db.rollback()
            return False, "Conflict detected: Another technician claimed this complaint simultaneously."

        db.commit()
        self.status = 'Accepted'
        self.assigned_technician_id = technician_id
        self.accepted_at = now

        # Notify faculty member
        Notification.create(
            user_id=self.faculty_id,
            target_role='faculty',
            title=f"Complaint Accepted ({self.complaint_code})",
            message=f"A technician has accepted your complaint and will attend to it shortly.",
            link="/faculty/my-complaints",
            type='complaint_assigned'
        )

        AuditLog.log_action(
            user_id=technician_id,
            action='ACCEPT_COMPLAINT',
            entity_type='COMPLAINT',
            entity_id=str(self.id),
            details=f"Technician #{technician_id} claimed complaint {self.complaint_code}"
        )

        return True, "Complaint accepted successfully."

    def start_repair(self, technician_id):
        if self.assigned_technician_id != technician_id:
            return False, "You can only start repairs on complaints assigned to you."
        if self.status not in ('Accepted', 'Pending'):
            return False, f"Cannot start repair on complaint with status {self.status}."

        execute_db('''
            UPDATE complaints 
            SET status = 'In Progress' 
            WHERE id = ?
        ''', (self.id,))

        # Update computer status to 'Under Repair'
        execute_db("UPDATE computers SET operational_status = 'Under Repair' WHERE id = ?", (self.computer_id,))

        self.status = 'In Progress'

        # Notify faculty
        Notification.create(
            user_id=self.faculty_id,
            target_role='faculty',
            title=f"Repair In Progress ({self.complaint_code})",
            message=f"Technician is actively diagnosing and fixing the computer.",
            link="/faculty/my-complaints",
            type='complaint_in_progress'
        )

        AuditLog.log_action(
            user_id=technician_id,
            action='START_REPAIR',
            entity_type='COMPLAINT',
            entity_id=str(self.id),
            details=f"Technician #{technician_id} started repair on {self.complaint_code}"
        )

        return True, "Repair marked In Progress."

    def mark_resolved(self, technician_id, diagnosis, action_taken, parts_replaced,
                      solution_description, repair_notes, computer_operational_status='Repaired'):
        if self.assigned_technician_id != technician_id:
            return False, "Only the assigned technician can resolve this complaint."

        now = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
        db = get_db()
        cur = db.cursor()

        # 1. Update complaint
        cur.execute('''
            UPDATE complaints 
            SET status = 'Resolved',
                resolved_at = ?
            WHERE id = ?
        ''', (now, self.id))

        # 2. Add maintenance record
        cur.execute('''
            INSERT INTO maintenance_records (
                complaint_id, computer_id, technician_id, diagnosis, action_taken,
                parts_replaced, solution_description, repair_notes, started_at, completed_at, verification_status
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Verified')
        ''', (
            self.id, self.computer_id, technician_id, diagnosis, action_taken,
            parts_replaced or 'None', solution_description, repair_notes or '',
            self.accepted_at or now, now
        ))

        # 3. Update computer operational status & last_maintenance_date
        cur.execute('''
            UPDATE computers 
            SET operational_status = ?,
                last_maintenance_date = ?
            WHERE id = ?
        ''', (computer_operational_status, now, self.computer_id))

        db.commit()

        self.status = 'Resolved'
        self.resolved_at = now

        # Notify faculty and HOD
        Notification.create(
            user_id=self.faculty_id,
            target_role='faculty',
            title=f"Problem Resolved: {self.complaint_code}",
            message=f"Your issue has been resolved. Solution: {solution_description[:80]}...",
            link="/faculty/my-complaints",
            type='complaint_resolved'
        )
        Notification.create(
            target_role='hod',
            title=f"Complaint Resolved: {self.complaint_code}",
            message=f"Technician resolved issue on computer #{self.computer_id}.",
            link=f"/hod/complaints",
            type='complaint_resolved'
        )

        AuditLog.log_action(
            user_id=technician_id,
            action='RESOLVE_COMPLAINT',
            entity_type='COMPLAINT',
            entity_id=str(self.id),
            details=f"Technician #{technician_id} marked {self.complaint_code} Resolved (Comp status: {computer_operational_status})"
        )

        return True, "Complaint successfully marked as resolved."

    @property
    def location_breadcrumb(self):
        return f"{self.wing_name} → {self.floor_name} → {self.lab_name} ({self.lab_code}) → {self.pc_number}"

    def to_dict(self):
        return {
            'id': self.id,
            'complaint_code': self.complaint_code,
            'faculty_id': self.faculty_id,
            'faculty_name': self.faculty_name,
            'technician_name': self.technician_name,
            'computer_id': self.computer_id,
            'computer_id_code': self.computer_id_code,
            'pc_number': self.pc_number,
            'location_full': self.location_breadcrumb,
            'problem_category': self.problem_category,
            'priority': self.priority,
            'description': self.description,
            'status': self.status,
            'attachment_filename': self.attachment_filename,
            'reported_at': str(self.reported_at) if self.reported_at else None,
            'accepted_at': str(self.accepted_at) if self.accepted_at else None,
            'resolved_at': str(self.resolved_at) if self.resolved_at else None
        }


class MaintenanceRecord:
    """Represents the post-repair maintenance log for a computer."""
    def __init__(self, id, complaint_id, computer_id, technician_id, diagnosis, action_taken,
                 parts_replaced, solution_description, repair_notes, started_at, completed_at,
                 verification_status='Verified', technician_name=None, complaint_code=None):
        self.id = id
        self.complaint_id = complaint_id
        self.computer_id = computer_id
        self.technician_id = technician_id
        self.diagnosis = diagnosis
        self.action_taken = action_taken
        self.parts_replaced = parts_replaced
        self.solution_description = solution_description
        self.repair_notes = repair_notes
        self.started_at = started_at
        self.completed_at = completed_at
        self.verification_status = verification_status
        self.technician_name = technician_name
        self.complaint_code = complaint_code

    @classmethod
    def get_by_complaint_id(cls, complaint_id):
        sql = '''
            SELECT m.*, u.full_name as technician_name, c.complaint_code
            FROM maintenance_records m
            JOIN users u ON m.technician_id = u.id
            JOIN complaints c ON m.complaint_id = c.id
            WHERE m.complaint_id = ?
        '''
        row = query_db(sql, (complaint_id,), one=True)
        if not row:
            return None
        return cls(
            id=row['id'],
            complaint_id=row['complaint_id'],
            computer_id=row['computer_id'],
            technician_id=row['technician_id'],
            diagnosis=row['diagnosis'],
            action_taken=row['action_taken'],
            parts_replaced=row['parts_replaced'],
            solution_description=row['solution_description'],
            repair_notes=row['repair_notes'],
            started_at=row['started_at'],
            completed_at=row['completed_at'],
            verification_status=row['verification_status'],
            technician_name=row['technician_name'],
            complaint_code=row['complaint_code']
        )


class Notification:
    """Represents an in-app system notification for a user or role."""
    @staticmethod
    def create(title, message, link='#', type='info', user_id=None, target_role=None):
        sql = '''
            INSERT INTO notifications (user_id, target_role, title, message, link, type, is_read, created_at)
            VALUES (?, ?, ?, ?, ?, ?, 0, CURRENT_TIMESTAMP)
        '''
        execute_db(sql, (user_id, target_role, title, message, link, type))

    @staticmethod
    def get_for_user(user_id, role, limit=20):
        sql = '''
            SELECT * FROM notifications
            WHERE (user_id = ? OR (user_id IS NULL AND target_role = ?))
            ORDER BY created_at DESC
            LIMIT ?
        '''
        return query_db(sql, (user_id, role, limit))

    @staticmethod
    def get_unread_count(user_id, role):
        sql = '''
            SELECT COUNT(*) as count FROM notifications
            WHERE (user_id = ? OR (user_id IS NULL AND target_role = ?))
              AND is_read = 0
        '''
        row = query_db(sql, (user_id, role), one=True)
        return row['count'] if row else 0

    @staticmethod
    def mark_all_as_read(user_id, role):
        sql = '''
            UPDATE notifications 
            SET is_read = 1
            WHERE (user_id = ? OR (user_id IS NULL AND target_role = ?))
        '''
        execute_db(sql, (user_id, role))


class AuditLog:
    """Tracks administrative and operational actions for accountability."""
    @staticmethod
    def log_action(user_id, action, entity_type, entity_id, details, ip_address='127.0.0.1'):
        sql = '''
            INSERT INTO audit_logs (user_id, action, entity_type, entity_id, details, ip_address, created_at)
            VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
        '''
        execute_db(sql, (user_id, action, entity_type, str(entity_id), details, ip_address))

    @staticmethod
    def get_recent(limit=50):
        sql = '''
            SELECT a.*, u.full_name as user_name, u.role as user_role
            FROM audit_logs a
            LEFT JOIN users u ON a.user_id = u.id
            ORDER BY a.created_at DESC
            LIMIT ?
        '''
        return query_db(sql, (limit,))
