# Project Specification: Crowdsourced Civic Issue Reporting & Resolution System

The system is a centralized platform through which citizens can report civic problems, municipal departments can manage and resolve those problems, and organizations can configure departments, wards, and administrative structures.

The core lifecycle is:

**Citizen reports issue → System identifies responsible department → Department reviews and assigns issue → Field staff works on issue → Evidence/status updates are recorded → Issue is resolved → Citizen is notified → Resolution is verified/closed**

---

## 1. Target Users

The system has three primary user categories.

### 1.1 Citizen

Citizens are the people who report and track civic problems in their locality.

Typical users:

- Residents
- Students
- Senior citizens
- Local community members
- Business owners
- Visitors

Citizens should be able to:

- Register/login
- Manage their profile
- Select their location
- Report civic issues
- Upload photographs/videos
- Add descriptions
- Select an issue category
- View reported issues
- Track issue status
- Receive notifications
- Comment/provide additional information
- Confirm whether an issue has actually been resolved
- Reopen an issue if the reported problem persists
- View public issues in their locality

Example:

> A citizen notices a large pothole on a road. They take a photograph, select “Roads → Pothole,” confirm their location, and submit the complaint.

---

### 1.2 Department User

Department users are municipal employees responsible for handling issues.

Examples:

- Roads Department
- Water Department
- Electricity Department
- Waste Management Department
- Public Health Department
- Street Lighting Department

Department users should be able to:

- View incoming issues
- Filter issues
- Search issues
- View issue details
- Assign issues to staff
- Change issue status
- Add internal notes
- Add public comments
- Upload resolution evidence
- Set priority
- Define/track SLA deadlines
- Escalate overdue issues
- Mark issues as resolved
- View department statistics
- Manage department-specific categories
- Track issues geographically

Example:

> The Roads Department receives a pothole report. A supervisor assigns it to a field worker, who repairs the road and uploads a photograph of the repaired location.

---

### 1.3 Organization Administrator

The organization represents the municipal corporation/local government organization.

Example:

> Municipal Corporation of XYZ City

The organization administrator manages the overall administrative structure.

They should be able to:

- Create departments
- Update departments
- Disable departments
- Create/manage wards
- Assign departments to organizational areas
- Create department users
- Manage roles and permissions
- Configure issue categories
- Configure SLA policies
- View organization-wide analytics
- Monitor department performance
- View unresolved/escalated issues
- Configure notification policies

Example:

```text
Municipal Corporation
│
├── Roads Department
│   ├── Ward A
│   ├── Ward B
│   └── Ward C
│
├── Water Department
│   ├── Ward A
│   ├── Ward B
│   └── Ward C
│
└── Health Department
    ├── Ward A
    ├── Ward B
    └── Ward C
```

---

### 1.4 Department Supervisor

Although technically a department user, it is useful to distinguish supervisors from ordinary staff.

Supervisor capabilities:

- View all department issues
- Assign issues
- Reassign issues
- Change priority
- Escalate issues
- Monitor SLA
- Approve resolution
- View department analytics

---

### 1.5 Field Staff

Field staff are employees who physically work on civic problems.

They should be able to:

- View assigned issues
- Accept assignments
- Update progress
- Add comments
- Upload photographs
- Record work performed
- Mark work as completed

They generally should not be able to modify organizational configuration.

---

# 2. User Flows

## 2.1 Citizen Registration Flow

```text
Open Application
       ↓
Select "Citizen"
       ↓
Register
       ↓
Enter Name
       ↓
Enter Mobile/Email
       ↓
Create Password
       ↓
Verify OTP/Email
       ↓
Create Citizen Profile
       ↓
Select Location/Ward
       ↓
Citizen Dashboard
```

User data:

```text
Name
Mobile
Email
Password
Address
Ward
Profile Picture
Notification Preferences
```

---

## 2.2 Citizen Login Flow

```text
Login
  ↓
Enter Email/Mobile
  ↓
Enter Password / OTP
  ↓
Authentication
  ↓
Load Citizen Profile
  ↓
Citizen Dashboard
```

The backend should issue an access token after successful authentication.

---

## 2.3 Report Civic Issue Flow

This is the most important flow in the system.

```text
Citizen Dashboard
       ↓
"Report Issue"
       ↓
Select Location
       ↓
Capture / Upload Image
       ↓
Select Category
       ↓
Enter Description
       ↓
Select Severity/Priority
       ↓
Review Report
       ↓
Submit
       ↓
Backend Validates Data
       ↓
Determine Ward
       ↓
Determine Responsible Department
       ↓
Create Issue
       ↓
Generate Issue ID
       ↓
Notify Department
       ↓
Show Confirmation
```

Example:

```text
Issue ID: CIV-2026-001245

Category: Roads
Subcategory: Pothole

Location: Ward 14

Department: Roads Department

Status: Reported
Priority: High
```

---

## 2.4 Automatic Department Routing

The system should avoid forcing citizens to understand municipal organizational structures.

The citizen simply reports:

```text
Category: Water
Problem: Water leakage
Location: Ward 12
```

The backend determines:

```text
Category
    ↓
Subcategory
    ↓
Responsible Department
    ↓
Ward
    ↓
Department-Ward Assignment
```

For example:

```text
Water Leakage
      ↓
Water Department
      ↓
Ward 12
      ↓
Ward 12 Water Operations
```

Routing can be based on:

```text
category_id
subcategory_id
ward_id
organization_id
```

---

## 2.5 Issue Review Flow

Once submitted:

```text
Issue Created
      ↓
Status = REPORTED
      ↓
Department Notification
      ↓
Department Supervisor Opens Issue
      ↓
Review Issue
      ↓
Valid Issue?
    /      \
  Yes       No
  ↓          ↓
Assign       Reject
  ↓
IN_PROGRESS
```

Possible rejection reasons:

- Duplicate issue
- Insufficient information
- Outside jurisdiction
- Invalid report
- Already resolved
- Incorrect category

---

## 2.6 Issue Assignment Flow

```text
Department Dashboard
       ↓
Open Unassigned Issues
       ↓
Select Issue
       ↓
Select Staff Member
       ↓
Set Priority
       ↓
Set Due Date
       ↓
Assign
       ↓
Staff Notification
       ↓
Issue = ASSIGNED
```

The system should maintain assignment history.

Example:

```text
Issue #1234

Assigned to:
Employee #789

Assigned by:
Supervisor #45

Assigned at:
2026-09-25 10:30

Due:
2026-09-27 18:00
```

---

## 2.7 Field Staff Workflow

```text
Staff Login
    ↓
My Assigned Issues
    ↓
Open Issue
    ↓
View Location
    ↓
Accept Assignment
    ↓
Start Work
    ↓
Status = IN_PROGRESS
    ↓
Perform Work
    ↓
Upload Evidence
    ↓
Add Work Description
    ↓
Mark Completed
    ↓
Status = RESOLUTION_PENDING
```

The department supervisor can then verify the resolution.

---

## 2.8 Resolution Flow

```text
RESOLUTION_PENDING
        ↓
Supervisor Reviews
        ↓
Resolution Valid?
      /      \
    Yes       No
    ↓          ↓
RESOLVED     REOPEN
    ↓
Notify Citizen
    ↓
Citizen Verification
```

The citizen can respond:

```text
Issue Resolved
      /       \
    Yes        No
    ↓           ↓
CLOSED       REOPENED
```

This prevents departments from permanently closing an issue without citizen feedback.

---

## 2.9 Reopening Flow

```text
RESOLVED
   ↓
Citizen says "Not Resolved"
   ↓
Enter Reason
   ↓
Upload Evidence
   ↓
REOPENED
   ↓
Department Notification
   ↓
Supervisor Review
   ↓
Reassign
   ↓
IN_PROGRESS
```

The system should preserve the complete history.

---

## 2.10 Organization Setup Flow

The organization administrator initially configures the municipality.

```text
Create Organization
       ↓
Create Wards
       ↓
Create Departments
       ↓
Create Department Categories
       ↓
Map Categories → Departments
       ↓
Map Departments → Wards
       ↓
Create Employees
       ↓
Assign Roles
       ↓
Configure SLA
       ↓
Organization Ready
```

---

## 2.11 Department Management Flow

Organization admin:

```text
Departments
    ↓
Create Department
    ↓
Name
Description
Code
Contact Information
    ↓
Select Wards
    ↓
Select Categories
    ↓
Create Department
```

Example:

```text
Department:
Roads Department

Code:
RD

Wards:
A, B, C, D

Categories:
Potholes
Road Damage
Footpath Damage
Traffic Sign Damage
```

---

## 2.12 Analytics Flow

Organization administrator:

```text
Dashboard
   ↓
Select Time Period
   ↓
View Organization Statistics
   ↓
Filter by Department
   ↓
Filter by Ward
   ↓
Filter by Category
```

Metrics:

```text
Total Issues
Open Issues
Resolved Issues
Overdue Issues
Average Resolution Time
Issues by Department
Issues by Ward
Issues by Category
Citizen Satisfaction
Reopened Issues
```

---

# 3. Database Schema

A relational database such as PostgreSQL is well suited to this system.

The central entity is the `issue`.

A simplified relationship is:

```text
Organization
     │
     ├── Departments
     │       │
     │       └── Department Users
     │
     ├── Wards
     │
     └── Issue Categories

Citizen
   │
   └── Issues
          │
          ├── Issue Media
          ├── Assignments
          ├── Comments
          ├── Status History
          ├── Notifications
          └── Resolution
```

## 3.1 organizations

```sql
organizations
-------------
id UUID PK
name VARCHAR(150)
code VARCHAR(50) UNIQUE
description TEXT
email VARCHAR(255)
phone VARCHAR(30)
address TEXT
city VARCHAR(100)
state VARCHAR(100)
country VARCHAR(100)
status VARCHAR(20)
created_at TIMESTAMP
updated_at TIMESTAMP
```

Example:

```text
id: org_001
name: Mumbai Municipal Corporation
code: MMC
status: ACTIVE
```

---

## 3.2 users

One user table can handle citizens and employees.

```sql
users
-----
id UUID PK
organization_id UUID FK NULL
first_name VARCHAR(100)
last_name VARCHAR(100)
email VARCHAR(255) UNIQUE
phone VARCHAR(30) UNIQUE
password_hash TEXT
role_id UUID FK
status VARCHAR(20)
last_login_at TIMESTAMP
created_at TIMESTAMP
updated_at TIMESTAMP
```

`organization_id` can be NULL for citizens if citizens are not directly associated with an organization.

---

## 3.3 roles

```sql
roles
-----
id UUID PK
name VARCHAR(50)
description TEXT
created_at TIMESTAMP
```

Possible roles:

```text
CITIZEN
ORG_ADMIN
DEPARTMENT_ADMIN
SUPERVISOR
FIELD_STAFF
```

---

## 3.4 permissions

```sql
permissions
-----------
id UUID PK
name VARCHAR(100)
description TEXT
```

Examples:

```text
ISSUE_CREATE
ISSUE_VIEW
ISSUE_ASSIGN
ISSUE_UPDATE
ISSUE_RESOLVE
ISSUE_REOPEN
DEPARTMENT_CREATE
DEPARTMENT_UPDATE
USER_CREATE
ANALYTICS_VIEW
```

---

## 3.5 role_permissions

```sql
role_permissions
----------------
role_id UUID FK
permission_id UUID FK

PRIMARY KEY(role_id, permission_id)
```

This provides role-based access control.

---

## 3.6 departments

```sql
departments
-----------
id UUID PK
organization_id UUID FK
name VARCHAR(150)
code VARCHAR(50)
description TEXT
email VARCHAR(255)
phone VARCHAR(30)
status VARCHAR(20)
created_at TIMESTAMP
updated_at TIMESTAMP
```

Example:

```text
Roads Department
Water Department
Waste Management Department
Health Department
```

---

## 3.7 wards

```sql
wards
-----
id UUID PK
organization_id UUID FK
name VARCHAR(100)
code VARCHAR(50)
description TEXT
boundary_geojson JSONB
status VARCHAR(20)
created_at TIMESTAMP
updated_at TIMESTAMP
```

`boundary_geojson` can contain the geographic boundary of the ward.

This allows the backend to determine a ward from GPS coordinates.

---

## 3.8 department_wards

Many departments can operate in many wards.

```sql
department_wards
----------------
department_id UUID FK
ward_id UUID FK

PRIMARY KEY(department_id, ward_id)
```

---

## 3.9 issue_categories

```sql
issue_categories
----------------
id UUID PK
organization_id UUID FK
parent_id UUID FK NULL
name VARCHAR(150)
description TEXT
icon VARCHAR(100)
status VARCHAR(20)
created_at TIMESTAMP
updated_at TIMESTAMP
```

This supports hierarchical categories.

Example:

```text
Roads
 ├── Potholes
 ├── Road Damage
 ├── Footpath Damage
 └── Traffic Sign

Water
 ├── Pipeline Leakage
 ├── No Water Supply
 └── Contaminated Water
```

---

## 3.10 category_departments

```sql
category_departments
--------------------
category_id UUID FK
department_id UUID FK

PRIMARY KEY(category_id, department_id)
```

This defines which department handles each category.

---

# 4. Issue Schema

## 4.1 issues

This is the most important table.

```sql
issues
------
id UUID PK
issue_number VARCHAR(30) UNIQUE
citizen_id UUID FK
organization_id UUID FK
department_id UUID FK
category_id UUID FK
ward_id UUID FK

title VARCHAR(255)
description TEXT

latitude DECIMAL(10,8)
longitude DECIMAL(11,8)
address TEXT

priority VARCHAR(20)
status VARCHAR(30)

assigned_to UUID FK NULL

reported_at TIMESTAMP
due_at TIMESTAMP
resolved_at TIMESTAMP
closed_at TIMESTAMP

created_at TIMESTAMP
updated_at TIMESTAMP
```

Possible statuses:

```text
REPORTED
UNDER_REVIEW
REJECTED
ASSIGNED
IN_PROGRESS
RESOLUTION_PENDING
RESOLVED
CLOSED
REOPENED
ESCALATED
```

Possible priorities:

```text
LOW
MEDIUM
HIGH
CRITICAL
```

---

## 4.2 issue_media

Stores photographs/videos/documents associated with an issue.

```sql
issue_media
-----------
id UUID PK
issue_id UUID FK
uploaded_by UUID FK

media_type VARCHAR(20)
file_url TEXT
thumbnail_url TEXT

latitude DECIMAL(10,8)
longitude DECIMAL(11,8)

created_at TIMESTAMP
```

`media_type`:

```text
IMAGE
VIDEO
DOCUMENT
```

---

## 4.3 issue_assignments

Assignment history should be separate from the issue itself.

```sql
issue_assignments
-----------------
id UUID PK
issue_id UUID FK
assigned_to UUID FK
assigned_by UUID FK
assigned_at TIMESTAMP
unassigned_at TIMESTAMP NULL
reason TEXT
```

This lets the organization see:

```text
Who was assigned?
When?
By whom?
Was it reassigned?
Why?
```

---

## 4.4 issue_status_history

Every status change should be recorded.

```sql
issue_status_history
--------------------
id UUID PK
issue_id UUID FK
old_status VARCHAR(30)
new_status VARCHAR(30)
changed_by UUID FK
reason TEXT
created_at TIMESTAMP
```

Example:

```text
REPORTED → UNDER_REVIEW
UNDER_REVIEW → ASSIGNED
ASSIGNED → IN_PROGRESS
IN_PROGRESS → RESOLUTION_PENDING
RESOLUTION_PENDING → RESOLVED
RESOLVED → CLOSED
```

This is essential for auditing.

---

## 4.5 issue_comments

```sql
issue_comments
--------------
id UUID PK
issue_id UUID FK
user_id UUID FK
comment TEXT
is_internal BOOLEAN
created_at TIMESTAMP
updated_at TIMESTAMP
```

`is_internal = true` means the comment is visible only to department staff.

---

## 4.6 issue_resolutions

```sql
issue_resolutions
-----------------
id UUID PK
issue_id UUID FK
resolved_by UUID FK
resolution_description TEXT
resolution_type VARCHAR(50)
evidence_media_id UUID FK
resolved_at TIMESTAMP
citizen_verified BOOLEAN
citizen_verified_at TIMESTAMP
```

Example resolution types:

```text
REPAIRED
CLEANED
REPLACED
REMOVED
INSPECTED
NO_ACTION_REQUIRED
DUPLICATE
```

---

## 4.7 issue_reopens

```sql
issue_reopens
-------------
id UUID PK
issue_id UUID FK
reopened_by UUID FK
reason TEXT
media_id UUID FK NULL
created_at TIMESTAMP
```

---

# 5. Notifications

## notifications

```sql
notifications
-------------
id UUID PK
user_id UUID FK
issue_id UUID FK NULL

title VARCHAR(255)
message TEXT
type VARCHAR(50)

is_read BOOLEAN
created_at TIMESTAMP
read_at TIMESTAMP NULL
```

Notification types:

```text
ISSUE_CREATED
ISSUE_ASSIGNED
ISSUE_STATUS_CHANGED
ISSUE_COMMENT
ISSUE_RESOLVED
ISSUE_REOPENED
ISSUE_ESCALATED
```

---

# 6. SLA Schema

For municipal systems, SLA tracking is important.

## sla_policies

```sql
sla_policies
------------
id UUID PK
organization_id UUID FK
department_id UUID FK NULL
category_id UUID FK NULL

priority VARCHAR(20)
resolution_hours INTEGER

created_at TIMESTAMP
updated_at TIMESTAMP
```

Example:

```text
Critical → 4 hours
High     → 24 hours
Medium   → 72 hours
Low      → 168 hours
```

The actual values should be configurable by the organization.

---

# 7. Audit Logs

For administrative accountability:

```sql
audit_logs
----------
id UUID PK
organization_id UUID FK
user_id UUID FK

action VARCHAR(100)
entity_type VARCHAR(50)
entity_id UUID

old_values JSONB
new_values JSONB

ip_address INET
created_at TIMESTAMP
```

Examples:

```text
DEPARTMENT_CREATED
USER_CREATED
ISSUE_REASSIGNED
ISSUE_PRIORITY_CHANGED
ISSUE_STATUS_CHANGED
SLA_CHANGED
```

---

# 8. API Architecture

A REST API is appropriate for the MVP.

Base URL:

```text
/api/v1
```

Authentication:

```text
Authorization: Bearer <access_token>
```

Recommended response structure:

```json
{
  "success": true,
  "data": {},
  "message": "Operation successful"
}
```

Error:

```json
{
  "success": false,
  "error": {
    "code": "ISSUE_NOT_FOUND",
    "message": "Issue not found"
  }
}
```

---

# 9. Authentication APIs

### Register Citizen

```http
POST /api/v1/auth/register
```

Request:

```json
{
  "Name": "Rahul Sharma",
  "email": "rahul@example.com",
  "phone": "+919876543210",
  "password": "********"
}
```

Response:

```json
{
  "success": true,
  "data": {
    "userId": "usr_123",
    "message": "Registration successful"
  }
}
```

---

### Login

```http
POST /api/v1/auth/login
```

Request:

```json
{
  "email": "rahul@example.com",
  "password": "********"
}
```

Response:

```json
{
  "success": true,
  "data": {
    "accessToken": "jwt_token",
    "refreshToken": "refresh_token",
    "user": {
      "id": "usr_123",
      "name": "Rahul Sharma",
      "role": "CITIZEN"
    }
  }
}
```

---

### Refresh Token

```http
POST /api/v1/auth/refresh
```

---

### Logout

```http
POST /api/v1/auth/logout
```

---

# 10. Citizen APIs

### Get Citizen Profile

```http
GET /api/v1/citizens/me
```

### Update Profile

```http
PUT /api/v1/citizens/me
```

### Create Issue

```http
POST /api/v1/issues
```

Request:

```json
{
  "name": "Large pothole near school",
  "description": "A large pothole is present on the main road.",
  "location": {
    "latitude": 19.0760,
    "longitude": 72.8777,
    "accuracy": 24.5
  },
  "create_at": "2026-09-28T12:12:00+05:30"
}
```

Response:

```json
{
  "success": true,
  "data": {
    "id": "issue_123",
    "issueNumber": "CIV-2026-00123",
    "status": "REPORTED",
    "department": {
      "id": "dept_roads",
      "name": "Roads Department"
    }
  }
}
```

---

### Upload Issue Media

```http
POST /api/v1/issues/{issueId}/media
```

Recommended implementation:

```text
Client
 ↓
Request upload URL
 ↓
Object Storage
 ↓
Upload file
 ↓
Confirm upload
 ↓
Attach media to issue
```

This avoids sending large files through the application server.

---

### Get My Issues

```http
GET /api/v1/issues?mine=true
```

Possible filters:

```text
status
category
priority
dateFrom
dateTo
ward
```

Example:

```http
GET /api/v1/issues?mine=true&status=IN_PROGRESS
```

---

### Get Issue

```http
GET /api/v1/issues/{issueId}
```

Response:

```json
{
  "success": true,
  "data": {
    "issueNumber": "CIV-2026-00123",
    "name": "Large pothole near school",
    "description": "...",
    "status": "IN_PROGRESS",
    "priority": "HIGH",
    "category": {
      "name": "Potholes"
    },
    "department": {
      "name": "Roads Department"
    },
    "location": {
      "latitude": 19.0760,
      "longitude": 72.8777,
      "accuracy": 24.5
  },
    "media": []
  }
}
```

---

# 11. Department APIs

### Get Department Dashboard

```http
GET /api/v1/departments/{departmentId}/dashboard
```

Response:

```json
{
  "totalIssues": 1250,
  "openIssues": 240,
  "inProgress": 120,
  "resolved": 890,
  "overdue": 40,
  "averageResolutionHours": 31.5
}
```

---

### Get Department Issues

```http
GET /api/v1/departments/{departmentId}/issues
```

Filters:

```text
status
priority
category
ward
assignedTo
overdue
dateFrom
dateTo
```

---

### Assign Issue

```http
POST /api/v1/issues/{issueId}/assign
```

Request:

```json
{
  "assignedTo": "usr_field_123",
  "dueAt": "2026-09-27T18:00:00Z"
}
```

---

### Update Issue Status

```http
PATCH /api/v1/issues/{issueId}/status
```

Request:

```json
{
  "status": "IN_PROGRESS",
  "reason": "Field work started"
}
```

---

### Update Priority

```http
PATCH /api/v1/issues/{issueId}/priority
```

Request:

```json
{
  "priority": "CRITICAL",
  "reason": "Issue is affecting major traffic route"
}
```

---

### Resolve Issue

```http
POST /api/v1/issues/{issueId}/resolve
```

Request:

```json
{
  "resolutionType": "REPAIRED",
  "description": "Pothole repaired and road surface restored.",
  "evidenceMediaIds": [
    "media_456"
  ]
}
```

---

### Add Internal Comment

```http
POST /api/v1/issues/{issueId}/comments
```

Request:

```json
{
  "comment": "Contractor has been contacted.",
  "isInternal": true
}
```

---

# 12. Organization Admin APIs

### Create Department

```http
POST /api/v1/departments
```

Request:

```json
{
  "name": "Roads Department",
  "code": "ROADS",
  "description": "Responsible for roads and footpaths"
}
```

---

### List Departments

```http
GET /api/v1/departments
```

---

### Get Department

```http
GET /api/v1/departments/{departmentId}
```

---

### Update Department

```http
PUT /api/v1/departments/{departmentId}
```

---

### Disable Department

```http
DELETE /api/v1/departments/{departmentId}
```

Prefer soft deletion rather than physically deleting the department.

---

# 13. Ward APIs

### Create Ward

```http
POST /api/v1/wards
```

Request:

```json
{
  "name": "Ward 12",
  "code": "W12",
  "boundaryGeoJson": {}
}
```

### Get Wards

```http
GET /api/v1/wards
```

### Update Ward

```http
PUT /api/v1/wards/{wardId}
```

---

# 14. Category APIs

### Create Category

```http
POST /api/v1/categories
```

Request:

```json
{
  "name": "Potholes",
  "parentId": "cat_roads"
}
```

### Get Categories

```http
GET /api/v1/categories
```

### Map Category to Department

```http
POST /api/v1/categories/{categoryId}/departments
```

Request:

```json
{
  "departmentId": "dept_roads"
}
```

---

# 15. User Management APIs

Organization administrators need employee management.

### Create Employee

```http
POST /api/v1/users
```

Request:

```json
{
  "firstName": "Amit",
  "lastName": "Patel",
  "email": "amit@municipality.gov",
  "phone": "+919999999999",
  "role": "FIELD_STAFF",
  "departmentId": "dept_roads"
}
```

### Get Users

```http
GET /api/v1/users
```

Filters:

```text
role
department
ward
status
```

### Update User

```http
PUT /api/v1/users/{userId}
```

### Disable User

```http
DELETE /api/v1/users/{userId}
```

---

# 16. Notification APIs

### Get Notifications

```http
GET /api/v1/notifications
```

### Mark Notification Read

```http
PATCH /api/v1/notifications/{notificationId}/read
```

### Mark All Read

```http
POST /api/v1/notifications/read-all
```

---

# 17. Analytics APIs

### Organization Dashboard

```http
GET /api/v1/analytics/organization
```

Possible response:

```json
{
  "totalIssues": 15000,
  "openIssues": 2300,
  "resolvedIssues": 11500,
  "overdueIssues": 450,
  "averageResolutionTimeHours": 38.2
}
```

### Issues by Department

```http
GET /api/v1/analytics/issues-by-department
```

Response:

```json
[
  {
    "department": "Roads",
    "total": 4300,
    "resolved": 3500,
    "open": 800
  },
  {
    "department": "Water",
    "total": 2900,
    "resolved": 2400,
    "open": 500
  }
]
```

### Issues by Ward

```http
GET /api/v1/analytics/issues-by-ward
```

### Issues by Category

```http
GET /api/v1/analytics/issues-by-category
```

### Resolution Time

```http
GET /api/v1/analytics/resolution-time
```

---

# 18. Core Issue State Machine

The backend should enforce valid state transitions.

```text
                 ┌──────────────┐
                 │   REPORTED   │
                 └──────┬───────┘
                        ↓
                ┌───────────────┐
                │ UNDER_REVIEW  │
                └───────┬───────┘
                    ┌───┴───┐
                    ↓       ↓
                REJECTED   ASSIGNED
                            ↓
                       IN_PROGRESS
                            ↓
                   RESOLUTION_PENDING
                            ↓
                        RESOLVED
                       /        \
                      ↓          ↓
                   CLOSED     REOPENED
                                 ↓
                            IN_PROGRESS
```

An important rule is that users should not be able to arbitrarily change an issue from any status to any other status.

For example, a citizen should not be able to directly change:

```text
REPORTED → RESOLVED
```

Only authorized department users should be able to perform that transition.

---

# 19. Authentication and Authorization

The system should use:

```text
JWT Access Token
+
Refresh Token
+
Role-Based Access Control
```

A request might contain:

```http
Authorization: Bearer eyJhbGci...
```

The backend extracts:

```text
user_id
organization_id
role
permissions
```

and checks whether the user has permission to perform the operation.

For example:

```text
Citizen
  └── ISSUE_CREATE
  └── ISSUE_VIEW_OWN
  └── ISSUE_COMMENT
  └── ISSUE_REOPEN

Field Staff
  └── ISSUE_VIEW_ASSIGNED
  └── ISSUE_UPDATE
  └── ISSUE_RESOLVE

Supervisor
  └── ISSUE_VIEW_DEPARTMENT
  └── ISSUE_ASSIGN
  └── ISSUE_REASSIGN
  └── ISSUE_RESOLVE

Organization Admin
  └── DEPARTMENT_MANAGE
  └── USER_MANAGE
  └── CATEGORY_MANAGE
  └── ANALYTICS_VIEW
```

---

# 20. Recommended System Architecture

A practical architecture for the hackathon would be:

```text
                    ┌─────────────────────┐
                    │   Citizen Web/App   │
                    └──────────┬──────────┘
                               │
                    ┌──────────▼──────────┐
                    │ Department Dashboard│
                    └──────────┬──────────┘
                               │
                    ┌──────────▼──────────┐
                    │ Organization Admin  │
                    └──────────┬──────────┘
                               │
                         HTTPS / REST
                               │
                    ┌──────────▼──────────┐
                    │     API Server      │
                    │                     │
                    │ Authentication      │
                    │ Authorization       │
                    │ Issue Management    │
                    │ Routing             │
                    │ SLA Engine          │
                    │ Notifications       │
                    │ Analytics           │
                    └─────┬──────┬────────┘
                          │      │
              ┌───────────┘      └───────────┐
              ↓                              ↓
       ┌──────────────┐              ┌──────────────┐
       │ PostgreSQL   │              │ Object       │
       │ Database     │              │ Storage      │
       └──────────────┘              └──────────────┘
```

Optional supporting services:

```text
Redis
  ↓
Caching / queues / rate limiting

WebSocket
  ↓
Real-time notifications

Object Storage
  ↓
Images / videos / documents

Background Worker
  ↓
SLA monitoring
Notifications
Escalations
Analytics jobs
```

---

# 21. Important Non-Functional Requirements

Security:

- Passwords must be hashed using Argon2id or bcrypt.
- APIs must use HTTPS.
- JWTs should have short access-token lifetimes.
- Role and organization boundaries must be enforced server-side.
- Citizens must only be able to modify their own issues.
- Internal department comments must never be exposed to citizens.
- File uploads must be validated.
- Rate limiting should be applied to authentication and issue creation.
- Audit logs should record administrative actions.

Performance:

The MVP should target:

```text
API response: < 500 ms for normal requests
Issue creation: < 1 second excluding file upload
Dashboard loading: < 2 seconds for normal datasets
```

Scalability:

The architecture should support:

```text
Multiple organizations
Multiple departments
Multiple wards
Thousands/millions of issues
Multiple users per department
```

---
