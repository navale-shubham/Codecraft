from tests.constants import (
    DepartmentURL, User
)
from tests.utils import (
    setup_organization,
    setup_department,
    setup_department_staff
)


def test_department_dashboard(client):
    admin = setup_organization(client)
    department = setup_department(client, admin)
    department_staff = setup_department_staff(client, admin, department.get('id'))

    response = client.get(
        DepartmentURL.dashboard,
        headers=department_staff.headers
    )

    assert response.status_code == 200
    assert response.json().get('success') is True

    data = response.json().get('data')

    assert data == {
        "total_issues": 0,
        "open_issues": 0,
        "in_progress_issues": 0,
        "resolved_issues": 0,
        "overdue_issues": 0
    }


def test_department_issues(client):
    admin = setup_organization(client)
    department = setup_department(client, admin)
    department_staff = setup_department_staff(client, admin, department.get('id'))

    response = client.get(
        DepartmentURL.issues,
        headers=department_staff.headers
    )

    assert response.status_code == 200
    assert response.json().get('success') is True

    data = response.json().get('data')

    assert data == []


def test_department_fieldstaff(client):
    admin = setup_organization(client)
    department = setup_department(client, admin)
    department_staff = setup_department_staff(client, admin, department.get('id'))

    field_staff = User(
        name="Field Staff",
        email="field@staff.com",
        password="password123",
    )

    data = field_staff.get_register_data()
    data["department_id"] = department.get("id")

    response = client.post(
        DepartmentURL.fieldstaff,
        json=data,
        headers=department_staff.headers
    )

    assert response.status_code == 201
    assert response.json().get('success') is True

    response = client.get(
        DepartmentURL.fieldstaff,
        headers=department_staff.headers
    )

    assert response.status_code == 200
    assert response.json().get('success') is True

    data = response.json().get('data')

    assert len(data) == 1
    assert data[0].get('name') == field_staff.name
    assert data[0].get('email') == field_staff.email
