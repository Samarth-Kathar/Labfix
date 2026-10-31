# LabFix — Smart Computer Lab Management System

**LabFix** is a complete, enterprise-grade, modern web application designed for collegiate computer laboratory management. It bridges faculty fault reporting, technician repair lifecycles, computer inventory management, and Head of Department (HOD) operational oversight through a unified, high-performance Python and SQLite architecture.

---

## 🚀 Key Highlights & Architectural Features

- **Split-Screen Authentication**: Modern login with role-selector tabs, remember-me support, password visibility toggle, and instant one-click demo credentials filling.
- **Fixed Institutional Hierarchy**: Pre-seeded college structure featuring **3 Academic Wings**, **9 Floors**, **18 Computer Laboratories**, and **360 Managed Workstations** (`PC-01` through `PC-20` in each lab).
- **Dynamic 4-Tier Cascading Selector**: Real-time chained dropdowns (`Wing → Floor → Laboratory → Computer`) with live client-side hardware specification preview.
- **Complete Repair Lifecycle**: Multi-state complaint handling: `Pending → Accepted → In Progress → Resolved`, with a visual stepper timeline and technician resolution logs.
- **Technician Concurrency Protection**: Atomic database checks preventing two technicians from inadvertently claiming the same complaint simultaneously.
- **Smart Asset Replacement**: Workstation replacement preserves the physical laboratory slot while archiving the retired machine and maintaining complete historical maintenance records.
- **Interactive Analytics**: Real-time Chart.js visualisations for workstation availability, complaints by wing, problem categories, and monthly downtime trends.
- **Real-World SMS Malfunction Alert System**: Automated SMS alert dispatch to on-duty lab technicians whenever faculty report a fault. Includes real Twilio and Fast2SMS gateway integrations, mobile phone number configuration, test alert triggers, and an interactive smartphone SMS terminal.
- **Theme Personalisation**: Professional dark navy & electric blue palette with instant light/dark mode toggling persisted in `localStorage`.
- **In-App Notification Center**: Role-targeted notifications with unread badge indicators and background polling.

---

## 🛠️ Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | HTML5, CSS3 (Custom Design System, Glassmorphism, CSS Grid), Vanilla JavaScript |
| **Icons & Charts** | Font Awesome 6.5.1, Chart.js 4.4.1 |
| **Backend** | Python 3.10+ with Flask (Blueprints, Application Factory, Context Processors) |
| **Database** | SQLite3 with parameterized queries and foreign-key constraints |
| **Security** | Werkzeug password hashing (`pbkdf2:sha256`), role-based access decorators, session protection |
| **Architecture** | Object-Oriented Programming (OOP) with distinct domain model classes |

---

## 🏢 Predefined College Structure

| Academic Wing | Floors | Laboratories | Computers |
| :--- | :--- | :--- | :--- |
| **Wing A** (North Block - Computing & Data Sciences) | Floor 1, Floor 2, Floor 3 | Labs A1-01, A1-02, A2-01, A2-02, A3-01, A3-02 | PC-01 to PC-20 (120 PCs) |
| **Wing B** (Central Block - AI & Software Engineering) | Floor 1, Floor 2, Floor 3 | Labs B1-01, B1-02, B2-01, B2-02, B3-01, B3-02 | PC-01 to PC-20 (120 PCs) |
| **Wing C** (South Block - Networking & Cyber Security) | Floor 1, Floor 2, Floor 3 | Labs C1-01, C1-02, C2-01, C2-02, C3-01, C3-02 | PC-01 to PC-20 (120 PCs) |
| **Total Campus Inventory** | **3 Wings** | **9 Floors** | **18 Labs • 360 Workstations** |

---

## 🔑 Pre-Seeded Demonstration Accounts

All demonstration accounts use the password: `Password@123`

| Role | Username | Full Name | Department / Title | Default Dashboard |
| :--- | :--- | :--- | :--- | :--- |
| **HOD** | `hod` | Dr. Sarah Jenkins | Head of Department, CSE | `/hod/dashboard` |
| **Faculty** | `faculty` | Prof. Alan Turing | Senior Faculty, CSE | `/faculty/dashboard` |
| **Faculty** | `faculty2` | Dr. Grace Hopper | Associate Professor, IT | `/faculty/dashboard` |
| **Technician** | `tech` | Alex Rivera | Lead Systems Technician | `/technician/dashboard` |
| **Technician** | `tech2` | Marcus Vance | Hardware & Networking Specialist | `/technician/dashboard` |

*(Tip: On the login page, you can click any of the **One-Click Demo Credentials** buttons at the bottom to prefill these accounts immediately).*

---

## 📁 Project Directory Structure

```text
LabFix-Project/
├── app.py                     # Main application factory, blueprints, context processors, error handlers
├── config.py                  # App configuration (secret key, database path, upload limits)
├── database.py                # Database connection, init_db, schema creation, seeding helper
├── models.py                  # OOP domain models: User, Computer, Complaint, MaintenanceRecord, Notification, AuditLog
├── requirements.txt           # Python dependencies
├── run.bat                    # One-click Windows runner
├── test_app.py                # Comprehensive automated unit & integration test suite
├── README.md                  # Detailed documentation & demonstration manual
├── routes/
│   ├── __init__.py
│   ├── auth.py                # Login, logout, session management, role verification
│   ├── hod.py                 # HOD dashboard, infrastructure tree, complaints monitor, analytics
│   ├── faculty.py             # Fault reporting, cascading form, ticket tracking
│   ├── technician.py          # Repair queue, accept, start repair, resolve form
│   ├── inventory.py           # Inventory table, add PC, replace hardware, decommission PC
│   └── api.py                 # REST API for cascading dropdowns & notification polling
├── services/
│   ├── __init__.py
│   └── auth_service.py        # Access control decorators (@login_required, @role_required)
├── static/
│   ├── css/
│   │   ├── style.css          # Design system, theme tokens, buttons, badges, tables, modals
│   │   ├── dashboard.css      # Layout grids, sidebar, topbar, metric cards, timeline stepper
│   │   └── auth.css           # Split-screen login styling & glassmorphism
│   └── js/
│       ├── main.js            # Theme toggle, animated counters, toasts, modal helpers
│       ├── dynamic_location.js# 4-stage cascading selector (Wing -> Floor -> Lab -> PC)
│       └── notifications.js   # Notification polling and read-state management
├── templates/
│   ├── base.html              # Base layout with sidebar, navbar, and toast container
│   ├── auth/
│   │   └── login.html         # Split-screen login page
│   ├── hod/
│   │   ├── dashboard.html     # Control center overview, availability chart, alerts
│   │   ├── infrastructure.html# Wing/Floor/Lab hierarchy and PC grid modal
│   │   ├── complaints.html    # All complaints table with multi-parameter filtering
│   │   ├── computer_health.html# Health status breakdown and maintenance logs
│   │   ├── technician_monitoring.html # Technician activity and completion comparison
│   │   ├── reports.html       # SLA analytics, Chart.js trends, turnaround KPIs
│   │   └── audit_logs.html    # Immutable audit trail
│   ├── faculty/
│   │   ├── dashboard.html     # Faculty portal, quick stats, ticket shortcut
│   │   ├── report_fault.html  # Modern fault report form with cascading location selector
│   │   ├── report_success.html# Confirmation screen with reference code & breadcrumb
│   │   ├── my_complaints.html # Faculty ticket history
│   │   └── complaint_detail.html # Live progress stepper: Reported -> Accepted -> In Progress -> Resolved
│   ├── technician/
│   │   ├── dashboard.html     # Central complaint-handling queue with prominent locations
│   │   ├── complaint_detail.html # Repair action workspace & resolution form
│   │   └── history.html       # Completed repairs log
│   ├── inventory/
│   │   ├── index.html         # Complete 360-PC directory with filters and sorting
│   │   ├── add.html           # Add new workstation form
│   │   ├── replace.html       # Replace hardware form (preserves lab slot & history)
│   │   └── detail.html        # Workstation specs, decommission modal, repair history
│   └── errors/
│       ├── 403.html           # Access denied
│       ├── 404.html           # Not found
│       └── 500.html           # Internal server error
└── uploads/                   # Secure storage for faculty fault screenshots
```

---

## ⚡ Quick Start & Run Instructions (Windows)

### Option 1: Double-Click Launcher
Double-click `run.bat` in the project directory.

### Option 2: Terminal / PowerShell
1. Open PowerShell or Command Prompt in the project folder:
   ```powershell
   cd c:\Users\Dell-Dxb\OneDrive\Desktop\LabFix-Project
   ```
2. Install dependencies (Flask is already installed):
   ```powershell
   py -m pip install -r requirements.txt
   ```
3. Start the application:
   ```powershell
   py app.py
   ```
4. Open your browser and navigate to:
   ```text
   http://127.0.0.1:5000
   ```

---

## 🧪 Running the Automated Test Suite

LabFix includes a comprehensive automated test suite that validates authentication, access control decorators, cascading APIs, the full complaint lifecycle, hardware replacement, and all dashboard views:

```powershell
py test_app.py
```
*Result: 6 tests pass cleanly with `OK`.*

---

## 📋 Role-Based Testing & Demonstration Walkthrough

Follow these steps to demonstrate every role and workflow:

### 1. Test Faculty Fault Reporting
1. Navigate to `http://127.0.0.1:5000/login`.
2. Click **Faculty** under demo credentials (or login with `faculty` / `Password@123`).
3. On the Faculty Dashboard, click **Report Computer Fault**.
4. Test the **Cascading Location Selector**:
   - Select **Wing B** → notice Floor dropdown unlocks with Floor 1, 2, 3.
   - Select **Floor 2** → notice Laboratory dropdown unlocks with `Lab B2-01` and `Lab B2-02`.
   - Select **Lab B2-01** → notice Workstation dropdown populates with active PCs.
   - Select **PC-15** → observe the dynamic **Workstation Preview Box** appear below showing brand, model, and serial number.
5. Choose Category (e.g. `Monitor Problem`), Priority (`High`), and enter a Description.
6. Click **Submit Fault Report** → view the confirmation screen with the generated ticket reference (e.g. `LF-0006`) and complete breadcrumb.
7. Click **Track Ticket Progress** to see the 4-stage stepper timeline (`Reported` active).

### 2. Test Technician Repair Queue & Resolution
1. Log out, then click **Technician** under demo credentials (or login with `tech` / `Password@123`).
2. Notice the new complaint card appears in the queue with its location highlighted:
   `LOCATION: Wing B → Floor 2 → Lab B2-01 → PC-15`.
3. Click **Accept Complaint** → status transitions to `Accepted`.
4. (Optional Concurrency Test: Open an Incognito window, login as `tech2`, and try to accept the same ticket → observe the conflict warning message).
5. As `tech`, click **Start Repair** → status transitions to `In Progress` and workstation operational status updates to `Under Repair`.
6. Click **Enter Resolution & Mark Resolved** (or navigate into the ticket workspace).
7. Enter:
   - Diagnosis: `Defective DisplayPort controller on GPU`
   - Action Taken: `Reseated discrete GPU and replaced video cable`
   - Parts Replaced: `DP 1.4 Cable`
   - Solution Description: `Full 30-minute benchmark executed with zero artifacts.`
   - Status After Repair: `Working`
8. Check the confirmation checkbox and click **Certify & Mark Complaint Resolved**.
9. The ticket is now `Resolved`, recorded in maintenance logs, and visible in **My Completed Repairs**.

### 3. Test HOD Institutional Control Center
1. Log out, then login as **HOD** (`hod` / `Password@123`).
2. **Overview**: View live statistic cards, recent complaints, and the interactive **Workstation Availability** doughnut chart.
3. **Infrastructure**: Click **Infrastructure** from the sidebar:
   - Browse Wing A, Wing B, and Wing C.
   - Expand any lab (e.g. `Lab B2-01`) to open the **20 Workstations Grid Modal** displaying live statuses of all PCs.
4. **All Complaints**: Filter tickets by Wing, Priority, or Status. Click **Details** on any ticket to view its full modal.
5. **Computer Health**: View recurring hardware failure categories and certified maintenance logs.
6. **Technician Monitoring**: Review workload distribution, open jobs, and completion rates comparing technicians.
7. **Reports & Analytics**: Explore interactive Chart.js charts: complaints by wing, problem category breakdown, and monthly downtime trends.
8. **Audit Logs**: Inspect the complete audit trail showing logins, ticket creation, technician claims, and inventory changes.

### 4. Test Computer Inventory & Hardware Replacement
1. While logged in as HOD or Technician, click **Computer Inventory** in the sidebar.
2. Filter or search workstations across all 18 labs.
3. Click **Replace** on any computer (e.g. `COMP-A1-01-PC-01`):
   - Enter a new Computer ID (e.g. `COMP-A1-01-PC-01-GEN2`), new Serial Number, and reason for replacement.
   - Click **Execute Hardware Replacement**.
   - Notice the system archives the old computer, links the replacement record, and activates the new computer in the same lab slot without losing historical data!

---

## 🛡️ Security & OOP Implementation Notes

- **Object-Oriented Design**: The codebase defines explicit domain classes (`User`, `Computer`, `Complaint`, `MaintenanceRecord`, `Notification`, `AuditLog`) in `models.py` with encapsulation, database abstractions, and class methods.
- **Access Control**: Routes are strictly guarded using `@login_required` and `@role_required` decorators in `services/auth_service.py`. Direct URL manipulation by unauthorized roles is caught and redirected with alert messages.
- **Database Integrity**: SQLite foreign key enforcement is turned on explicitly (`PRAGMA foreign_keys = ON`), transactions are wrapped with commits/rollbacks, and all user input is sanitized via parameterized SQL queries.

---

## 🌐 Production & Cloud Deployment Guide

LabFix is pre-configured for one-click deployment on modern cloud platforms (Render, Railway, Heroku, Docker, and Linux VPS).

### Deploying to Render
1. Connect your GitHub repository `Labfix` to **Render** as a **Web Service**.
2. Settings:
   - **Environment**: `Python`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `gunicorn app:app`
3. Environment Variables (optional):
   - `SECRET_KEY`: `<auto-generated or custom strong random key>`
   - `PORT`: (Render sets this automatically)
   - `SMS_ENABLED`: `True`
   - `TWILIO_ACCOUNT_SID` / `TWILIO_AUTH_TOKEN` / `TWILIO_PHONE_NUMBER` (if using Twilio)
   - `FAST2SMS_API_KEY` (if using Fast2SMS)

### Deploying to Heroku / Railway
- The included `Procfile` (`web: gunicorn app:app`) and `runtime.txt` (`python-3.11.9`) are automatically recognized.
- Database initialization and baseline structure seeding occur automatically on application startup.

---

© 2026 LabFix — Smart Computer Lab Management System. Built for academic project demonstration and institutional deployment.
