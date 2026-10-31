# LabFix — Smart Computer Lab Management & Hardware Asset Ops

**NMIET Pune Computing Laboratories Platform**

LabFix is a comprehensive computer laboratory maintenance, hardware asset tracking, and fault complaint management system rewritten as a modern React SPA using TypeScript and Vite.

## System Overview

- **3 Academic Wings**:
  - Wing A: North Academic Block (Computing & Data Sciences)
  - Wing B: Central Technology Hub (AI & Software Engineering)
  - Wing C: South Engineering Complex (Networking & Cyber Security)
- **9 Floors** (Floors 1-3 in each wing)
- **18 Computer Laboratories** (2 labs per floor, 20 workstations each = 360 physical workstations)
- **Hardware Inventory Tracking**: Full workstation specifications (Dell OptiPlex 7090, HP EliteDesk 800 G6, Lenovo ThinkCentre M70q, Core i7/i5/Ryzen, NVMe SSD, RAM, Serial Numbers, and Operational Status).

## Core Roles & Capabilities

### 1. Head of Department (HOD)
- **Executive Control Center**: Real-time KPI summary cards, operational distribution bar/chart, problem categorization, and active critical alerts table.
- **Campus Infrastructure**: Hierarchical exploration of Wings, Floors, and Labs with live 20-workstation rack grid views.
- **Master Complaint Registry**: Filter by status, priority, wing, search keywords, and full lifecycle tracking.
- **Computer Health Matrix**: Reliability index per laboratory and instant identification of faulty units.
- **Technician Monitoring**: Workload distribution, active vs resolved jobs, and emergency SMS phone numbers.
- **Reports & Reliability Analytics**: MTTR, brand failure comparison (Dell vs HP vs Lenovo), recurring defect breakdown, and CSV report export.
- **Audit Logs & SMS Logs**: Administrative audit trail and carrier SMS dispatch records.

### 2. Faculty Portal
- **Faculty Dashboard**: My reported faults, pending acceptance, in repair, and resolved counters.
- **Report Hardware Fault**: Dynamic cascading dropdowns (Wing → Floor → Lab → Workstation) with live hardware spec previews, problem category classification, priority levels, detailed symptoms, optional attachment upload, and instant simulated carrier SMS broadcast.
- **My Complaints**: Self-service ticket tracking with step-by-step progress timeline.

### 3. Technician Workspace
- **Complaint Queue**: Active work orders categorized into All, Pending Claim, Assigned to Me, In Progress, and Resolved Today.
- **1-Click Repair Workflow**: Claim pending tickets, mark diagnostic repair In Progress, and submit detailed maintenance logs (Diagnosis, Action Taken, Parts Replaced, Solution Description, Notes, and post-repair workstation status).
- **SMS Alert Center**: Real-time simulated mobile SMS inbox receiving automated alerts when faculty submit faults, plus on-duty phone number configuration.
- **Repair History Archive**: Comprehensive historical overhauls and signed-off jobs.

### 4. Hardware Asset Operations
- **Computer Inventory Directory**: Filterable directory with search, status, wing, and sorting.
- **Workstation Details**: Comprehensive specs, maintenance logs, and incident records.
- **Hardware Replacement Workflow**: Hot-swap a workstation slot while decommissioning the legacy unit and archiving its historical records.
- **Add Workstation**: Deploy and register new computers.

## Tech Stack
- **Framework**: React 18 + TypeScript + Vite
- **Styling**: Authentic LabFix Design System (Dark Navy, Electric Blue, Cyan, Slate) with Dark / Light Theme support
- **Icons**: Font Awesome 6
- **Persistence**: Browser LocalStorage with automatic baseline college seeding and 1-click demo persona switching
