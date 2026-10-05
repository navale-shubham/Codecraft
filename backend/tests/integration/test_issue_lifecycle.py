from datetime import datetime, timezone, timedelta

from tests.constants import (
    AuthURL,
    OrganizationsURL,
    DepartmentURL,
    CitizensURL,
    FieldStaffURL,
    Issue,
    Location
)
from tests.utils import (
    setup_organization,
    setup_department,
    setup_department_staff,
    setup_field_staff,
    setup_citizen,
    setup_issue_category,
    setup_ward
)


def test_issue_lifecycle(client):
    # Setup
    organization_admin = setup_organization(client)
    department = setup_department(client, organization_admin)
    ward = setup_ward(client, organization_admin)
    department_staff = setup_department_staff(client, organization_admin, department.get('id'))
    field_staff = setup_field_staff(client, department.get('id'), department_staff)
    citizen = setup_citizen(client)
    category = setup_issue_category(client, organization_admin, department)
    
    # Issue Creation
    issue = Issue(
        title="Test Issue",
        description="Test Description",
        category_id=category['id'],
        location=Location(
            latitude=12.345,
            longitude=15.001,
        ),
    )

    response = client.post(
        CitizensURL.issues,
        json=issue.get_data(),
        headers=citizen.headers,
    )

    assert response.status_code == 201

    data = response.json().get("data")
    issue_id = data.get("id")

    # Issue Upload Media
    response = client.post(
        CitizensURL.issue_media(issue_id),
        headers=citizen.headers,
        files=issue.get_media_data()
    )

    assert response.status_code == 201

    # Department Staff Issue Assign
    response = client.get(
        DepartmentURL.fieldstaff,
        headers=department_staff.headers,
    )
    assert response.status_code == 200
    field_staff_id = response.json().get("data")[0]['id']

    response = client.post(
        DepartmentURL.assign_issue(issue_id),
        json={
            "issue_id": issue_id,
            "assigned_to_id": field_staff_id,
            "due_at": (datetime.now(timezone.utc) + timedelta(days=1)).isoformat(),
        },
        headers=department_staff.headers,
    )

    assert response.status_code == 201

    # Field Staff get assigned issues
    response = client.get(
        FieldStaffURL.issues,
        headers=field_staff.headers,
    )
    assert response.status_code == 200
    issue = response.json().get("data")[0]
    assert issue.get("id") == issue_id

    # Field Staff Apply Issue Resolve
    response = client.post(
        FieldStaffURL.resolve_issue(issue_id),
        headers=field_staff.headers,
    )

    assert response.status_code == 200

    # Department Staff Issue Resolve
    response = client.post(
        DepartmentURL.resolve_issue(issue_id),
        json={
            "issue_id": issue_id,
        },
        headers=department_staff.headers,
    )

    assert response.status_code == 200

    # Citizen get issues
    response = client.get(
        CitizensURL.issues,
        headers=citizen.headers,
    )
    assert response.status_code == 200
    issue = response.json().get("data")[0]
    assert issue.get("id") == issue_id
    assert issue.get('status') == 'RESOLVED'
