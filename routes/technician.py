from datetime import datetime
from flask import Blueprint, render_template, request, redirect, url_for, flash, jsonify
from models import Complaint, Computer, User, MaintenanceRecord, SMSLog
from services.auth_service import login_required, role_required, get_current_user

technician_bp = Blueprint('technician', __name__, url_prefix='/technician')

@technician_bp.route('/dashboard')
@login_required
@role_required('technician')
def dashboard():
    user = get_current_user()

    # Query filter parameters
    status = request.args.get('status', '')
    priority = request.args.get('priority', '')
    wing = request.args.get('wing', '')
    floor = request.args.get('floor', '')
    lab = request.args.get('lab', '')
    search = request.args.get('search', '')

    all_complaints = Complaint.get_all(
        status=status if status else None,
        priority=priority if priority else None,
        wing=wing if wing else None,
        floor=floor if floor else None,
        lab=lab if lab else None,
        search=search if search else None
    )

    # Calculate real overview counters
    all_unfiltered = Complaint.get_all()
    today_str = datetime.now().strftime('%Y-%m-%d')
    
    new_pending = sum(1 for c in all_unfiltered if c.status == 'Pending')
    my_assigned = sum(1 for c in all_unfiltered if c.assigned_technician_id == user.id and c.status == 'Accepted')
    my_in_progress = sum(1 for c in all_unfiltered if c.assigned_technician_id == user.id and c.status == 'In Progress')
    high_priority = sum(1 for c in all_unfiltered if c.priority in ('High', 'Critical') and c.status in ('Pending', 'Accepted', 'In Progress'))
    
    # Resolved today
    resolved_today = sum(1 for c in all_unfiltered if c.assigned_technician_id == user.id and c.status == 'Resolved' and c.resolved_at and str(c.resolved_at).startswith(today_str))

    # Fetch technician's received SMS alerts
    sms_logs = SMSLog.get_for_user(user.id, limit=15)
    sms_stats = SMSLog.get_stats()

    return render_template('technician/dashboard.html',
                           user=user,
                           complaints=all_complaints,
                           new_pending=new_pending,
                           my_assigned=my_assigned,
                           my_in_progress=my_in_progress,
                           high_priority=high_priority,
                           resolved_today=resolved_today,
                           sms_logs=sms_logs,
                           sms_stats=sms_stats,
                           current_status=status,
                           current_priority=priority,
                           current_wing=wing,
                           current_floor=floor,
                           current_lab=lab,
                           current_search=search)


@technician_bp.route('/sms-alerts')
@login_required
@role_required('technician')
def sms_alerts():
    user = get_current_user()
    sms_logs = SMSLog.get_for_user(user.id, limit=50)
    sms_stats = SMSLog.get_stats()
    return render_template('technician/sms_alerts.html', user=user, sms_logs=sms_logs, sms_stats=sms_stats)


@technician_bp.route('/complaint/<string:code>')
@login_required
@role_required('technician')
def complaint_detail(code):
    user = get_current_user()
    complaint = Complaint.find_by_code(code)
    if not complaint:
        flash('Complaint not found.', 'danger')
        return redirect(url_for('technician.dashboard'))

    computer = Computer.find_by_id(complaint.computer_id)
    maintenance = MaintenanceRecord.get_by_complaint_id(complaint.id)
    computer_history = computer.get_maintenance_history() if computer else []

    return render_template('technician/complaint_detail.html',
                           user=user,
                           complaint=complaint,
                           computer=computer,
                           maintenance=maintenance,
                           computer_history=computer_history)


@technician_bp.route('/complaint/<int:complaint_id>/accept', methods=['POST'])
@login_required
@role_required('technician')
def accept_complaint(complaint_id):
    user = get_current_user()
    complaint = Complaint.find_by_id(complaint_id)
    if not complaint:
        flash('Complaint not found.', 'danger')
        return redirect(url_for('technician.dashboard'))

    success, msg = complaint.accept_by_technician(user.id)
    if success:
        flash(f'Success: You have claimed complaint {complaint.complaint_code}.', 'success')
    else:
        flash(f'Unable to accept complaint: {msg}', 'danger')

    return redirect(url_for('technician.complaint_detail', code=complaint.complaint_code))


@technician_bp.route('/complaint/<int:complaint_id>/start', methods=['POST'])
@login_required
@role_required('technician')
def start_repair(complaint_id):
    user = get_current_user()
    complaint = Complaint.find_by_id(complaint_id)
    if not complaint:
        flash('Complaint not found.', 'danger')
        return redirect(url_for('technician.dashboard'))

    success, msg = complaint.start_repair(user.id)
    if success:
        flash(f'Repair on {complaint.complaint_code} marked In Progress.', 'info')
    else:
        flash(f'Error starting repair: {msg}', 'danger')

    return redirect(url_for('technician.complaint_detail', code=complaint.complaint_code))


@technician_bp.route('/complaint/<int:complaint_id>/resolve', methods=['POST'])
@login_required
@role_required('technician')
def resolve_complaint(complaint_id):
    user = get_current_user()
    complaint = Complaint.find_by_id(complaint_id)
    if not complaint:
        flash('Complaint not found.', 'danger')
        return redirect(url_for('technician.dashboard'))

    diagnosis = request.form.get('diagnosis', '').strip()
    action_taken = request.form.get('action_taken', '').strip()
    parts_replaced = request.form.get('parts_replaced', '').strip()
    solution_description = request.form.get('solution_description', '').strip()
    repair_notes = request.form.get('repair_notes', '').strip()
    operational_status = request.form.get('operational_status', 'Repaired')

    if not diagnosis or not action_taken or not solution_description:
        flash('Diagnosis, Action Taken, and Solution Description are required.', 'danger')
        return redirect(url_for('technician.complaint_detail', code=complaint.complaint_code))

    success, msg = complaint.mark_resolved(
        technician_id=user.id,
        diagnosis=diagnosis,
        action_taken=action_taken,
        parts_replaced=parts_replaced,
        solution_description=solution_description,
        repair_notes=repair_notes,
        computer_operational_status=operational_status
    )

    if success:
        flash(f'Complaint {complaint.complaint_code} successfully resolved and recorded in maintenance log!', 'success')
    else:
        flash(f'Failed to resolve complaint: {msg}', 'danger')

    return redirect(url_for('technician.complaint_detail', code=complaint.complaint_code))


@technician_bp.route('/history')
@login_required
@role_required('technician')
def repair_history():
    user = get_current_user()
    # Find all complaints resolved by this technician
    sql = '''
        SELECT c.*, m.diagnosis, m.action_taken, m.parts_replaced, m.solution_description, m.completed_at as maintenance_completed_at,
               cmp.computer_id_code, cmp.pc_number, l.lab_code, l.name as lab_name, f.name as floor_name, w.name as wing_name,
               u.full_name as faculty_name
        FROM complaints c
        JOIN maintenance_records m ON c.id = m.complaint_id
        JOIN computers cmp ON c.computer_id = cmp.id
        JOIN laboratories l ON cmp.lab_id = l.id
        JOIN floors f ON l.floor_id = f.id
        JOIN wings w ON f.wing_id = w.id
        JOIN users u ON c.faculty_id = u.id
        WHERE m.technician_id = ?
        ORDER BY m.completed_at DESC
    '''
    from database import query_db
    records = query_db(sql, (user.id,))
    return render_template('technician/history.html', user=user, records=records)
