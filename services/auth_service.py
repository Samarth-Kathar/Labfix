from functools import wraps
from flask import session, redirect, url_for, flash, abort, request, g
from models import User

def login_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if 'user_id' not in session:
            flash('Please sign in to access this page.', 'warning')
            next_url = request.full_path.rstrip('?') if request.query_string else request.path
            return redirect(url_for('auth.login', next=next_url))
        return f(*args, **kwargs)
    return decorated_function

def role_required(*allowed_roles):
    """
    Decorator to restrict access to users having one of the specified roles.
    Accepts one or more roles or a list of roles.
    """
    # Flatten if passed as list/tuple
    roles = []
    for r in allowed_roles:
        if isinstance(r, (list, tuple)):
            roles.extend(r)
        else:
            roles.append(r)

    def decorator(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            if 'user_id' not in session:
                flash('Please sign in to access this page.', 'warning')
                next_url = request.full_path.rstrip('?') if request.query_string else request.path
                return redirect(url_for('auth.login', next=next_url))
            
            user_role = session.get('role')
            if user_role not in roles:
                flash(f'Access denied. This section requires {", ".join(roles).upper()} privileges.', 'danger')
                # Redirect to user's appropriate dashboard
                if user_role == 'hod':
                    return redirect(url_for('hod.dashboard'))
                elif user_role == 'faculty':
                    return redirect(url_for('faculty.dashboard'))
                elif user_role == 'technician':
                    return redirect(url_for('technician.dashboard'))
                return redirect(url_for('auth.login'))
                
            return f(*args, **kwargs)
        return decorated_function
    return decorator

def get_current_user():
    """Returns the current logged-in User object, cached on g."""
    if 'user_id' not in session:
        return None
    if not hasattr(g, 'current_user'):
        g.current_user = User.find_by_id(session['user_id'])
    return g.current_user
