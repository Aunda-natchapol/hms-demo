# 🏨 Hotel Management System (HMS) - Frontend

> **High-fidelity frontend mockup for comprehensive hotel operations management**

## 🎯 Project Overview

A complete **Hotel Management System** frontend built with modern web technologies, designed to handle all aspects of hotel operations from guest reservations to housekeeping management.

### 🚀 Key Features

- **📋 Reservation Management** - Complete booking lifecycle with guest management
- **🏠 Front Desk Operations** - Check-in/Check-out with license plate recognition
- **🛏️ Room Operations** - Status tracking, consumption, and damage reporting  
- **🧹 Housekeeping System** - Task management and room cleaning workflows
- **⚙️ Settings & Master Data** - Room types, rates, products, and user management
- **📊 Reports & Analytics** - Revenue, occupancy, and audit logs

## 🛠️ Tech Stack

| Technology | Purpose | Version |
|------------|---------|---------|
| **React** | Frontend Framework | TypeScript |
| **Material-UI** | UI Component Library | v5 + Grid2 |
| **MobX** | State Management | Latest |
| **Vite** | Build Tool & Dev Server | Latest |
| **react-hook-form** | Form Management | Latest |

### 📋 Development Constraints

- ✅ **TypeScript Only** - All components must use TypeScript
- ✅ **Material-UI Grid2** - Always use `Grid` from `@mui/material/Grid2`
- ✅ **MobX State** - Reactive state management with observers
- ✅ **Mock Data** - Client-side mock data for all operations
- ✅ **Responsive Design** - Mobile-first approach with MUI breakpoints

```typescript
// Example Grid Usage
import Grid from '@mui/material/Grid2';

<Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
  <Card>Content</Card>
</Grid>
```

## 📋 System Architecture

### 🔄 Business Workflow Overview

The system supports complete hotel operations through these main workflows:

> **Note:** UI components should follow these business processes for proper integration

> **File Organization:** `src/features/[FeatureName]/[Controllers|Services|Views]/`

### 📊 2.1 Dashboard (`features/Dashboard/views/DashboardView.tsx`)

**Menu:** Dashboard (แดชบอร์ด)  
**Purpose:** Central hub for real-time hotel operations overview

#### Key Components:
- 🏨 **Room Status Grid** - Interactive MUI Grid2 with room cards
  - **Status Colors:** Vacant (ว่าง) • Occupied (ไม่ว่าง) • Reserved (จอง) • Cleaning (ทำความสะอาด)
  - **Actions:** Click occupied → Quick checkout • Click reserved → Check-in
- 📈 **Metrics Cards** - Occupancy rate, revenue, available rooms

---

### 🏨 2.2 Front Desk (`features/FrontDesk/views/`)

**Menu:** Front Desk (ส่วนต้อนรับ)

#### **Check-in Form** (`CheckinView.tsx`)
- 🔍 **Reservation Search** - Select existing reservations or direct room assignment
- 🚗 **License Plate System**
  - Manual entry input (C11)
  - LPR simulation button (C1→C7)
  - Display detected plate + confidence score

#### **Check-out Flow** (`CheckoutView.tsx`)
- **Step 1:** 📋 Charges review (room + consumptions + damages)
- **Step 2:** 🧾 Invoice generation with split/merge options
- **Step 3:** 💳 Payment processing (multiple methods supported)

---

### 📋 2.3 Reservations (`features/Reservations/views/`)

**Menu:** Reservations (การจอง)

#### Components:
- 📑 **Reservation List** (`ReservationListView.tsx`)
  - Filterable data table (status, dates, guest search)
  - Quick actions: Edit, Cancel, Check-in
- ➕ **Reservation Form** (`ReservationFormView.tsx`)
  - Date pickers, room type selection
  - Guest data entry + deposit recording

---

### 🛏️ 2.4 Room Operations (`features/RoomOps/views/`)

**Menu:** Room Operations (จัดการห้องพัก)

#### Forms:
- 🍺 **Consumption Entry** (`ConsumptionForm.tsx`) - Mini-bar usage tracking
- 🔨 **Damage Report** (`DamageReportForm.tsx`) - Damage documentation with photos
- 🔄 **Room Transfer** (`RoomTransferForm.tsx`) - Guest room changes

---

### 🧹 2.5 Housekeeping (`features/Housekeeping/views/HousekeepingView.tsx`)

**Menu:** Housekeeping (งานแม่บ้าน)

#### Features:
- 📋 **Task Dashboard** - Cleaning tasks with status tracking
- 🏠 **Room Status Grid** - Rooms requiring cleaning (filterable/sortable)
- ✅ **Status Updates** - Clean → Vacant workflow
- 📝 **Task Creation** - HOUSEKEEPING task generation

---

### ⚙️ 2.6 Settings (`features/Settings/views/`)

**Menu:** Settings (ตั้งค่า)

#### CRUD Interfaces:
- 🏠 **Room Types & Rates** (`RoomRatesView.tsx`)
- 📦 **Products Master** (`ProductMasterView.tsx`) - Mini-bar items
- 🔨 **Damage Items** (`DamageMasterView.tsx`)
- 👥 **User Management** (`UserManagementView.tsx`) - Users & permissions

---

### 📊 2.7 Reports (`features/Reports/views/`)

**Menu:** Reports (รายงาน)

#### Report Types:
- 💰 **Revenue Report** - Room, consumption, damage revenue breakdown
- 📈 **Occupancy Report** - Occupancy rate trends
- 📝 **Audit Logs** - System activity tracking

---

Hotel Management System

## 📋 Business Feature Requirements

### 🏨 1. Guest & Reservation Management

**Booking & Check-in/Check-out Operations**

- 📅 **Reservation Management** - Create, modify, cancel bookings with smart room assignment
- 👥 **Guest Entry System** - Optional guest information (Name, Phone, Room Type)
- 🚗 **License Plate Integration**
  - Manual entry support for primary check-in
  - Drive-in rapid check-in functionality
  - Assisted OCR with BullMQ + Paddle OCR
- 🔄 **Room Transfer** capability
- 📈 **Guest History** tracking

---

### 🛏️ 2. Room Operations Management

**In-Room Service & Status Management**

- 🏠 **Real-Time Room Status** - Vacant • Occupied • Cleaning
- 🧹 **Housekeeping Integration** - Status updates and task management
- 🍺 **Consumption Tracking** - Mini-bar and amenities usage
- 🔨 **Damage/Repair System** - Photo documentation with cost assessment
- 📦 **Inventory Tracking** (Optional) - Stock management

---

### 💰 3. Billing & Payment System

**Financial Operations & Check-out**

- ⚡ **Automated Billing** - Duration-based room charge calculation
- 🧾 **Consolidated Invoicing** - Room + consumption + damage charges
- 📊 **Split/Merge Bills** - Flexible invoice management
- 💳 **Multi-Payment Support** - Deposits, refunds, receipts, tax invoices

---

### 📊 4. Reports & Analytics

**Business Intelligence & Tracking**

- 💰 **Revenue Reports** - Daily/monthly breakdown by category
- 📈 **Occupancy Analytics** - Rate trends and reservation history
- 📝 **Audit Logs** - Complete transaction history
- 👤 **Guest History Reports** - Customer relationship tracking

---

### ⚙️ 5. Master Data & Configuration

**System Setup & Management**

- 🏠 **Room & Rate Management** - Types, status, pricing (night/hour)
- 📦 **Product Master** - Mini-bar items and amenities with prices
- 🔨 **Damage Item Master** - Damage types with compensation rates
- 👥 **User & Permission System** - Role-based access control
- 🏨 **Property Settings** - Hotel information and system configuration

---

### ☁️ 6. SaaS Control Plane

**Multi-Tenant Service Management**

- 🏢 **Tenant & Subscription Management** - Hotel accounts and domains
- 📊 **Metering & Billing** - Add-on usage tracking (LPR)
- 🔒 **RLS Data Isolation** - Secure multi-tenant architecture

---# hms-demo
