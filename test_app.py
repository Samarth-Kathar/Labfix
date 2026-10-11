import unittest
import json
import os
from config import Config

# Point to temporary test database
TEST_DB = os.path.join(os.path.dirname(__file__), 'test_labfix.db')
Config.DATABASE = TEST_DB

from app import create_app
from database import init_db
from models import User, Computer, Complaint

class LabFixTestCase(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        if os.path.exists(TEST_DB):
            os.remove(TEST_DB)
        cls.app = create_app()
        cls.app.config['TESTING'] = True
        cls.app.config['WTF_CSRF_ENABLED'] = False
        with cls.app.app_context():
            init_db()

    @classmethod
    def tearDownClass(cls):
        if os.path.exists(TEST_DB):
            try:
                os.remove(TEST_DB)
            except Exception:
                pass

    def setUp(self):
        self.client = self.app.test_client()

    def login(self, username, password, role=''):
        return self.client.post('/login', data={
            'username': username,
            'password': password,
            'role': role
        }, follow_redirects=True)

    def logout(self):
        return self.client.get('/logout', follow_redirects=True)

    def test_01_login_roles(self):
        """Test login for HOD, Faculty, and Technician."""
        # HOD Login
        res = self.login('hod', 'Password@123', 'hod')
        self.assertEqual(res.status_code, 200)
        self.assertIn(b'Control Center', res.data)
        self.logout()

        # Faculty Login
        res = self.login('faculty', 'Password@123', 'faculty')
        self.assertEqual(res.status_code, 200)
        self.assertIn(b'Faculty Workspace', res.data)
        self.logout()

        # Technician Login
        res = self.login('tech', 'Password@123', 'technician')
        self.assertEqual(res.status_code, 200)
        self.assertIn(b'Technician Central Workspace', res.data)
        self.logout()

    def test_02_access_control(self):
        """Test that faculty cannot access HOD dashboard and technician dashboard."""
        self.login('faculty', 'Password@123', 'faculty')
        
        # Access HOD dashboard
        res = self.client.get('/hod/dashboard', follow_redirects=True)
        self.assertIn(b'Access denied', res.data)

        # Access Technician dashboard
        res = self.client.get('/technician/dashboard', follow_redirects=True)
        self.assertIn(b'Access denied', res.data)
        self.logout()

    def test_03_api_cascading_locations(self):
        """Test API endpoints for Wings -> Floors -> Labs -> Computers."""
        # 1. Wings
        res = self.client.get('/api/wings')
        self.assertEqual(res.status_code, 200)
        wings = json.loads(res.data)
        self.assertEqual(len(wings), 3)

        # 2. Floors for Wing A
        wing_a_id = wings[0]['id']
        res = self.client.get(f'/api/floors?wing_id={wing_a_id}')
        self.assertEqual(res.status_code, 200)
        floors = json.loads(res.data)
        self.assertEqual(len(floors), 3)

        # 3. Laboratories for Floor 1
        floor_1_id = floors[0]['id']
        res = self.client.get(f'/api/laboratories?floor_id={floor_1_id}')
        self.assertEqual(res.status_code, 200)
        labs = json.loads(res.data)
        self.assertEqual(len(labs), 2)

        # 4. Computers for Lab A1-01
        lab_1_id = labs[0]['id']
        res = self.client.get(f'/api/computers?lab_id={lab_1_id}')
        self.assertEqual(res.status_code, 200)
        computers = json.loads(res.data)
        self.assertEqual(len(computers), 20)

    def test_04_full_complaint_repair_lifecycle(self):
        """Test complete workflow: Faculty reports fault -> Tech accepts -> Tech starts -> Tech resolves."""
        # 1. Faculty reports fault
        self.login('faculty', 'Password@123', 'faculty')
        comp = Computer.find_by_code('COMP-A1-01-PC-02')
        self.assertIsNotNone(comp)

        res = self.client.post('/faculty/report-fault', data={
            'computer_id': comp.id,
            'problem_category': 'Monitor Problem',
            'priority': 'High',
            'description': 'Continuous black flickering during computer vision practical.'
        }, follow_redirects=True)
        self.assertEqual(res.status_code, 200)
        self.assertIn(b'Fault Ticket Registered', res.data)
        self.logout()

        # Verify computer status updated to Fault Reported
        comp_updated = Computer.find_by_id(comp.id)
        self.assertEqual(comp_updated.operational_status, 'Fault Reported')

        # Find the newly created complaint
        recent_complaint = Complaint.get_all(search='COMP-A1-01-PC-02')[0]
        complaint_id = recent_complaint.id

        # 2. Tech 1 logs in and accepts complaint
        self.login('tech', 'Password@123', 'technician')
        res = self.client.post(f'/technician/complaint/{complaint_id}/accept', follow_redirects=True)
        self.assertEqual(res.status_code, 200)
        self.assertIn(b'Success: You have claimed complaint', res.data)
        self.logout()

        # Concurrency test: Tech 2 tries to claim the same complaint
        self.login('tech2', 'Password@123', 'technician')
        res = self.client.post(f'/technician/complaint/{complaint_id}/accept', follow_redirects=True)
        self.assertIn(b'Unable to accept complaint', res.data)
        self.logout()

        # 3. Tech 1 starts repair
        self.login('tech', 'Password@123', 'technician')
        res = self.client.post(f'/technician/complaint/{complaint_id}/start', follow_redirects=True)
        self.assertEqual(res.status_code, 200)
        self.assertIn(b'marked In Progress', res.data)

        # Verify computer status is now Under Repair
        comp_updated = Computer.find_by_id(comp.id)
        self.assertEqual(comp_updated.operational_status, 'Under Repair')

        # 4. Tech 1 resolves complaint
        res = self.client.post(f'/technician/complaint/{complaint_id}/resolve', data={
            'diagnosis': 'Faulty HDMI to DisplayPort adapter cable',
            'action_taken': 'Replaced cable and tested with 4K output for 20 minutes',
            'parts_replaced': 'Dell DP-to-HDMI Cable 1.8m',
            'solution_description': 'Signal cable swapped. Tested display output at 1080p 60Hz. Zero flicker observed.',
            'repair_notes': 'Workstation returned to active student use.',
            'operational_status': 'Repaired'
        }, follow_redirects=True)
        self.assertEqual(res.status_code, 200)
        self.assertIn(b'successfully resolved and recorded in maintenance log', res.data)
        self.logout()

        # Verify computer status updated
        comp_updated = Computer.find_by_id(comp.id)
        self.assertEqual(comp_updated.operational_status, 'Repaired')

    def test_05_inventory_management(self):
        """Test Inventory: Add computer, Replace computer, Decommission computer."""
        self.login('hod', 'Password@123', 'hod')

        # 1. Add Computer
        res = self.client.post('/inventory/add', data={
            'lab_id': 1,
            'pc_number': 'PC-21',
            'computer_id_code': 'COMP-A1-01-PC-21',
            'brand': 'Dell',
            'model': 'OptiPlex 7090 Tower',
            'serial_number': 'SN-TEST-NEW-021',
            'processor': 'Intel Core i7-11700 2.50GHz',
            'ram': '16 GB DDR4',
            'storage': '512 GB SSD',
            'os': 'Windows 11 Pro 64-bit',
            'installation_date': '2026-10-11'
        }, follow_redirects=True)
        self.assertEqual(res.status_code, 200)
        self.assertIn(b'successfully added to inventory', res.data)

        new_pc = Computer.find_by_code('COMP-A1-01-PC-21')
        self.assertIsNotNone(new_pc)

        # 2. Replace Computer
        res = self.client.post(f'/inventory/computer/{new_pc.id}/replace', data={
            'new_computer_id_code': 'COMP-A1-01-PC-21-V2',
            'new_serial': 'SN-TEST-NEW-021-V2',
            'new_brand': 'HP',
            'new_model': 'EliteDesk 800 G6',
            'new_processor': 'Intel Core i9-11900',
            'new_ram': '32 GB DDR4',
            'new_storage': '1 TB NVMe',
            'new_os': 'Windows 11 Pro',
            'replacement_date': '2026-10-11',
            'reason': 'Scheduled lab high-performance tier upgrade',
            'notes': 'Commissioned in replacement slot.'
        }, follow_redirects=True)
        self.assertEqual(res.status_code, 200)
        self.assertIn(b'Replacement completed', res.data)

        # Verify old PC is archived/decommissioned and new one is working
        old_pc = Computer.find_by_id(new_pc.id)
        self.assertEqual(old_pc.operational_status, 'Decommissioned')
        self.assertEqual(old_pc.is_active, 0)

        replaced_pc = Computer.find_by_code('COMP-A1-01-PC-21-V2')
        self.assertIsNotNone(replaced_pc)
        self.assertEqual(replaced_pc.operational_status, 'Working')
        self.assertEqual(replaced_pc.pc_number, 'PC-21')

        # 3. Decommission Computer
        res = self.client.post(f'/inventory/computer/{replaced_pc.id}/decommission', data={
            'reason': 'Damaged beyond repair'
        }, follow_redirects=True)
        self.assertEqual(res.status_code, 200)
        self.assertIn(b'has been decommissioned', res.data)

        decom_pc = Computer.find_by_id(replaced_pc.id)
        self.assertEqual(decom_pc.operational_status, 'Decommissioned')
        self.logout()

    def test_06_hod_dashboard_views(self):
        """Test all HOD dashboard pages render without errors."""
        self.login('hod', 'Password@123', 'hod')

        pages = [
            '/hod/dashboard',
            '/hod/infrastructure',
            '/hod/complaints',
            '/hod/computer-health',
            '/hod/technicians',
            '/hod/reports',
            '/hod/audit-logs',
            '/inventory/'
        ]
        for page in pages:
            res = self.client.get(page)
            self.assertEqual(res.status_code, 200, f"Page {page} failed to render: {res.status_code}")

        self.logout()

if __name__ == '__main__':
    unittest.main()
