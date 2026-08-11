# Implementation Plan - Replicate Admin Dashboard UI & Student Registration Page

This plan outlines the design and step-by-step implementation for building out the complete **MyEdou Admin Dashboard UI** (recreating all reference screens from `New Folder/`) and a modern **New Student Registration Page** for the application.

## User Review Required

> [!IMPORTANT]
> **Key Architectural Highlights & Requirements Covered:**
> 1. **Complete Reference Fidelity**: All navigation sections, modal dialogs, status badges, metric cards, analytical charts, master data tables, and configuration pages from `/New Folder` will be recreated with responsive, high-end pixel-perfect UI.
> 2. **Interactive Mock State**: Filter bars, search inputs, modal triggers, tab switchers, expand/collapse accordions, branch switcher, notification drawer, and sidebar toggling (expanded & icon-only modes) will be fully functional on client-side state.
> 3. **New Student Onboarding**: A dedicated 5-step registration wizard (`/student-registration`) will be created for new student intake, linked from `/login-selector`.

## Proposed Changes

### Navigation & Layout Framework

#### [NEW] [layout.tsx](file:///c:/Users/ASUS/OneDrive/Desktop/edu/app/admin-dashboard/layout.tsx)
- Root layout shell for the Admin Dashboard providing the top header, collapsible left sidebar, branch context, real-time clock ticker, and dynamic page routing.

#### [NEW] [AdminHeader.tsx](file:///c:/Users/ASUS/OneDrive/Desktop/edu/components/admin/AdminHeader.tsx)
- Top navigation bar containing:
  - Workspace title dropdown ("LMS Workspace - MyEdou")
  - Live clock & date indicator (`05:58:29 pm Sun, 19 Jul`)
  - Branch Switcher dropdown (`Main Branch`, `Mumbai Branch`)
  - Notifications Bell icon with badge count (`9+`) & dropdown list
  - Admin Profile menu (`Charudatta Warke - Admin`) with quick links to Profile, Settings, and Logout.

#### [NEW] [AdminSidebar.tsx](file:///c:/Users/ASUS/OneDrive/Desktop/edu/components/admin/AdminSidebar.tsx)
- Multi-tier sidebar supporting expanded labels and icon-only collapsed state for:
  - **Overview**: Dashboard
  - **LMS Operations**: Student Corner, Courses, Schedule, Leads, Forms, Task Manager
  - **Finance Operations**: Accounts (Expenses: Expense Tracker, Approval Queue, Vendors, Expense Categories; Finance: Overview, Payments, Invoices, Refunds, Waivers, Audit Trail)
  - **Communications**: ConnectSuite (Dashboard, Groups, Meetings, Calendar)
  - **Reports & Analytics**: Reports Hub, Legacy Reports
  - **Administration**: Staff Corner (All Staff, Attendance, Salary, Leaves), Master Data Center
  - **Settings**: Security Settings, Profile, Config (Invoice, Tax, Staff Permission, Branch)

---

### Core Admin Dashboard Pages

#### [NEW] [page.tsx](file:///c:/Users/ASUS/OneDrive/Desktop/edu/app/admin-dashboard/page.tsx)
- Main Overview Dashboard with real-time KPI metric summary cards, recent activity timeline, lead conversion rates, revenue overview widgets, and quick action shortcuts.

#### [NEW] [page.tsx](file:///c:/Users/ASUS/OneDrive/Desktop/edu/app/admin-dashboard/finance/audit-trail/page.tsx)
- **Audit Trail Page** matching `Screenshot 2026-07-19 175833.png`:
  - Immutable status badges, total entry counters (33), search filter bar, actor badges, invoice reference popovers, and detailed log table.

---

### ConnectSuite Communication Center

#### [NEW] [page.tsx](file:///c:/Users/ASUS/OneDrive/Desktop/edu/app/admin-dashboard/connect/page.tsx)
- **Connect Center Hub** matching `175900.png`:
  - Upcoming Meetings grid, Recent Conversations, Active Groups (`JEE BATCH`), and Quick Action tile cards.

#### [NEW] [page.tsx](file:///c:/Users/ASUS/OneDrive/Desktop/edu/app/admin-dashboard/connect/groups/page.tsx)
- **Groups Chat Interface** matching `175942.png`:
  - Group search, active group roster, and interactive chat container.

#### [NEW] [page.tsx](file:///c:/Users/ASUS/OneDrive/Desktop/edu/app/admin-dashboard/connect/meetings/schedule/page.tsx)
- **Schedule Meeting Form** matching `175914.png`:
  - Meeting details form, date/time pickers, participant search & external invitee list, security toggle checkboxes (Disable Screenshot, Disable Screen Recording, Disable Screen Share, Show Watermark).

#### [NEW] [page.tsx](file:///c:/Users/ASUS/OneDrive/Desktop/edu/app/admin-dashboard/connect/calendar/page.tsx)
- **Calendar Center** matching `180018.png`:
  - Full month calendar grid, view switchers (Month, Week, Day, Agenda), event category filter tags, and event creation modal.

---

### Reports & Analytics Module

#### [NEW] [page.tsx](file:///c:/Users/ASUS/OneDrive/Desktop/edu/app/admin-dashboard/reports/page.tsx)
- **Reports Hub** matching `180334.png`:
  - Categorized report cards (Revenue & Profitability, Receivables, Expenses & Payroll, Students & Courses, Operations).

#### [NEW] [page.tsx](file:///c:/Users/ASUS/OneDrive/Desktop/edu/app/admin-dashboard/reports/legacy/page.tsx)
- **Detailed Analytics & Reports** matching `180357.png` to `180524.png`:
  - **Admissions Tab**: Enrollment table, Top Performers score bar chart, Login Activity line chart.
  - **Inquiries Tab**: Lead count KPIs, Leads by status table, Leads by source donut chart, Lead intake trend line chart.
  - **Faculty Tab**: Staff directory table and workload distribution.
  - **Batches Tab**: Course completion table and status donut chart.
  - **Attendance Tab**: Student attendance progress bars and daily trend charts.
  - **System Tab**: Log total counters, Logins & API usage per day charts, Error distribution donut chart, and Top API Routes performance table.

---

### Master Data Center (Administration -> Master)

#### [NEW] [page.tsx](file:///c:/Users/ASUS/OneDrive/Desktop/edu/app/admin-dashboard/master/page.tsx)
- Comprehensive **Master Data Center Hub** with tabbed navigation and fully functional modal dialogs matching reference screenshots `180555.png` - `180927.png`:
  - **Class Management**: Table + **Add Class** modal dialog (`180613.png`).
  - **Department Management**: Table + **Add Department** modal dialog (`180709.png`).
  - **Designation Management**: Table + **Add Designation** modal dialog (`180658.png`).
  - **Lead For Management**: Table + **Add Lead For** modal dialog (`180726.png`).
  - **Lead Source Management**: Table + **Add Lead Source** modal dialog (`180742.png`).
  - **Course Duration Management**: Table + **Add Duration** modal dialog (`180831.png`).
  - **Semester & Year Management**: Table + **Add Semester & Year** modal dialog (`180852.png`).
  - **College Master**: Table + **Add College** multi-field modal dialog (`180922.png` & `180927.png`).

---

### Settings, Profile & Configuration

#### [NEW] [page.tsx](file:///c:/Users/ASUS/OneDrive/Desktop/edu/app/admin-dashboard/settings/page.tsx)
- **Settings Page** matching `180950.png`:
  - Security tab (Password change, Password requirements tracker, 2FA management, backup codes), Login History, Device Sessions.

#### [NEW] [page.tsx](file:///c:/Users/ASUS/OneDrive/Desktop/edu/app/admin-dashboard/profile/page.tsx)
- **Admin Profile Page** matching `181005.png` & `181016.png`:
  - Profile completion progress bar (56%), Personal Information, Reach & Location, Organization, Subscription Plan & Validity, and Security & Audit log summary.

#### [NEW] [page.tsx](file:///c:/Users/ASUS/OneDrive/Desktop/edu/app/admin-dashboard/settings/config/invoice/page.tsx)
- **Invoice Configuration Page** matching `181046.png`:
  - Company branding, GST/PAN details, Logo & Signature image upload previews, and Immutable Snapshot version history table.

#### [NEW] [page.tsx](file:///c:/Users/ASUS/OneDrive/Desktop/edu/app/admin-dashboard/settings/config/tax/page.tsx)
- **Tax Configuration Page** matching `181114.png` & `181127.png`:
  - Active tax rule cards, tax ledger table, and **New Tax Configuration** modal (Rate %, HSN/SAC codes, effective dates).

#### [NEW] [page.tsx](file:///c:/Users/ASUS/OneDrive/Desktop/edu/app/admin-dashboard/settings/config/staff-permission/page.tsx)
- **Role & Permission Center** matching `181140.png`:
  - Staff selector list (Nilam Thorat, Omkar Katturwar, etc.) and expandable module permission accordions with Grant All / Revoke quick toggles.

#### [NEW] [page.tsx](file:///c:/Users/ASUS/OneDrive/Desktop/edu/app/admin-dashboard/settings/config/branch/page.tsx)
- **Branch Configuration Page** matching `181155.png` - `181217.png`:
  - Branch cards (Main Branch, Mumbai Branch) + **Add New Branch** multi-section modal (Basic info, Address & Contact, Operations capacity, timezone/currency, Module Access checkboxes, Page Access rules).

---

### New Student Registration Page & Authentication Routing

#### [NEW] [page.tsx](file:///c:/Users/ASUS/OneDrive/Desktop/edu/app/student-registration/page.tsx)
- **New Student Onboarding Wizard**:
  - Step 1: Personal Details (Name, DOB, Gender, Phone, Email)
  - Step 2: Academic Selection (Course e.g. JEE/NEET/MERN, Preferred Batch, Semester)
  - Step 3: Guardian & Contact Details (Parent name, Relationship, Emergency contact, Full address)
  - Step 4: Documents Upload & Verification (Photo, ID Proof, Marksheets)
  - Step 5: Onboarding Complete & Credential Card (Displays auto-generated Student ID, Temporary Password, and Direct Login button).

#### [MODIFY] [page.tsx](file:///c:/Users/ASUS/OneDrive/Desktop/edu/app/login-selector/page.tsx)
- Link "Admin / Staff Panel" to `/admin-dashboard` and "New Student?" to `/student-registration`.

---

## Verification Plan

### Automated Verification
- Run `npm run build` or `npx next build` to ensure there are no TypeScript or JSX compilation errors across all new pages and components.

### Manual Verification
- Test sidebar expansion/collapse and navigate through all admin pages.
- Verify topbar branch dropdown switcher, notifications popover, and profile menu.
- Open each Master Data Center modal (Class, Department, Designation, Lead For, Lead Source, Duration, Semester/Year, College) and verify input handling.
- Open Branch, Tax, and Meeting schedule modals.
- Complete the 5-step New Student Registration flow and confirm redirection and temporary credential issuance.
