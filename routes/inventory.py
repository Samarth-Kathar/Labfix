from datetime import datetime
from flask import Blueprint, render_template, request, redirect, url_for, flash, jsonify
from database import query_db, execute_db
from models import Computer, AuditLog, Notification
from services.auth_service import login_required, role_required, get_current_user

inventory_bp = Blueprint('inventory', __name__, url_prefix='/inventory')

@inventory_bp.route('/')
@login_required
@role_required(['hod', 'technician'])
def index():
    user = get_current_user()

    search = request.args.get('search', '').strip()
    wing = request.args.get('wing', '').strip()
    floor = request.args.get('floor', '').strip()
    lab = request.args.get('lab', '').strip()
    status = request.args.get('status', '').strip()
    sort_by = request.args.get('sort_by', 'id')
    order = request.args.get('order', 'ASC')

    computers = Computer.get_all(
        search=search if search else None,
        wing=wing if wing else None,
        floor=floor if floor else None,
        lab=lab if lab else None,
        status=status if status else None,
        sort_by=sort_by,
        order=order
    )

    wings = query_db("SELECT name FROM wings ORDER BY code ASC")

    return render_template('inventory/index.html',
                           user=user,
                           computers=computers,
                           wings=[w['name'] for w in wings],
                           current_search=search,
                           current_wing=wing,
                           current_floor=floor,
                           current_lab=lab,
                           current_status=status,
                           sort_by=sort_by,
                           order=order)


@inventory_bp.route('/add', methods=['GET', 'POST'])
@login_required
@role_required(['hod', 'technician'])
def add():
    user = get_current_user()

    if request.method == 'POST':
        lab_id = request.form.get('lab_id', type=int)
        pc_number = request.form.get('pc_number', '').strip().upper()
        computer_id_code = request.form.get('computer_id_code', '').strip().upper()
        brand = request.form.get('brand', '').strip()
        model = request.form.get('model', '').strip()
        serial_number = request.form.get('serial_number', '').strip().upper()
        processor = request.form.get('processor', '').strip()
        ram = request.form.get('ram', '').strip()
        storage = request.form.get('storage', '').strip()
        os_name = request.form.get('os', '').strip()
        installation_date = request.form.get('installation_date', '').strip() or datetime.now().strftime('%Y-%m-%d')

        if not lab_id or not pc_number or not computer_id_code or not brand or not model or not serial_number:
            flash('All primary fields (Location, PC Number, Computer ID, Brand, Model, Serial Number) are required.', 'danger')
            return render_template('inventory/add.html', user=user)

        # Check uniqueness of computer_id_code and serial_number
        existing_code = Computer.find_by_code(computer_id_code)
        if existing_code:
            flash(f'Computer ID Code "{computer_id_code}" is already in use.', 'danger')
            return render_template('inventory/add.html', user=user)

        existing_serial = query_db("SELECT id FROM computers WHERE serial_number = ?", (serial_number,), one=True)
        if existing_serial:
            flash(f'Serial Number "{serial_number}" already exists in the system.', 'danger')
            return render_template('inventory/add.html', user=user)

        # Check uniqueness of PC number within that lab
        existing_pc_in_lab = query_db("SELECT id FROM computers WHERE lab_id = ? AND pc_number = ?", (lab_id, pc_number), one=True)
        if existing_pc_in_lab:
            flash(f'PC Number "{pc_number}" already exists in the selected laboratory.', 'danger')
            return render_template('inventory/add.html', user=user)

        # Create computer
        new_comp = Computer.create(
            lab_id=lab_id,
            pc_number=pc_number,
            computer_id_code=computer_id_code,
            brand=brand,
            model=model,
            serial_number=serial_number,
            processor=processor or 'Intel Core i7-11700 2.50GHz',
            ram=ram or '16 GB DDR4',
            storage=storage or '512 GB NVMe SSD',
            os=os_name or 'Windows 11 Pro 64-bit',
            installation_date=installation_date
        )

        AuditLog.log_action(
            user_id=user.id,
            action='ADD_COMPUTER',
            entity_type='COMPUTER',
            entity_id=str(new_comp.id),
            details=f"Added new workstation {computer_id_code} (SN: {serial_number}) to lab #{lab_id}"
        )

        Notification.create(
            target_role='hod',
            title='New Computer Added to Inventory',
            message=f"{computer_id_code} added to inventory by {user.full_name}.",
            link=f"/inventory/computer/{new_comp.id}",
            type='inventory_change'
        )

        flash(f'Computer {computer_id_code} successfully added to inventory!', 'success')
        return redirect(url_for('inventory.detail', computer_id=new_comp.id))

    return render_template('inventory/add.html', user=user)


@inventory_bp.route('/computer/<int:computer_id>')
@login_required
@role_required(['hod', 'technician'])
def detail(computer_id):
    user = get_current_user()
    comp = Computer.find_by_id(computer_id)
    if not comp:
        flash('Computer workstation not found.', 'danger')
        return redirect(url_for('inventory.index'))

    maintenance_history = comp.get_maintenance_history()
    complaints = comp.get_complaints()

    # Check if this computer replaced another or was replaced by another
    replacement_from = query_db('''
        SELECT cr.*, c.computer_id_code as old_code, c.serial_number as old_serial, u.full_name as user_name
        FROM computer_replacements cr
        JOIN computers c ON cr.old_computer_id = c.id
        JOIN users u ON cr.performed_by_user_id = u.id
        WHERE cr.new_computer_id = ?
    ''', (computer_id,), one=True)

    replacement_to = query_db('''
        SELECT cr.*, c.computer_id_code as new_code, c.serial_number as new_serial, u.full_name as user_name
        FROM computer_replacements cr
        JOIN computers c ON cr.new_computer_id = c.id
        JOIN users u ON cr.performed_by_user_id = u.id
        WHERE cr.old_computer_id = ?
    ''', (computer_id,), one=True)

    return render_template('inventory/detail.html',
                           user=user,
                           computer=comp,
                           maintenance_history=maintenance_history,
                           complaints=complaints,
                           replacement_from=replacement_from,
                           replacement_to=replacement_to)


@inventory_bp.route('/computer/<int:computer_id>/replace', methods=['GET', 'POST'])
@login_required
@role_required(['hod', 'technician'])
def replace(computer_id):
    user = get_current_user()
    comp = Computer.find_by_id(computer_id)
    if not comp:
        flash('Computer workstation not found.', 'danger')
        return redirect(url_for('inventory.index'))

    if comp.operational_status == 'Decommissioned':
        flash('This computer has already been decommissioned and cannot be replaced.', 'warning')
        return redirect(url_for('inventory.detail', computer_id=comp.id))

    if request.method == 'POST':
        new_computer_id_code = request.form.get('new_computer_id_code', '').strip().upper()
        new_serial = request.form.get('new_serial', '').strip().upper()
        new_brand = request.form.get('new_brand', '').strip()
        new_model = request.form.get('new_model', '').strip()
        new_processor = request.form.get('new_processor', '').strip()
        new_ram = request.form.get('new_ram', '').strip()
        new_storage = request.form.get('new_storage', '').strip()
        new_os = request.form.get('new_os', '').strip()
        replacement_date = request.form.get('replacement_date', '').strip() or datetime.now().strftime('%Y-%m-%d %H:%M:%S')
        reason = request.form.get('reason', '').strip()
        notes = request.form.get('notes', '').strip()

        if not new_computer_id_code or not new_serial or not new_brand or not new_model or not reason:
            flash('Please complete all required fields (New Computer ID, Serial Number, Brand, Model, and Reason).', 'danger')
            return render_template('inventory/replace.html', user=user, computer=comp)

        # Check new code / serial uniqueness
        if Computer.find_by_code(new_computer_id_code):
            flash(f'New Computer ID "{new_computer_id_code}" is already in use.', 'danger')
            return render_template('inventory/replace.html', user=user, computer=comp)

        if query_db("SELECT id FROM computers WHERE serial_number = ?", (new_serial,), one=True):
            flash(f'New Serial Number "{new_serial}" already exists in the system.', 'danger')
            return render_template('inventory/replace.html', user=user, computer=comp)

        # Perform replacement
        new_computer = comp.replace_with(
            new_computer_id_code=new_computer_id_code,
            new_serial=new_serial,
            new_brand=new_brand,
            new_model=new_model,
            new_processor=new_processor or comp.processor,
            new_ram=new_ram or comp.ram,
            new_storage=new_storage or comp.storage,
            new_os=new_os or comp.os,
            replacement_date=replacement_date,
            reason=reason,
            user_id=user.id,
            notes=notes
        )

        Notification.create(
            target_role='hod',
            title='Computer Replacement Completed',
            message=f"{comp.computer_id_code} replaced with {new_computer_id_code} at {comp.lab_code}-{comp.pc_number}.",
            link=f"/inventory/computer/{new_computer.id}",
            type='inventory_change'
        )

        flash(f'Replacement completed! {comp.computer_id_code} was archived and {new_computer.computer_id_code} is now active.', 'success')
        return redirect(url_for('inventory.detail', computer_id=new_computer.id))

    return render_template('inventory/replace.html', user=user, computer=comp)


@inventory_bp.route('/computer/<int:computer_id>/decommission', methods=['POST'])
@login_required
@role_required(['hod', 'technician'])
def decommission(computer_id):
    user = get_current_user()
    comp = Computer.find_by_id(computer_id)
    if not comp:
        flash('Computer workstation not found.', 'danger')
        return redirect(url_for('inventory.index'))

    reason = request.form.get('reason', '').strip()
    if not reason:
        flash('A reason for decommissioning is required.', 'danger')
        return redirect(url_for('inventory.detail', computer_id=comp.id))

    comp.decommission(reason=reason, user_id=user.id)

    Notification.create(
        target_role='hod',
        title='Workstation Decommissioned',
        message=f"{comp.computer_id_code} decommissioned by {user.full_name}. Reason: {reason}",
        link=f"/inventory/computer/{comp.id}",
        type='alert'
    )

    flash(f'Computer {comp.computer_id_code} has been decommissioned.', 'info')
    return redirect(url_for('inventory.detail', computer_id=comp.id))
