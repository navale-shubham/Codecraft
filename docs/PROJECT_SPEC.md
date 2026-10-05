# Crowdsourced Civic Issue Reporting & Resolution System

The system is a centralized platform through which citizens can report civic problems, municipal departments can manage and resolve those problems, and organizations can configure departments, wards, and administrative structures.

---

## 1. Target Users

The system has three primary user categories.

### 1.1 Citizen

Citizens are the people who report and track civic problems in their locality.

Citizens should be able to:

- Register/login
- Report civic issues
- Upload photographs
- Add descriptions
- Select an issue category
- View reported issues
- Track issue status

---

### 1.2 Organization Administrator

The organization represents the municipal corporation/local government organization.

He should be able to:

- Create departments
- Update departments
- Create department users
- Create wards
- Configure issue categories
- Monitor department performance

---

### 1.3 Department Staff

Capabilities:

- View all department issues
- View incoming issues
- View issue details
- Assign issues to staff
- Approve resolution
- View department analytics

---

### 1.4 Field Staff

Capabilities:

- View assigned issues
- Mark work as completed
- Upload photographs

---

# 2. User Flows

## 2.1 Organization Creation Flow

```text
Open Application
       ↓
Select "Create Organization"
       ↓
Enter Name
       ↓
Enter Email
       ↓
Enter Organization Name
       ↓
Create Password
       ↓
Organization Dashboard
```

---

## 2.2 Organization Setup Flow

```text
Organization Dashboard
       ↓
Create Wards
       ↓
Create Departments
       ↓
Create Categories
       ↓
Map Categories → Departments
       ↓
Create Department Users
```

## 2.3 Citizen Registration Flow

```text
Open Application
       ↓
Select "Citizen"
       ↓
Register
       ↓
Enter Name
       ↓
Enter Email
       ↓
Create Password
       ↓
Citizen Dashboard
```

---

## 2.4 Citizen Login Flow

```text
Login
  ↓
Enter Email
  ↓
Enter Password
  ↓
Authentication
  ↓
Load Citizen Profile
  ↓
Citizen Dashboard
```

---

## 2.5 Report Civic Issue Flow

```text
Citizen Dashboard
       ↓
"Report Issue"
       ↓
Capture / Upload Image
       ↓
Select Category
       ↓
Enter Description
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
```

---

## 2.6 Issue Review Flow

```text
Issue Created
      ↓
Status = REPORTED
      ↓
Department User Opens Issue
      ↓
Review Issue
      ↓
Valid Issue?
    /      \
  Yes       No
  ↓          ↓
Assign     Reject
  ↓
IN_PROGRESS
```

---

## 2.7 Issue Assignment Flow

```text
Department Dashboard
       ↓
Open Unassigned Issues
       ↓
Select Issue
       ↓
Add Due Date
       ↓
Assign to Staff Member
```

---

## 2.8 Field Staff Workflow

```text
Staff Login
    ↓
My Assigned Issues
    ↓
Open Issue
    ↓
View Location
    ↓
Perform Work
    ↓
Upload Evidence
    ↓
Mark Completed
    ↓
Status = RESOLUTION_PENDING
```

---

## 2.9 Resolution Flow

```text
RESOLUTION_PENDING
        ↓
Department User Reviews
        ↓
Resolution Valid?
      /      \
    Yes       No
    ↓          ↓
RESOLVED     REOPEN (Assign Issue to Field Staff)
```

---

# 3. Database Schema

## 3.1 organizations

```sql
organizations
-------------
id UUID PK
admin_id UUID FK
name VARCHAR(150)
created_at TIMESTAMP
```

---

## 3.2 users

```sql
citizens
-----
id UUID PK
organization_id UUID FK
department_id UUID FK
name VARCHAR(100)
email VARCHAR(255) UNIQUE
password_hash TEXT
role ENUM('CITIZEN','ORG_ADMIN','DEPARTMENT_STAFF','FIELD_STAFF')
created_at TIMESTAMP
```

---

## 3.3 departments

```sql
departments
-----------
id UUID PK
organization_id UUID FK
name VARCHAR(150)
created_at TIMESTAMP
```

---

## 3.4 wards

```sql
wards
-----
id UUID PK
organization_id UUID FK
name VARCHAR(100)
geo_boundary GEOMETRY
created_at TIMESTAMP
```

---

## 3.5 field teams

```sql
field_teams
-----------
id UUID PK
department_id UUID FK
name VARCHAR(100)
created_at TIMESTAMP
```

---

## 3.6 issue_categories

```sql
issue_categories
----------------
id UUID PK
organization_id UUID FK
department_id UUID FK
name VARCHAR(150)
created_at TIMESTAMP
```

---

## 3.7 issues

```sql
issues
------
id UUID PK
issue_number VARCHAR(30) UNIQUE
citizen_id UUID FK
organization_id UUID FK
ward_id UUID FK
department_id UUID FK
category_id UUID FK

title VARCHAR(255)
description TEXT

latitude DECIMAL(10,8)
longitude DECIMAL(11,8)

status VARCHAR(30)

assigned_to UUID FK NULL

reported_at TIMESTAMP
due_at TIMESTAMP
resolved_at TIMESTAMP
closed_at TIMESTAMP

created_at TIMESTAMP
```

---

## 3.8 issue_media

```sql
issue_media
-----------
id UUID PK
issue_id UUID FK

file_url TEXT
```

---

# 4. API Architecture

Base URL:

```text
/api/v1
```

Response structure:

```json
{
  "success": true,
  "data": {}
}
```

Error:

```json
{
  "success": false,
  "error_code": "ISSUE_NOT_FOUND"
}
```

---

## 4.1 Authentication APIs

### Register Citizen

```http
POST /api/v1/auth/citizen/register
```

Request:

```json
{
  "name": "",
  "email": "",
  "password": ""
}
```

Response `201`:

```json
{
  "success": true,
  "data": null
}
```

---

### Register Organization

```http
POST /api/v1/auth/organization/register
```

Request:

```json
{
  "name": "",
  "email": "",
  "organization_name": "",
  "password": ""
}
```

Response `201`:

```json
{
  "success": true,
  "data": null
}
```

---

### Login

```http
POST /api/v1/auth/login
Content-Type: application/x-www-form-urlencoded
```

Request (form fields):

```
username=user@example.com&password=********
```

Response `200`:

```json
{
  "token_type": "bearer",
  "access_token": "jwt_token"
}
```

> **Note:** The login endpoint follows the OAuth2 password flow. It returns the token object directly (not wrapped in the standard `ApiResponse` envelope).

---

## 4.2 Citizen APIs

All citizen endpoints require `Authorization: Bearer <token>` except `GET /api/v1/citizens/issue-categories`.

### Get Citizen Profile

```http
GET /api/v1/citizens/me
```

Response `200`:

```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "Full Name",
    "email": "example@xyz.com",
    "role": "CITIZEN"
  }
}
```

---

### Get Issue Categories

```http
GET /api/v1/citizens/issue-categories
```

Response `200`:

```json
{
  "success": true,
  "data": [
    { "id": "uuid", "name": "Potholes" }
  ]
}
```

---

### Create Issue

```http
POST /api/v1/citizens/issues
```

Request:

```json
{
  "title": "Large pothole near school",
  "description": "A large pothole is present on the main road.",
  "category_id": "uuid",
  "location": {
    "latitude": 19.076,
    "longitude": 72.8777
  }
}
```

Response `201`:

```json
{
  "success": true,
  "data": {
    "id": "uuid"
  }
}
```

---

### Upload Issue Media

```http
POST /api/v1/citizens/issues/{issue_id}/media
Content-Type: multipart/form-data
```

Form field:

| Field | Type     | Required |
|-------|----------|----------|
| `file` | binary  | ✅       |

Response `201`:

```json
{
  "success": true,
  "data": null
}
```

---

### Get My Issues

```http
GET /api/v1/citizens/issues
```

Response `200`:

```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "issue_number": "CIV-2026-00123",
      "citizen": { "name": "Rahul Sharma" },
      "organization": { "name": "Mumbai Municipal Corporation" },
      "ward": { "name": "Ward 12" },
      "department": { "name": "Roads Department" },
      "category": { "id": "uuid", "name": "Potholes" },
      "title": "Large pothole near school",
      "description": "...",
      "latitude": 19.076,
      "longitude": 72.8777,
      "status": "IN_PROGRESS",
      "assigned_to": { "name": "Amit Patel" },
      "reported_at": "2026-10-01T10:00:00Z",
      "due_at": "2026-10-08T18:00:00Z",
      "resolved_at": null,
      "created_at": "2026-10-01T10:00:00Z",
      "media": [{ "file_url": "https://..." }]
    }
  ]
}
```

---

### Get Issue

```http
GET /api/v1/citizens/issues/{issue_id}
```

Response `200`:

```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "issue_number": "CIV-2026-00123",
    "citizen": { "name": "Rahul Sharma" },
    "organization": { "name": "Mumbai Municipal Corporation" },
    "ward": { "name": "Ward 12" },
    "department": { "name": "Roads Department" },
    "category": { "id": "uuid", "name": "Potholes" },
    "title": "Large pothole near school",
    "description": "...",
    "latitude": 19.076,
    "longitude": 72.8777,
    "status": "IN_PROGRESS",
    "assigned_to": { "name": "Amit Patel" },
    "reported_at": "2026-10-01T10:00:00Z",
    "due_at": "2026-10-08T18:00:00Z",
    "resolved_at": null,
    "created_at": "2026-10-01T10:00:00Z",
    "media": [{ "file_url": "https://..." }]
  }
}
```

---

## 4.3 Department Staff APIs

All department endpoints require `Authorization: Bearer <token>`.

### Get Department Dashboard

```http
GET /api/v1/departments/dashboard
```

Response `200`:

```json
{
  "success": true,
  "data": {
    "total_issues": 1250,
    "open_issues": 240,
    "in_progress_issues": 120,
    "resolved_issues": 890,
    "overdue_issues": 40
  }
}
```

---

### Get Field Staff

```http
GET /api/v1/departments/fieldstaff
```

Response `200`:

```json
{
  "success": true,
  "data": [
    { "id": "uuid", "name": "Amit Patel", "email": "amit@municipality.gov", "role": "FIELD_STAFF" }
  ]
}
```

---

### Create Field Staff

```http
POST /api/v1/departments/fieldstaff
```

Request:

```json
{
  "name": "Amit Patel",
  "email": "amit@municipality.gov",
  "password": "secret"
}
```

> `organization_id` and `department_id` are optional fields; when omitted the backend infers them from the authenticated department staff's context.

Response `201`:

```json
{
  "success": true,
  "data": null
}
```

---

### Get Department Issues

```http
GET /api/v1/departments/issues
```

Response `200`:

```json
{
  "success": true,
  "data": []
}
```

---

### Assign Issue

```http
POST /api/v1/departments/issues/{issue_id}/assign
```

Request:

```json
{
  "issue_id": "uuid",
  "assigned_to_id": "uuid",
  "due_at": "2026-10-08T18:00:00Z"
}
```

Response `201`:

```json
{
  "success": true,
  "data": null
}
```

---

### Resolve Issue (Department Approval)

```http
POST /api/v1/departments/issues/{issue_id}/resolve
```

No request body required.

Response `200`:

```json
{
  "success": true,
  "data": null
}
```

---

## 4.4 Organization Admin APIs

All organization endpoints require `Authorization: Bearer <token>`.

### Get Organization Dashboard

```http
GET /api/v1/organizations/dashboard
```

---

### List Departments

```http
GET /api/v1/organizations/departments
```

Response `200`:

```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "Roads Department",
      "dashboard": {
        "total_issues": 100,
        "open_issues": 20,
        "in_progress_issues": 15,
        "resolved_issues": 65,
        "overdue_issues": 5
      }
    }
  ]
}
```

---

### Create Department

```http
POST /api/v1/organizations/departments
```

Request:

```json
{
  "name": "Roads Department"
}
```

Response `201`:

```json
{
  "success": true,
  "data": null
}
```

---

### List Department Staff

```http
GET /api/v1/organizations/departments/staff
```

Response `200`:

```json
{
  "success": true,
  "data": [
    { "id": "uuid", "name": "Priya Mehta", "email": "priya@municipality.gov", "role": "DEPARTMENT_STAFF" }
  ]
}
```

---

### Create Department Staff

```http
POST /api/v1/organizations/departments/staff
```

Request:

```json
{
  "name": "Priya Mehta",
  "email": "priya@municipality.gov",
  "password": "secret",
  "organization_id": "uuid",
  "department_id": "uuid"
}
```

---

### Get Wards

```http
GET /api/v1/organizations/wards
```

Response `200`:

```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "Ward 12",
      "geo_boundary": {},
      "issues": []
    }
  ]
}
```

---

### Create Ward

```http
POST /api/v1/organizations/wards
```

Request:

```json
{
  "name": "Ward 12",
  "geo_boundary": {}
}
```

Response `201`:

```json
{
  "success": true,
  "data": null
}
```

---

### Get Categories

```http
GET /api/v1/organizations/categories
```

Response `200`:

```json
{
  "success": true,
  "data": [
    { "id": "uuid", "name": "Potholes" }
  ]
}
```

---

### Create Category

```http
POST /api/v1/organizations/categories
```

Request:

```json
{
  "name": "Potholes",
  "department_id": "uuid"
}
```

Response `201`:

```json
{
  "success": true,
  "data": null
}
```

---

## 4.5 Field Staff APIs

All field staff endpoints require `Authorization: Bearer <token>`.

### Get Assigned Issues

```http
GET /api/v1/field-staff/issues
```

Response `200`:

```json
{
  "success": true,
  "data": []
}
```

---

### Resolve Issue (Field Staff)

```http
POST /api/v1/field-staff/issues/{issue_id}/resolve
```

No request body required.

Response `200`:

```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "issue_number": "CIV-2026-00123",
    "status": "RESOLUTION_PENDING"
  }
}
```

---

## 4.6 Media Files

Issue media is served as static files via a dedicated mount (not an API route).

```http
GET /media/{file_path}
```

- The server mounts the configured `MEDIA_PATH` directory under `/media`.
- `file_url` values returned in `IssueMediaResponse` are paths relative to this mount (e.g. `/media/issues/abc123/photo.jpg`).
- No authentication is required to fetch media files.

---

## 4.7 Schemas

### IssueStatus

```
REPORTED | REJECTED | IN_PROGRESS | RESOLUTION_PENDING | RESOLVED
```

### UserRole

```
CITIZEN | ORG_ADMIN | DEPARTMENT_STAFF | FIELD_STAFF
```
