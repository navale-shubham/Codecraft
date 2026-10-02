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

### Register

```http
POST /api/v1/auth/register
```

Request:

```json
{
  "name": "",
  "email": "",
  "password": "",
}
```

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
    "accessToken": "jwt_token"
  }
}
```

---

## 4.2 Citizen APIs

### Get Citizen Profile

```http
GET /api/v1/citizens/me
```

Response:

```json
{
  "success": true,
  "data": {
    "name": "Full Name",
    "email": "example@xyz.com"
  }
}
```

### Create Issue

```http
POST /api/v1/citizens/issues
```

Request:

```json
{
  "title": "Large pothole near school",
  "description": "A large pothole is present on the main road.",
  "categoryId": "cat_pothole",
  "location": {
    "latitude": 19.0760,
    "longitude": 72.8777
  },
  "createdAt": "2026-09-28T12:12:00+05:30"
}
```

Response:

```json
{
  "success": true,
  "data": {
    "id": "issue_123"
  }
}
```

---

### Upload Issue Media

```http
POST /api/v1/citizens/issues/{issueId}/media
```

---

### Get My Issues

```http
GET /api/v1/citizens/issues
```

Response:

```json
{
  "success": true,
  "data": []
}
```

---

### Get Issue

```http
GET /api/v1/citizens/issues/{issueId}
```

Response:

```json
{
  "success": true,
  "data": {
    "id": "issue_123",
    "issueNumber": "CIV-2026-00123",
    "citizenName": "",
    "departmentName": "Roads Department",
    "categoryName": "Potholes",
    "wardName": "",

    "title": "Large pothole near school",
    "description": "...",

    "location": {
      "latitude": 19.076,
      "longitude": 72.8777
    },

    "status": "IN_PROGRESS",

    "assignedToName": "",
    "assigneeName": "",

    "reportedAt": "",
    "dueAt": "",
    "resolvedAt": "",
    "closedAt": "",

    "createdAt": ""
  }
}
```

---

## 4.3. Department Staff APIs

### Get Department Dashboard

```http
GET /api/v1/departments/dashboard
```

Response:

```json
{
  "success": true,
  "data": {
    "totalIssues": 1250,
    "openIssues": 240,
    "inProgress": 120,
    "resolved": 890,
    "overdue": 40
  }
}
```

---

### Create Field Staff

```http
POST /api/v1/departments/staff
```

Request:

```json
{
  "name": "Amit Patel",
  "email": "amit@municipality.gov",
  "password": ""
}
```

---

### Get Field Staff

```http
GET /api/v1/departments/staff
```

Response:

```json
{
  "success": true,
  "data": []
}
```

---

### Get Department Issues

```http
GET /api/v1/departments/issues
```

Response:

```json
{
  "success": true,
  "data": []
}
```

---

### Assign Issue

```http
POST /api/v1/departments/issues/assign
```

Request:

```json
{
  "issueId": "",
  "assignTo": "usr_field_123",
  "dueAt": "2026-09-27T18:00:00Z"
}
```

---

### Resolve Issue

```http
POST /api/v1/departments/issues/resolve
```

Request:

```json
{
  "issueId": ""
}
```

---

## 4.4 Organization Admin APIs

### Get Organization Dashboard

```http
GET /api/v1/orgs
```

### Create Department

```http
POST /api/v1/orgs/departments
```

Request:

```json
{
  "name": "Roads Department"
}
```

---

### List Departments

```http
GET /api/v1/orgs/departments
```

Response:

```json
{
  "success": true,
  "data": []
}
```

---

### Create Ward

```http
POST /api/v1/orgs/wards
```

Request:

```json
{
  "name": "Ward 12",
  "boundaryGeoJson": {}
}
```

### Get Wards

```http
GET /api/v1/orgs/wards
```

Response:

```json
{
  "success": true,
  "data": {
    "id": "ward_id",
    "name": "ward_name",
    "boundaryGeoJson": {}
  }
}
```

---

### Create Category

```http
POST /api/v1/orgs/categories
```

Request:

```json
{
  "name": "Potholes",
  "departmentId": "department id"
}
```

### Get Categories

```http
GET /api/v1/orgs/categories
```

Response:

```json
{
  "success": true,
  "data": []
}
```

---

## 4.5 Field Staff APIs

### Get Assigned Issues

```http
GET /api/v1/staff/issues
```

---

### Resolve Issue

```http
POST /api/v1/staff/issues/{issueId}/resolve
```

---

### Upload Resolved Issue Media

```http
POST /api/v1/staff/issues/{issueId}/resolve/media
```

---

## 4.6 Issue Media APIs

### Get Issue Media File

```http
GET /api/v1/media/{mediaPath}
```

---

## 4.7 Organization Creation API

```http
POST /api/v1/orgs
```

Request:

```json
{
  "name": "",
  "email": "",
  "orgName": "",
  "password": ""
}
```

---
