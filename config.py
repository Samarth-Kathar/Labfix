import os

BASE_DIR = os.path.abspath(os.path.dirname(__file__))

class Config:
    SECRET_KEY = os.environ.get('SECRET_KEY', 'labfix-super-secret-key-prod-2026')
    DATABASE = os.path.join(BASE_DIR, 'labfix.db')
    UPLOAD_FOLDER = os.path.join(BASE_DIR, 'uploads')
    MAX_CONTENT_LENGTH = 16 * 1024 * 1024  # 16 MB max image upload
    ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif', 'webp'}

    # Real-World SMS Alert Gateway Configuration
    # Supported: TWILIO, FAST2SMS, or SIMULATED (auto-detected if credentials provided)
    SMS_ENABLED = os.environ.get('SMS_ENABLED', 'True').lower() in ('true', '1')
    SMS_PROVIDER = os.environ.get('SMS_PROVIDER', 'AUTO')  # 'TWILIO', 'FAST2SMS', 'SIMULATED', 'AUTO'
    
    # Twilio API credentials (optional for global real SMS)
    TWILIO_ACCOUNT_SID = os.environ.get('TWILIO_ACCOUNT_SID', '')
    TWILIO_AUTH_TOKEN = os.environ.get('TWILIO_AUTH_TOKEN', '')
    TWILIO_PHONE_NUMBER = os.environ.get('TWILIO_PHONE_NUMBER', '')

    # Fast2SMS API Key (optional for Indian mobile numbers)
    FAST2SMS_API_KEY = os.environ.get('FAST2SMS_API_KEY', '')
