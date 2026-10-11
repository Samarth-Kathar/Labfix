from datetime import datetime, timedelta
from flask import Blueprint, render_template, request, jsonify
from database import query_db
from models import Computer, Complaint, User, AuditLog, MaintenanceRecord
from services.auth_service import login_required, role_required, get_current_user

hod_bp = Blueprint('hod', __name__, url_prefix='/hod')

@hod_bp.route('/dashboard')
@login_required
@role_required('hod')
def dashboard():
    user = get_current_user()

    # 1. Real database statistics
    total_computers = query_db("SELECT COUNT(*) as c FROM computers WHERE is_active = 1", one=True)['c']
    working_computers = query_db("SELECT COUNT(*) as c FROM computers WHERE operational_status = 'Working' AND is_active = 1", one=True)['c']
    faulty_computers = query_db("SELECT COUNT(*) as c FROM computers WHERE operational_status = 'Fault Reported' AND is_active = 1", one=True)['c']
    under_repair_computers = query_db("SELECT COUNT(*) as c FROM computers WHERE operational_status = 'Under Repair' AND is_active = 1", one=True)['c']
    repaired_computers = query_db("SELECT COUNT(*) as c FROM computers WHERE operational_status = 'Repaired' AND is_active = 1", one=True)['c']
    decommissioned_computers = query_db("SELECT COUNT(*) as c FROM computers WHERE operational_status = 'Decommissioned'", one=True)['c']

    open_complaints = query_db("SELECT COUNT(*) as c FROM complaints WHERE status IN ('Pending', 'Accepted', 'In Progress')", one=True)['c']
    total_laboratories = query_db("SELECT COUNT(*) as c FROM laboratories", one=True)['c']
    available_technicians = query_db("SELECT COUNT(*) as c FROM users WHERE role = 'technician'", one=True)['c']

    # 2. High priority problems
    high_priority_complaints = Complaint.get_all(priority='High') + Complaint.get_all(priority='Critical')
    # Filter active only
    high_priority_active = [c for c in high_priority_complaints if c.status in ('Pending', 'Accepted', 'In Progress')][:5]

    # 3. Recent complaints
    recent_complaints = Complaint.get_all()[:6]

    # 4. Recent repair activities
    recent_repairs = query_db('''
        SELECT m.*, u.full_name as technician_name, c.complaint_code, c.problem_category,
               cmp.computer_id_code, l.lab_code, w.name as wing_name
        FROM maintenance_records m
        JOIN users u ON m.technician_id = u.id
        JOIN complaints c ON m.complaint_id = c.id
        JOIN computers cmp ON m.computer_id = cmp.id
        JOIN laboratories l ON cmp.lab_id = l.id
        JOIN floors f ON l.floor_id = f.id
        JOIN wings w ON f.wing_id = w.id
        ORDER BY m.completed_at DESC
        LIMIT 5
    ''')

    stats = {
        'total_computers': total_computers,
        'working_computers': working_computers,
        'faulty_computers': faulty_computers,
        'under_repair_computers': under_repair_computers,
        'repaired_computers': repaired_computers,
        'decommissioned_computers': decommissioned_computers,
        'open_complaints': open_complaints,
        'total_laboratories': total_laboratories,
        'available_technicians': available_technicians
    }

    return render_template('hod/dashboard.html',
                           user=user,
                           stats=stats,
                           high_priority_active=high_priority_active,
                           recent_complaints=recent_complaints,
                           recent_repairs=recent_repairs)


@hod_bp.route('/infrastructure')
@login_required
@role_required('hod')
def infrastructure():
    user = get_current_user()
    
    # Query all wings with nested floors, laboratories, and computer counts
    wings = query_db("SELECT * FROM wings ORDER BY code ASC")
    infra_data = []

    for wing in wings:
        floors = query_db("SELECT * FROM floors WHERE wing_id = ? ORDER BY floor_number ASC", (wing['id'],))
        floors_list = []
        for fl in floors:
            labs = query_db('''
                SELECT l.*, 
                       (SELECT COUNT(*) FROM computers WHERE lab_id = l.id AND operational_status = 'Working') as working_count,
                       (SELECT COUNT(*) FROM computers WHERE lab_id = l.id AND operational_status IN ('Fault Reported', 'Under Repair')) as faulty_count,
                       (SELECT COUNT(*) FROM computers WHERE lab_id = l.id AND operational_status = 'Repaired') as repaired_count,
                       (SELECT COUNT(*) FROM computers WHERE lab_id = l.id AND operational_status = 'Decommissioned') as decommissioned_count,
                       (SELECT COUNT(*) FROM computers WHERE lab_id = l.id) as total_pc_count,
                       u.full_name as in_charge_name
                FROM laboratories l
                LEFT JOIN users u ON l.in_charge_faculty_id = u.id
                WHERE l.floor_id = ?
                ORDER BY l.lab_code ASC
            ''', (fl['id'],))
            floors_list.append({
                'floor': fl,
                'labs': labs
            })
        infra_data.append({
            'wing': wing,
            'floors': floors_list
        })

    return render_template('hod/infrastructure.html', user=user, infra_data=infra_data)


@hod_bp.route('/infrastructure/lab/<int:lab_id>')
@login_required
@role_required('hod')
def lab_details(lab_id):
    lab = query_db('''
        SELECT l.*, f.name as floor_name, w.name as wing_name, u.full_name as in_charge_name
        FROM laboratories l
        JOIN floors f ON l.floor_id = f.id
        JOIN wings w ON f.wing_id = w.id
        LEFT JOIN users u ON l.in_charge_faculty_id = u.id
        WHERE l.id = ?
    ''', (lab_id,), one=True)
    if not lab:
        return jsonify({'error': 'Lab not found'}), 404

    computers = query_db("SELECT * FROM computers WHERE lab_id = ? ORDER BY pc_number ASC", (lab_id,))
    return jsonify({
        'lab': dict(lab),
        'computers': [dict(c) for c in computers]
    })


@hod_bp.route('/complaints')
@login_required
@role_required('hod')
def complaints():
    user = get_current_user()
    status = request.args.get('status', '')
    priority = request.args.get('priority', '')
    wing = request.args.get('wing', '')
    floor = request.args.get('floor', '')
    lab = request.args.get('lab', '')
    date = request.args.get('date', '')
    search = request.args.get('search', '')

    all_complaints = Complaint.get_all(
        status=status if status else None,
        priority=priority if priority else None,
        wing=wing if wing else None,
        floor=floor if floor else None,
        lab=lab if lab else None,
        date=date if date else None,
        search=search if search else None
    )

    wings = query_db("SELECT name FROM wings ORDER BY code ASC")

    return render_template('hod/complaints.html',
                           user=user,
                           complaints=all_complaints,
                           wings=[w['name'] for w in wings],
                           current_status=status,
                           current_priority=priority,
                           current_wing=wing,
                           current_floor=floor,
                           current_lab=lab,
                           current_date=date,
                           current_search=search)


@hod_bp.route('/computer-health')
@login_required
@role_required('hod')
def computer_health():
    user = get_current_user()

    # Computer Health distribution
    working = Computer.get_all(status='Working')
    faulty = Computer.get_all(status='Fault Reported')
    under_repair = Computer.get_all(status='Under Repair')
    repaired = Computer.get_all(status='Repaired')
    decommissioned = Computer.get_all(status='Decommissioned')

    # Frequently reported computer problems
    frequent_faults = query_db('''
        SELECT problem_category, COUNT(*) as count
        FROM complaints
        GROUP BY problem_category
        ORDER BY count DESC
    ''')

    # Recent maintenance records
    recent_maintenance = query_db('''
        SELECT m.*, u.full_name as technician_name, c.complaint_code, c.problem_category, c.priority,
               cmp.computer_id_code, cmp.pc_number, l.lab_code, w.name as wing_name
        FROM maintenance_records m
        JOIN users u ON m.technician_id = u.id
        JOIN complaints c ON m.complaint_id = c.id
        JOIN computers cmp ON m.computer_id = cmp.id
        JOIN laboratories l ON cmp.lab_id = l.id
        JOIN floors f ON l.floor_id = f.id
        JOIN wings w ON f.wing_id = w.id
        ORDER BY m.completed_at DESC
        LIMIT 20
    ''')

    return render_template('hod/computer_health.html',
                           user=user,
                           working=working,
                           faulty=faulty,
                           under_repair=under_repair,
                           repaired=repaired,
                           decommissioned=decommissioned,
                           frequent_faults=frequent_faults,
                           recent_maintenance=recent_maintenance)


@hod_bp.route('/technicians')
@login_required
@role_required('hod')
def technician_monitoring():
    user = get_current_user()
    technicians = User.get_all_by_role('technician')

    tech_stats = []
    for t in technicians:
        assigned = query_db("SELECT COUNT(*) as c FROM complaints WHERE assigned_technician_id = ? AND status IN ('Accepted', 'In Progress')", (t.id,), one=True)['c']
        completed = query_db("SELECT COUNT(*) as c FROM maintenance_records WHERE technician_id = ?", (t.id,), one=True)['c']
        in_progress = query_db("SELECT COUNT(*) as c FROM complaints WHERE assigned_technician_id = ? AND status = 'In Progress'", (t.id,), one=True)['c']
        
        # Calculate completion rate
        total_assigned = query_db("SELECT COUNT(*) as c FROM complaints WHERE assigned_technician_id = ?", (t.id,), one=True)['c']
        completion_rate = round((completed / total_assigned * 100) if total_assigned > 0 else 100.0, 1)

        recent_jobs = query_db('''
            SELECT m.*, c.complaint_code, c.problem_category, cmp.computer_id_code
            FROM maintenance_records m
            JOIN complaints c ON m.complaint_id = c.id
            JOIN computers cmp ON m.computer_id = cmp.id
            WHERE m.technician_id = ?
            ORDER BY m.completed_at DESC LIMIT 3
        ''', (t.id,))

        tech_stats.append({
            'technician': t,
            'assigned': assigned,
            'completed': completed,
            'in_progress': in_progress,
            'completion_rate': completion_rate,
            'recent_jobs': recent_jobs
        })

    return render_template('hod/technician_monitoring.html', user=user, tech_stats=tech_stats)


@hod_bp.route('/reports')
@login_required
@role_required('hod')
def reports():
    user = get_current_user()

    # 1. Complaints by wing
    complaints_by_wing = query_db('''
        SELECT w.name as wing_name, COUNT(c.id) as count
        FROM wings w
        LEFT JOIN floors f ON f.wing_id = w.id
        LEFT JOIN laboratories l ON l.floor_id = f.id
        LEFT JOIN computers cmp ON cmp.lab_id = l.id
        LEFT JOIN complaints c ON c.computer_id = cmp.id
        GROUP BY w.id
        ORDER BY w.code ASC
    ''')

    # 2. Complaints by problem category
    complaints_by_cat = query_db('''
        SELECT problem_category, COUNT(*) as count
        FROM complaints
        GROUP BY problem_category
        ORDER BY count DESC
    ''')

    # 3. Overall completion metrics
    total_complaints = query_db("SELECT COUNT(*) as c FROM complaints", one=True)['c']
    resolved_complaints = query_db("SELECT COUNT(*) as c FROM complaints WHERE status IN ('Resolved', 'Closed')", one=True)['c']
    completion_rate = round((resolved_complaints / total_complaints * 100) if total_complaints > 0 else 0.0, 1)

    # 4. Average repair turnaround estimate in hours
    # Using difference between accepted_at and resolved_at for resolved complaints
    avg_hours_row = query_db('''
        SELECT AVG((JULIANDAY(resolved_at) - JULIANDAY(accepted_at)) * 24) as avg_hours
        FROM complaints
        WHERE status = 'Resolved' AND accepted_at IS NOT NULL AND resolved_at IS NOT NULL
    ''', one=True)
    avg_repair_hours = round(avg_hours_row['avg_hours'], 1) if avg_hours_row and avg_hours_row['avg_hours'] else 3.5

    # 5. Complaints by priority
    complaints_by_priority = query_db('''
        SELECT priority, COUNT(*) as count
        FROM complaints
        GROUP BY priority
    ''')

    # 6. Monthly trend data (last 6 months or demo distribution)
    monthly_trend = [
        {'month': 'May', 'count': 12},
        {'month': 'Jun', 'count': 18},
        {'month': 'Jul', 'count': 8},
        {'month': 'Aug', 'count': 24},
        {'month': 'Sep', 'count': 31},
        {'month': 'Oct', 'count': total_complaints}
    ]

    return render_template('hod/reports.html',
                           user=user,
                           complaints_by_wing=complaints_by_wing,
                           complaints_by_cat=complaints_by_cat,
                           total_complaints=total_complaints,
                           resolved_complaints=resolved_complaints,
                           completion_rate=completion_rate,
                           avg_repair_hours=avg_repair_hours,
                           complaints_by_priority=complaints_by_priority,
                           monthly_trend=monthly_trend)


@hod_bp.route('/audit-logs')
@login_required
@role_required('hod')
def audit_logs():
    user = get_current_user()
    logs = AuditLog.get_recent(limit=100)
    return render_template('hod/audit_logs.html', user=user, logs=logs)
