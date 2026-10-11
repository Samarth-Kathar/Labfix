from flask import Blueprint, render_template, request, redirect, url_for, session, flash, current_app
from models import User, AuditLog
from services.auth_service import get_current_user

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/login', methods=['GET', 'POST'])
def login():
    # If already logged in, redirect directly to dashboard
    if 'user_id' in session:
        role = session.get('role')
        if role == 'hod':
            return redirect(url_for('hod.dashboard'))
        elif role == 'faculty':
            return redirect(url_for('faculty.dashboard'))
        elif role == 'technician':
            return redirect(url_for('technician.dashboard'))

    selected_role = request.args.get('role', '')

    if request.method == 'POST':
        username = request.form.get('username', '').strip()
        password = request.form.get('password', '')
        role = request.form.get('role', '').strip()
        remember = bool(request.form.get('remember'))

        if not username or not password:
            flash('Please enter both username/email and password.', 'danger')
            return render_template('auth/login.html', selected_role=role, username=username)

        user = User.find_by_username(username)

        if not user or not user.verify_password(password):
            flash('Invalid username or password. Please verify your credentials.', 'danger')
            return render_template('auth/login.html', selected_role=role, username=username)

        # If a specific role was selected, verify it matches
        if role and user.role != role:
            flash(f'Account exists, but does not have the selected role: {role.upper()}. This account is registered as {user.role.upper()}.', 'warning')
            return render_template('auth/login.html', selected_role=role, username=username)

        # Successful login
        session.clear()
        session['user_id'] = user.id
        session['username'] = user.username
        session['full_name'] = user.full_name
        session['role'] = user.role
        session['email'] = user.email

        if remember:
            session.permanent = True

        AuditLog.log_action(
            user_id=user.id,
            action='USER_LOGIN',
            entity_type='USER',
            entity_id=str(user.id),
            details=f"User {user.username} ({user.role}) logged in successfully.",
            ip_address=request.remote_addr or '127.0.0.1'
        )

        flash(f'Welcome back, {user.full_name}!', 'success')

        # Check for next url
        next_page = request.args.get('next')
        if next_page and next_page.startswith('/'):
            return redirect(next_page)

        # Redirect according to role
        if user.role == 'hod':
            return redirect(url_for('hod.dashboard'))
        elif user.role == 'faculty':
            return redirect(url_for('faculty.dashboard'))
        elif user.role == 'technician':
            return redirect(url_for('technician.dashboard'))

    return render_template('auth/login.html', selected_role=selected_role)


@auth_bp.route('/logout')
def logout():
    user_id = session.get('user_id')
    if user_id:
        AuditLog.log_action(
            user_id=user_id,
            action='USER_LOGOUT',
            entity_type='USER',
            entity_id=str(user_id),
            details="User logged out.",
            ip_address=request.remote_addr or '127.0.0.1'
        )
    session.clear()
    flash('You have been securely signed out.', 'info')
    return redirect(url_for('auth.login'))
