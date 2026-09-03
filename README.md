# RMS — Request Management System

A modern **Request Management System (RMS)** designed to digitize and streamline the day-to-day operations of **mobile, gadget, and electronics repair centers**.

RMS replaces manual request tracking, paper-based job handling, status updates, billing processes, and communication workflows with a centralized digital platform. It provides repair centers with structured request management, role-based workflows, automated notifications, payment tracking, dashboards, and reporting.

---

## Overview

Repair centers often manage customer requests, repair jobs, parts, service charges, payments, status updates, and customer communication through a combination of manual records, spreadsheets, messaging applications, and paper documents.

RMS provides a centralized solution where the complete lifecycle of a repair request can be managed digitally.

### Request Lifecycle

```text
New
 ↓
In Progress
 ↓
Ready
 ↓
Closed
```

Requests can also be moved to:

```text
Cancelled
```

The system provides controlled status transitions and role-based access to ensure that each request follows the organization's defined workflow.

---

## Key Features

### 1. Request Management

The Requests module provides a centralized view of repair and service requests.

Features include:

* Create and manage customer requests
* View request details
* Track request status
* Assign requests to responsible users
* Search and filter requests
* View request history
* Update request status
* Manage service charges
* Manage parts associated with a request
* Track request progress
* Handle cancelled and closed requests
* Role-based request operations

---

### 2. Request Workflow

RMS provides a structured workflow for managing repair requests from creation to completion.

Supported statuses include:

* **New** — Newly registered request
* **In Progress** — Repair or service is currently being performed
* **Ready** — Service has been completed and the request is ready for billing/collection
* **Closed** — Request has been completed and finalized
* **Cancelled** — Request has been cancelled

The workflow can be controlled according to user roles and business requirements.

---

### 3. Dashboard

The dashboard provides an overview of operational and financial activity.

Depending on the user's role, the dashboard can provide information such as:

* Total requests
* Requests by status
* Billed jobs
* Pending billing
* Revenue
* Request trends
* Operational statistics
* Date-based filtering
* Status-based filtering

Dashboard statistics can be filtered using:

* From Date
* To Date
* Request Status

This allows management to monitor business activity over specific periods.

---

### 4. Parts Management

RMS supports management of parts used during repair services.

Features include:

* Add parts to repair requests
* Specify part quantity
* Record part prices
* View part descriptions
* Calculate part totals
* Manage multiple parts within a request
* Track parts associated with individual jobs

Parts are displayed in a structured format to make repair and billing information easier to understand.

---

### 5. Payment & Billing Management

The Payment module manages billing information associated with completed repair jobs.

Features include:

* Record payments
* Track billed jobs
* Calculate total revenue
* Track pending billing
* Associate payments with repair jobs
* View payment information
* Filter billing information by date
* Generate billing-related reports

The system separates operational statuses from billing-related information so that revenue is calculated from completed/closed jobs.

---

### 6. Status Management

Administrators can manage the statuses used throughout the request workflow.

Features include:

* Create statuses
* Edit statuses
* Activate/deactivate statuses
* Configure SLA hours
* Control status availability
* Define workflow-related rules

SLA configuration allows organizations to define the expected time associated with a status or process.

---

### 7. Role-Based Access Control

RMS provides role-based functionality to ensure users only access the operations relevant to their responsibilities.

Example roles include:

* **Administrator**
* **Receptionist**
* **Service Officer**
* **Account Manager**

Different roles can have different permissions for:

* Viewing requests
* Creating requests
* Updating requests
* Changing statuses
* Managing payments
* Managing users
* Managing workflows
* Viewing dashboards
* Managing notifications

---

### 8. Notifications

RMS includes notification functionality for keeping users informed about important workflow events.

Notifications can be used for:

* Request status changes
* Workflow actions
* Assignment updates
* Important reminders
* Operational events

Notification visibility can be controlled based on user roles.

---

### 9. SMS Notifications

The system supports SMS-based communication through configurable SMS templates.

Features include:

* Create SMS templates
* Configure SMS headings
* Configure SMS message bodies
* Reuse templates across workflows
* Prevent duplicate templates
* Trigger SMS notifications through workflows

SMS functionality can be integrated with external SMS providers such as Twilio.

---

### 10. Workflow Management

RMS supports configurable workflows for different business processes.

Workflow functionality includes:

* Define workflow stages
* Assign roles to stages
* Assign users
* Configure stage validations
* Configure notifications
* Configure SMS notifications
* Define workflow actions
* Control workflow progression

This allows repair centers to customize how requests move through their internal processes.

---

### 11. Reminders

The reminder functionality allows users to create and manage operational reminders.

Reminders can be associated with:

* Users
* Requests
* Workflow activities
* Follow-up actions

Audience-based reminders can be configured so that relevant users receive the appropriate notification.

---

### 12. Search & Filtering

RMS provides filtering capabilities for managing large volumes of requests.

Available filtering options can include:

* Request status
* From date
* To date
* User
* Request information
* Other business-specific criteria

Date filtering supports complete-day ranges to ensure requests created throughout the selected end date are included.

---

### 13. Reports & Export

RMS supports exporting operational and financial information for further analysis.

Export functionality includes:

* Request data
* Job information
* Parts information
* Payment information
* Revenue information
* Service charges

Data can be exported into spreadsheet formats such as Excel for reporting and business analysis.

---

## Application Modules

The major modules of RMS include:

```text
RMS
│
├── Authentication
│
├── Dashboard
│
├── Requests
│   ├── Request Listing
│   ├── Request Details
│   ├── Request Creation
│   ├── Status Management
│   └── Request History
│
├── Jobs
│   ├── Job Details
│   ├── Parts
│   └── Service Charges
│
├── Payments
│   ├── Billing
│   ├── Payment Records
│   └── Revenue
│
├── Workflow
│   ├── Workflow Builder
│   ├── Stages
│   ├── Roles
│   ├── Users
│   └── Notifications
│
├── Notifications
│   ├── Push Notifications
│   └── SMS Notifications
│
├── Reminders
│
├── Users & Roles
│
└── Reports & Export
```

---

# Tech Stack

## Frontend

* **Next.js**
* **React**
* **Tailwind CSS**
* **React Hook Form**
* **Mantine DataTable**
* **Lucide React**
* **Heroicons**
* JavaScript / TypeScript

The frontend provides a responsive interface for request management, dashboards, forms, tables, filters, modals, notifications, and workflow configuration.

---

## Backend

* **NestJS**
* **TypeORM**
* RESTful APIs
* Role-based authorization
* JWT-based authentication
* Workflow and business logic services

The backend manages authentication, request processing, database operations, workflows, notifications, payments, reminders, and business rules.

---

## Database

* **MySQL**
* TypeORM entities and repositories
* Relational data management

Major data areas include:

```text
Requests
Jobs
Payments
Statuses
Parts
Users
Roles
Workflows
Notifications
Reminders
```

---

## External Services & Integrations

RMS can integrate with external services for communication and infrastructure, including:

* SMS providers
* Cloud database services
* Cloud hosting
* File/document processing
* Excel export
* Mobile application capabilities

---

# Project Structure

A simplified project structure is:

```text
RMS
│
├── frontend/
│   ├── app/
│   ├── components/
│   ├── pages/
│   ├── services/
│   ├── hooks/
│   ├── utils/
│   ├── public/
│   └── styles/
│
├── backend/
│   ├── src/
│   │   ├── auth/
│   │   ├── users/
│   │   ├── requests/
│   │   ├── jobs/
│   │   ├── payments/
│   │   ├── workflow/
│   │   ├── notifications/
│   │   ├── reminders/
│   │   └── status/
│   │
│   └── package.json
│
└── README.md
```

> The exact directory structure may vary depending on the current project configuration.

---

# Getting Started

## Prerequisites

Make sure the following are installed:

* Node.js
* Yarn or npm
* MySQL
* Git
* VS Code or another preferred development environment

---

## Clone the Repository

```bash
git clone <repository-url>
cd RMS
```

---

## Frontend Setup

Navigate to the frontend project:

```bash
cd frontend
```

Install dependencies:

```bash
yarn install
```

Create the required environment configuration:

```text
.env.local
```

Configure the required API and application environment variables.

Start the development server:

```bash
yarn dev
```

---

## Backend Setup

Navigate to the backend project:

```bash
cd backend
```

Install dependencies:

```bash
yarn install
```

Configure the environment variables for:

* Database
* JWT authentication
* API configuration
* SMS provider
* Other external services

Start the backend:

```bash
yarn start:dev
```

---


# Request Workflow

The standard request lifecycle is:

```text
Customer Request
       ↓
     New
       ↓
  In Progress
       ↓
     Ready
       ↓
     Closed
```

A request can also be:

```text
New / In Progress / Ready
          ↓
      Cancelled
```

The workflow ensures that every request has a clear operational state throughout its lifecycle.

---

# Business Problem Solved

Traditional repair centers may rely on:

* Paper-based job cards
* Manual registers
* Spreadsheets
* Phone calls
* Messaging applications
* Manually maintained payment records
* Informal status tracking

These approaches can result in:

* Lost or duplicated information
* Delayed status updates
* Difficulty tracking repair progress
* Billing inconsistencies
* Limited visibility for management
* Manual reporting
* Communication gaps
* Difficulty measuring operational performance

RMS addresses these problems by providing a centralized digital platform for managing the complete request lifecycle.

---

# Benefits

### Operational Efficiency

Digitizes manual request and repair management processes.

### Centralized Information

Keeps requests, jobs, parts, payments, users, and workflow information in one system.

### Better Visibility

Dashboards provide management with real-time operational and financial information.

### Reduced Manual Work

Automates repetitive processes such as notifications, status tracking, reporting, and billing workflows.

### Controlled Access

Role-based functionality ensures users access only the operations relevant to their responsibilities.

### Scalable Workflows

Organizations can configure workflows according to their internal processes.

### Improved Customer Service

Faster request processing and automated communication help provide customers with better service.

---

# Responsive Design

The RMS interface is designed to work across different screen sizes.

### Mobile

```text
< 768px
```

### Tablet

```text
768px – 1024px
```

### Desktop

```text
> 1024px
```

The interface uses responsive layouts, tables, cards, forms, dashboards, and navigation components to provide a consistent experience across devices.

---

# Security

RMS incorporates application-level security practices including:

* Authentication
* JWT-based authorization
* Role-based access control
* Protected API endpoints
* Input validation
* Form validation
* Controlled workflow transitions
* Environment-based secret configuration
* Database-level relationships and constraints

Sensitive credentials and environment variables should not be committed to source control.

---

# Future Enhancements

Potential future enhancements include:

* [ ] Advanced analytics and business intelligence
* [ ] Customer portal
* [ ] Customer SMS tracking
* [ ] WhatsApp integration
* [ ] Automated customer notifications
* [ ] QR/barcode-based job tracking
* [ ] Inventory management
* [ ] Supplier management
* [ ] Advanced SLA monitoring
* [ ] Automated escalation
* [ ] PDF invoice generation
* [ ] Customer feedback and ratings
* [ ] Mobile application
* [ ] Offline functionality
* [ ] Multi-branch support
* [ ] Multi-company support
* [ ] Advanced audit logs

---

# Development

For development, create separate branches for new functionality:

```bash
git checkout -b feature/<feature-name>
```

After making changes:

```bash
git add .
git commit -m "Add <feature-name>"
git push origin feature/<feature-name>
```

---

# License

This project is proprietary software developed for business use.

---

# Contact

For project-related questions, development support, or business inquiries, contact the RMS development team.
