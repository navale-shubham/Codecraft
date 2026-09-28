"""
Issue reporting, routing, tracking, workflow, and resolution API endpoints.
"""
from datetime import datetime, timedelta

from fastapi import APIRouter, HTTPException, Query, Depends
from sqlmodel import Session, select
from app.schemas.common import ApiResponse
from app.schemas.issue import (
    IssueCreateRequest,
    AssignIssueRequest,
    UpdateStatusRequest,
    UpdatePriorityRequest,
    ResolveIssueRequest,
    VerifyResolutionRequest,
    ReopenIssueRequest,
    CommentCreateRequest,
)
from app.core.database import get_db
from app.crud import issue as crud_issue, notification as crud_notification, category as crud_category, department as crud_department, ward as crud_ward
from app.models.issue import Issue
from app.core.store import store

app = APIRouter(prefix="/issues", tags=["Issues & Workflow"])

@app.get("", response_model=ApiResponse)
def get_issues(
    mine: bool = Query(False),
    citizenId: str | None = Query(None),
    departmentId: str | None = Query(None),
    status: str | None = Query(None),
    wardId: str | None = Query(None),
    priority: str | None = Query(None),
    search: str | None = Query(None),
    db: Session = Depends(get_db)
):
    query = select(Issue)
    if mine and citizenId:
        query = query.where(Issue.citizen_id == citizenId)
    if departmentId:
        query = query.where(Issue.department_id == departmentId)
    if status:
        query = query.where(Issue.status == status)
    if wardId:
        query = query.where(Issue.ward_id == wardId)
    if priority:
        query = query.where(Issue.priority == priority)
    
    results = db.exec(query).all()
    
    if search:
        s = search.lower()
        results = [i for i in results if s in (i.title or "").lower() or s in (i.issue_number or "").lower()]

    return ApiResponse(data=results)

@app.get("/{issue_id}", response_model=ApiResponse)
def get_issue(issue_id: str, db: Session = Depends(get_db)):
    issue = db.exec(select(Issue).where((Issue.id == issue_id) | (Issue.issue_number == issue_id))).first()
    if not issue:
        raise HTTPException(status_code=404, detail="Issue not found")
    return ApiResponse(data=issue)

@app.post("", response_model=ApiResponse)
def create_issue(payload: IssueCreateRequest, citizen_id: str = "usr_citizen_01"):
    # Determine coordinates
    lat = payload.latitude
    lon = payload.longitude
    acc = None
    cap_time = None

    if payload.location:
        lat = payload.location.latitude
        lon = payload.location.longitude
        acc = payload.location.accuracy
        cap_time = payload.location.captured_at

    # Auto-classify
    from app.core.classifier import auto_classify_issue
    classification = auto_classify_issue(
        title=payload.title,
        description=payload.description,
        imageUrls=payload.mediaUrls,
        latitude=lat,
        longitude=lon,
        wards=store.wards
    )

    # Use payload values or fallback to classification or default
    cat_id = payload.categoryId or classification["category_id"] or "cat_pothole"
    ward_id = payload.wardId or classification["ward_id"] or "w_12"

    cat = next((c for c in store.categories if c["id"] == cat_id), None)
    dept_id = cat["departmentId"] if cat else (classification["department_id"] or "dept_roads")
    dept = next((d for d in store.departments if d["id"] == dept_id), None)
    ward = next((w for w in store.wards if w["id"] == ward_id), None)

    issue_number = f"CIV-2026-00{1248 + len(store.issues)}"
    
    # SLA deadline calculation based on priority
    hours = 24
    if payload.priority == "CRITICAL":
        hours = 4
    elif payload.priority == "HIGH":
        hours = 24
    elif payload.priority == "MEDIUM":
        hours = 72
    else:
        hours = 168

    due_at = datetime.utcnow() + timedelta(hours=hours)

    new_issue = {
        "id": f"iss_{len(store.issues) + 101}",
        "issueNumber": issue_number,
        "title": payload.title,
        "description": payload.description,
        "status": "REPORTED",
        "priority": payload.priority,
        "categoryId": cat_id,
        "categoryName": cat["name"] if cat else "General Civic Issue",
        "departmentId": dept_id,
        "departmentName": dept["name"] if dept else "Municipal Operations",
        "wardId": ward_id,
        "wardName": ward["name"] if ward else ward_id,
        "citizenId": citizen_id,
        "citizenName": "Rahul Sharma",
        "latitude": lat,
        "longitude": lon,
        "locationAccuracy": acc,
        "locationCapturedAt": cap_time,
        "address": payload.address or "Address determined via GPS",
        "autoClassified": classification["auto_classified"],
        "classificationConfidence": classification["confidence"],
        "reportedAt": datetime.utcnow(),
        "dueAt": due_at,
        "media": [
            {"id": f"med_{idx}", "mediaType": "IMAGE", "fileUrl": url, "createdAt": datetime.utcnow()}
            for idx, url in enumerate(payload.mediaUrls or [])
        ],
        "comments": [],
        "timeline": [
            {
                "oldStatus": None,
                "newStatus": "REPORTED",
                "changedBy": citizen_id,
                "changedByName": "Rahul Sharma",
                "reason": "Issue created via Citizen Portal with automated department routing.",
                "createdAt": datetime.utcnow()
            }
        ]
    }
    store.issues.insert(0, new_issue)
    
    # Create notification for citizen
    store.notifications.insert(0, {
        "id": f"notif_{len(store.notifications) + 1}",
        "userId": citizen_id,
        "issueId": new_issue["id"],
        "title": "Issue Registered",
        "message": f"Your report #{issue_number} was routed to {dept['name'] if dept else 'Department'}.",
        "type": "ISSUE_CREATED",
        "isRead": False,
        "createdAt": datetime.utcnow()
    })

    return ApiResponse(
        data={
            "id": new_issue["id"],
            "issueNumber": issue_number,
            "status": "REPORTED",
            "department": {"id": dept_id, "name": dept["name"] if dept else "Roads Department"}
        },
        message="Issue reported successfully"
    )

@app.post("/{issue_id}/assign", response_model=ApiResponse)
def assign_issue(issue_id: str, payload: AssignIssueRequest, supervisor_id: str = "usr_sup_roads"):
    issue = next((i for i in store.issues if i["id"] == issue_id), None)
    if not issue:
        raise HTTPException(status_code=404, detail="Issue not found")
    
    staff = next((u for u in store.users if u["id"] == payload.assignedTo), None)
    staff_name = f"{staff['firstName']} {staff['lastName']}" if staff else "Staff Specialist"
    
    old_status = issue["status"]
    issue["assignedTo"] = payload.assignedTo
    issue["assigneeName"] = staff_name
    issue["status"] = "ASSIGNED"
    if payload.dueAt:
        issue["dueAt"] = payload.dueAt
    
    issue["timeline"].append({
        "oldStatus": old_status,
        "newStatus": "ASSIGNED",
        "changedBy": supervisor_id,
        "changedByName": "Department Supervisor",
        "reason": payload.reason or f"Assigned to {staff_name}",
        "createdAt": datetime.utcnow()
    })

    # Notify staff
    store.notifications.insert(0, {
        "id": f"notif_{len(store.notifications) + 1}",
        "userId": payload.assignedTo,
        "issueId": issue["id"],
        "title": "New Assignment",
        "message": f"You were assigned to #{issue['issueNumber']} - {issue['title']}",
        "type": "ISSUE_ASSIGNED",
        "isRead": False,
        "createdAt": datetime.utcnow()
    })

    return ApiResponse(data=issue, message="Issue successfully assigned")

@app.patch("/{issue_id}/status", response_model=ApiResponse)
def update_status(issue_id: str, payload: UpdateStatusRequest, user_id: str = "usr_field_roads"):
    issue = next((i for i in store.issues if i["id"] == issue_id), None)
    if not issue:
        raise HTTPException(status_code=404, detail="Issue not found")
    
    old_status = issue["status"]
    issue["status"] = payload.status
    issue["timeline"].append({
        "oldStatus": old_status,
        "newStatus": payload.status,
        "changedBy": user_id,
        "changedByName": "Municipal Employee",
        "reason": payload.reason or f"Status changed to {payload.status}",
        "createdAt": datetime.utcnow()
    })

    return ApiResponse(data=issue, message="Status updated successfully")

@app.patch("/{issue_id}/priority", response_model=ApiResponse)
def update_priority(issue_id: str, payload: UpdatePriorityRequest, user_id: str = "usr_sup_roads"):
    issue = next((i for i in store.issues if i["id"] == issue_id), None)
    if not issue:
        raise HTTPException(status_code=404, detail="Issue not found")
    
    issue["priority"] = payload.priority
    issue["timeline"].append({
        "oldStatus": issue["status"],
        "newStatus": issue["status"],
        "changedBy": user_id,
        "changedByName": "Department Supervisor",
        "reason": f"Priority updated to {payload.priority}: {payload.reason or 'Administrative adjustment'}",
        "createdAt": datetime.utcnow()
    })
    return ApiResponse(data=issue, message="Priority updated successfully")

@app.post("/{issue_id}/resolve", response_model=ApiResponse)
def resolve_issue(issue_id: str, payload: ResolveIssueRequest, user_id: str = "usr_field_roads"):
    issue = next((i for i in store.issues if i["id"] == issue_id), None)
    if not issue:
        raise HTTPException(status_code=404, detail="Issue not found")
    
    old_status = issue["status"]
    issue["status"] = "RESOLVED"
    issue["resolvedAt"] = datetime.utcnow()
    issue["resolutionType"] = payload.resolutionType
    issue["resolutionDescription"] = payload.description
    if payload.evidenceMediaUrl:
        issue["evidenceMediaUrl"] = payload.evidenceMediaUrl
    
    issue["timeline"].append({
        "oldStatus": old_status,
        "newStatus": "RESOLVED",
        "changedBy": user_id,
        "changedByName": "Field Specialist",
        "reason": f"Resolution: {payload.resolutionType} - {payload.description}",
        "createdAt": datetime.utcnow()
    })

    # Notify Citizen for verification
    store.notifications.insert(0, {
        "id": f"notif_{len(store.notifications) + 1}",
        "userId": issue["citizenId"],
        "issueId": issue["id"],
        "title": "Action Required: Verify Resolution",
        "message": f"Issue #{issue['issueNumber']} was marked resolved. Please confirm or reopen.",
        "type": "ISSUE_RESOLVED",
        "isRead": False,
        "createdAt": datetime.utcnow()
    })

    return ApiResponse(data=issue, message="Issue resolved with evidence")

@app.post("/{issue_id}/verify-resolution", response_model=ApiResponse)
def verify_resolution(issue_id: str, payload: VerifyResolutionRequest, citizen_id: str = "usr_citizen_01"):
    issue = next((i for i in store.issues if i["id"] == issue_id), None)
    if not issue:
        raise HTTPException(status_code=404, detail="Issue not found")
    
    if payload.resolved:
        issue["status"] = "CLOSED"
        issue["closedAt"] = datetime.utcnow()
        issue["citizenVerified"] = True
        issue["timeline"].append({
            "oldStatus": "RESOLVED",
            "newStatus": "CLOSED",
            "changedBy": citizen_id,
            "changedByName": "Reporting Citizen",
            "reason": payload.comment or "Citizen verified and accepted the resolution.",
            "createdAt": datetime.utcnow()
        })
    else:
        issue["status"] = "REOPENED"
        issue["citizenVerified"] = False
        issue["timeline"].append({
            "oldStatus": "RESOLVED",
            "newStatus": "REOPENED",
            "changedBy": citizen_id,
            "changedByName": "Reporting Citizen",
            "reason": payload.comment or "Citizen reported problem persists.",
            "createdAt": datetime.utcnow()
        })

    return ApiResponse(data=issue, message="Verification processed")

@app.post("/{issue_id}/reopen", response_model=ApiResponse)
def reopen_issue(issue_id: str, payload: ReopenIssueRequest, citizen_id: str = "usr_citizen_01"):
    issue = next((i for i in store.issues if i["id"] == issue_id), None)
    if not issue:
        raise HTTPException(status_code=404, detail="Issue not found")
    
    old_status = issue["status"]
    issue["status"] = "REOPENED"
    issue["citizenVerified"] = False
    issue["timeline"].append({
        "oldStatus": old_status,
        "newStatus": "REOPENED",
        "changedBy": citizen_id,
        "changedByName": "Reporting Citizen",
        "reason": f"Reopened by citizen: {payload.reason}",
        "createdAt": datetime.utcnow()
    })

    # Alert Department Supervisor
    store.notifications.insert(0, {
        "id": f"notif_{len(store.notifications) + 1}",
        "userId": "usr_sup_roads",
        "issueId": issue["id"],
        "title": "Issue Reopened by Citizen",
        "message": f"Issue #{issue['issueNumber']} was rejected by citizen: '{payload.reason}'",
        "type": "ISSUE_REOPENED",
        "isRead": False,
        "createdAt": datetime.utcnow()
    })

    return ApiResponse(data=issue, message="Issue reopened and department notified")

@app.post("/{issue_id}/comments", response_model=ApiResponse)
def add_comment(issue_id: str, payload: CommentCreateRequest, user_id: str = "usr_citizen_01"):
    issue = next((i for i in store.issues if i["id"] == issue_id), None)
    if not issue:
        raise HTTPException(status_code=404, detail="Issue not found")
    
    user = next((u for u in store.users if u["id"] == user_id), None)
    user_name = f"{user['firstName']} {user['lastName']}" if user else "Citizen"
    user_role = user["role"] if user else "CITIZEN"

    comment_obj = {
        "id": f"comm_{len(issue['comments']) + 1}",
        "issueId": issue_id,
        "userId": user_id,
        "userName": user_name,
        "userRole": user_role,
        "comment": payload.comment,
        "isInternal": payload.isInternal,
        "createdAt": datetime.utcnow()
    }
    issue["comments"].append(comment_obj)
    return ApiResponse(data=comment_obj, message="Comment posted")
