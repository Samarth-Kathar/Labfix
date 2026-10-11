from flask import Blueprint, jsonify, request, session
from database import query_db, execute_db
from models import Notification, Computer
from services.auth_service import login_required, get_current_user

api_bp = Blueprint('api', __name__, url_prefix='/api')

@api_bp.route('/wings')
def get_wings():
    rows = query_db("SELECT id, name, code, description FROM wings ORDER BY code ASC")
    return jsonify([dict(r) for r in rows])

@api_bp.route('/floors')
def get_floors():
    wing_id = request.args.get('wing_id', type=int)
    if not wing_id:
        return jsonify([])
    rows = query_db("SELECT id, wing_id, floor_number, name FROM floors WHERE wing_id = ? ORDER BY floor_number ASC", (wing_id,))
    return jsonify([dict(r) for r in rows])

@api_bp.route('/laboratories')
def get_laboratories():
    floor_id = request.args.get('floor_id', type=int)
    if not floor_id:
        return jsonify([])
    rows = query_db('''
        SELECT l.id, l.floor_id, l.lab_code, l.name, l.capacity, l.department,
               (SELECT COUNT(*) FROM computers WHERE lab_id = l.id AND operational_status != 'Decommissioned') as active_pc_count
        FROM laboratories l
        WHERE l.floor_id = ? 
        ORDER BY l.lab_code ASC
    ''', (floor_id,))
    return jsonify([dict(r) for r in rows])

@api_bp.route('/computers')
def get_computers():
    lab_id = request.args.get('lab_id', type=int)
    only_active = request.args.get('active_only', '1') == '1'
    if not lab_id:
        return jsonify([])
    
    sql = '''
        SELECT id, lab_id, pc_number, computer_id_code, brand, model, operational_status, is_active
        FROM computers
        WHERE lab_id = ?
    '''
    if only_active:
        sql += " AND operational_status != 'Decommissioned' AND is_active = 1"
    
    sql += " ORDER BY pc_number ASC"
    rows = query_db(sql, (lab_id,))
    return jsonify([dict(r) for r in rows])

@api_bp.route('/computer/<int:computer_id>')
def get_computer_info(computer_id):
    comp = Computer.find_by_id(computer_id)
    if not comp:
        return jsonify({'error': 'Not found'}), 404
    return jsonify(comp.to_dict())

@api_bp.route('/notifications')
@login_required
def get_notifications():
    user = get_current_user()
    if not user:
        return jsonify({'notifications': [], 'unread_count': 0})
    
    notifs = Notification.get_for_user(user.id, user.role, limit=15)
    unread_count = Notification.get_unread_count(user.id, user.role)
    
    return jsonify({
        'unread_count': unread_count,
        'notifications': [dict(n) for n in notifs]
    })

@api_bp.route('/notifications/read-all', methods=['POST'])
@login_required
def mark_all_notifications_read():
    user = get_current_user()
    if user:
        Notification.mark_all_as_read(user.id, user.role)
    return jsonify({'success': True})

@api_bp.route('/notifications/<int:notification_id>/read', methods=['POST'])
@login_required
def mark_single_notification_read(notification_id):
    execute_db("UPDATE notifications SET is_read = 1 WHERE id = ?", (notification_id,))
    return jsonify({'success': True})
