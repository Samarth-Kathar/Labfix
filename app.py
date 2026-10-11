import os
from flask import Flask, render_template, redirect, url_for, session, send_from_directory, g
from config import Config
from database import init_db, close_db, query_db
from models import User, Notification
from routes.auth import auth_bp
from routes.hod import hod_bp
from routes.faculty import faculty_bp
from routes.technician import technician_bp
from routes.inventory import inventory_bp
from routes.api import api_bp
from services.auth_service import get_current_user

def create_app(config_class=Config):
    app = Flask(__name__)
    app.config.from_object(config_class)

    # Ensure upload directory exists
    os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

    # Register blueprints
    app.register_blueprint(auth_bp)
    app.register_blueprint(hod_bp)
    app.register_blueprint(faculty_bp)
    app.register_blueprint(technician_bp)
    app.register_blueprint(inventory_bp)
    app.register_blueprint(api_bp)

    # Teardown database connection
    app.teardown_appcontext(close_db)

    # Root route
    @app.route('/')
    def index():
        if 'user_id' in session:
            role = session.get('role')
            if role == 'hod':
                return redirect(url_for('hod.dashboard'))
            elif role == 'faculty':
                return redirect(url_for('faculty.dashboard'))
            elif role == 'technician':
                return redirect(url_for('technician.dashboard'))
        return redirect(url_for('auth.login'))

    # Serve uploaded images
    @app.route('/uploads/<filename>')
    def uploaded_file(filename):
        return send_from_directory(app.config['UPLOAD_FOLDER'], filename)

    # Global context processor to make current_user and notifications available in all templates
    @app.context_processor
    def inject_global_data():
        user = get_current_user()
        unread_count = 0
        notifications = []
        if user:
            unread_count = Notification.get_unread_count(user.id, user.role)
            notifications = Notification.get_for_user(user.id, user.role, limit=5)
        return {
            'current_user': user,
            'unread_notifications_count': unread_count,
            'recent_notifications': notifications
        }

    # Custom Jinja filters
    @app.template_filter('status_badge_class')
    def status_badge_class(status):
        mapping = {
            'Working': 'badge-success',
            'Repaired': 'badge-primary',
            'Under Repair': 'badge-warning',
            'Fault Reported': 'badge-danger',
            'Decommissioned': 'badge-secondary',
            'Pending': 'badge-warning',
            'Accepted': 'badge-info',
            'In Progress': 'badge-primary',
            'Resolved': 'badge-success',
            'Closed': 'badge-secondary'
        }
        return mapping.get(status, 'badge-light')

    @app.template_filter('priority_badge_class')
    def priority_badge_class(priority):
        mapping = {
            'Critical': 'badge-critical',
            'High': 'badge-danger',
            'Medium': 'badge-warning',
            'Low': 'badge-info'
        }
        return mapping.get(priority, 'badge-light')

    # Error handlers
    @app.errorhandler(404)
    def page_not_found(e):
        return render_template('errors/404.html'), 404

    @app.errorhandler(403)
    def forbidden(e):
        return render_template('errors/403.html'), 403

    @app.errorhandler(500)
    def server_error(e):
        return render_template('errors/500.html'), 500

    return app

app = create_app()

if __name__ == '__main__':
    with app.app_context():
        init_db()
    print("=" * 60)
    print("  LABFIX: Smart Computer Lab Management System")
    print("  Server running on http://127.0.0.1:5000")
    print("  Default credentials:")
    print("    HOD:        hod / Password@123")
    print("    Faculty:    faculty / Password@123")
    print("    Technician: tech / Password@123")
    print("=" * 60)
    app.run(host='127.0.0.1', port=5000, debug=True)
