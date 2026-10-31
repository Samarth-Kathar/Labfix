import os
import json
import uuid
import base64
import urllib.request
import urllib.parse
from datetime import datetime
from config import Config
from database import query_db, execute_db

class SMSService:
    """
    Real-world SMS Dispatcher for LabFix Computer Lab Management System.
    Supports Twilio REST API, Fast2SMS Gateway, Custom Webhooks, 
    and an intelligent Telecom Carrier Simulator for offline/viva demonstrations.
    """

    @staticmethod
    def get_provider():
        """Detect which SMS provider is active based on config and credentials."""
        if not Config.SMS_ENABLED:
            return 'DISABLED'
        
        provider = Config.SMS_PROVIDER.upper()
        if provider == 'TWILIO' or (provider == 'AUTO' and Config.TWILIO_ACCOUNT_SID and Config.TWILIO_AUTH_TOKEN):
            return 'TWILIO'
        elif provider == 'FAST2SMS' or (provider == 'AUTO' and Config.FAST2SMS_API_KEY):
            return 'FAST2SMS'
        else:
            return 'SIMULATED'

    @classmethod
    def send_sms(cls, to_phone, message, recipient_name='Technician', recipient_user_id=None, complaint_id=None):
        """
        Sends an SMS to a single recipient using the active gateway.
        Logs the transaction in the database.
        """
        if not to_phone or not to_phone.strip():
            return {
                'success': False,
                'status': 'FAILED',
                'provider': 'NONE',
                'error': 'No destination phone number provided',
                'recipient_name': recipient_name,
                'phone': to_phone
            }

        provider = cls.get_provider()
        status = 'FAILED'
        response_data = ''

        try:
            if provider == 'TWILIO':
                status, response_data = cls._send_via_twilio(to_phone, message)
            elif provider == 'FAST2SMS':
                status, response_data = cls._send_via_fast2sms(to_phone, message)
            else:
                # Built-in Telecom Simulator mode
                status = 'DELIVERED'
                txn_id = f"SM-{uuid.uuid4().hex[:12].upper()}"
                response_data = json.dumps({
                    'status': 'success',
                    'transaction_id': txn_id,
                    'carrier': 'Telecom Route (Active)',
                    'segments': max(1, (len(message) // 160) + 1),
                    'char_count': len(message),
                    'mode': 'Simulated Carrier Dispatch (Ready for Twilio / Fast2SMS credentials in config.py)'
                })

        except Exception as e:
            status = 'FAILED'
            response_data = json.dumps({'error': str(e), 'status': 'gateway_error'})

        # Save to sms_logs table in database
        try:
            sql = '''
                INSERT INTO sms_logs (
                    complaint_id, recipient_user_id, recipient_name, recipient_phone,
                    message, gateway_provider, status, response_data, sent_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
            '''
            last_id, _ = execute_db(sql, (
                complaint_id,
                recipient_user_id,
                recipient_name,
                to_phone,
                message,
                provider,
                status,
                response_data
            ))
        except Exception as db_err:
            last_id = None
            print(f"[SMS DB Error] Could not save sms_log: {db_err}")

        return {
            'success': status in ('SENT', 'DELIVERED'),
            'log_id': last_id,
            'status': status,
            'provider': provider,
            'recipient_name': recipient_name,
            'phone': to_phone,
            'response': response_data
        }

    @classmethod
    def _send_via_twilio(cls, to_phone, message):
        """Sends a real SMS via Twilio Messages REST API."""
        account_sid = Config.TWILIO_ACCOUNT_SID
        auth_token = Config.TWILIO_AUTH_TOKEN
        from_number = Config.TWILIO_PHONE_NUMBER

        if not account_sid or not auth_token or not from_number:
            return 'FAILED', json.dumps({'error': 'Missing Twilio credentials in config/env'})

        url = f"https://api.twilio.com/2010-04-01/Accounts/{account_sid}/Messages.json"
        data = urllib.parse.urlencode({
            'To': to_phone,
            'From': from_number,
            'Body': message
        }).encode('utf-8')

        credentials = f"{account_sid}:{auth_token}"
        base64_auth = base64.b64encode(credentials.encode('utf-8')).decode('ascii')

        req = urllib.request.Request(url, data=data, method='POST')
        req.add_header('Authorization', f'Basic {base64_auth}')
        req.add_header('Content-Type', 'application/x-www-form-urlencoded')

        with urllib.request.urlopen(req, timeout=12) as response:
            res_body = response.read().decode('utf-8')
            res_json = json.loads(res_body)
            sid = res_json.get('sid', '')
            return 'DELIVERED', json.dumps({'twilio_sid': sid, 'status': res_json.get('status', 'queued')})

    @classmethod
    def _send_via_fast2sms(cls, to_phone, message):
        """Sends a real SMS via Fast2SMS API (common for Indian mobile numbers)."""
        api_key = Config.FAST2SMS_API_KEY
        if not api_key:
            return 'FAILED', json.dumps({'error': 'Missing FAST2SMS_API_KEY in config/env'})

        # Clean phone number (extract 10-digit number for Indian SMS)
        clean_number = ''.join(filter(str.isdigit, to_phone))
        if len(clean_number) > 10:
            clean_number = clean_number[-10:]

        url = "https://www.fast2sms.com/dev/bulkV2"
        payload = json.dumps({
            "route": "v3",
            "sender_id": "TXTIND",
            "message": message,
            "language": "english",
            "flash": 0,
            "numbers": clean_number
        }).encode('utf-8')

        req = urllib.request.Request(url, data=payload, method='POST')
        req.add_header('authorization', api_key)
        req.add_header('Content-Type', 'application/json')

        with urllib.request.urlopen(req, timeout=12) as response:
            res_body = response.read().decode('utf-8')
            return 'DELIVERED', res_body

    @classmethod
    def dispatch_fault_alert_to_technicians(cls, complaint, faculty_user=None):
        """
        Dispatches SMS alerts to all active technicians on duty
        immediately when a faculty member reports a computer fault.
        """
        technicians = query_db(
            "SELECT id, username, full_name, role, phone, department FROM users WHERE role = 'technician'"
        )

        if not technicians:
            return {
                'success': False,
                'message': 'No technicians found in system database to notify.',
                'dispatches': []
            }

        # Build clear, high-impact SMS message
        faculty_name = faculty_user.full_name if faculty_user else getattr(complaint, 'faculty_name', 'Faculty')
        
        # Format location
        location_str = getattr(complaint, 'location_breadcrumb', None)
        if not location_str:
            location_str = f"{complaint.lab_code or 'Lab'} - {complaint.pc_number or 'PC'}"

        app_url = getattr(Config, 'APP_URL', 'http://localhost:5000').rstrip('/')
        sms_body = (
            f"[LABFIX ALERT] 🚨 MALFUNCTION REPORTED!\n"
            f"Ticket: {complaint.complaint_code} ({complaint.priority} Priority)\n"
            f"Loc: {location_str}\n"
            f"Issue: {complaint.problem_category}\n"
            f"Faculty: {faculty_name}\n"
            f"Notes: {complaint.description[:90]}...\n"
            f"Claim ticket: {app_url}/technician/dashboard"
        )

        dispatches = []
        for tech in technicians:
            phone = tech['phone']
            # If tech has no phone, provide default fallback for demonstration
            if not phone:
                phone = '+91 98765 43210'

            result = cls.send_sms(
                to_phone=phone,
                message=sms_body,
                recipient_name=tech['full_name'],
                recipient_user_id=tech['id'],
                complaint_id=complaint.id
            )
            dispatches.append(result)

        successful_count = sum(1 for d in dispatches if d['success'])
        
        return {
            'success': successful_count > 0,
            'total_dispatched': len(dispatches),
            'successful_count': successful_count,
            'provider': cls.get_provider(),
            'dispatches': dispatches,
            'message_preview': sms_body
        }
