from tests.constants import (
    OrganizationsURL,
    Department,
    Ward,
    Category,
    User
)
from tests.utils import setup_organization, setup_department


def test_organization_dashboard(client):
    admin = setup_organization(client)
    print(admin)

    response = client.get(
        OrganizationsURL.dashboard,
        headers=admin.headers
    )
    
    assert response.status_code == 200
    assert response.json().get('success') is True
    data = response.json().get('data')
    assert data.get('name') == "Test Organization"
    assert 'id' in data


def test_organization_departments(client):
    admin = setup_organization(client)

    department = Department(name="Health Department")

    response = client.post(
        OrganizationsURL.departments,
        json=department.get_data(),
        headers=admin.headers
    )

    assert response.status_code == 201
    assert response.json().get('success') is True

    response = client.get(
        OrganizationsURL.departments,
        headers=admin.headers
    )

    assert response.status_code == 200
    assert response.json().get('success') is True

    data = response.json().get('data')
    assert isinstance(data, list)
    assert len(data) == 1

    data = data[0]
    assert data.get('name') == department.name
    assert 'id' in data


def test_organization_wards(client):
    admin = setup_organization(client)
    ward = Ward(
        name="Ward 1",
        geo_boundary={
            "type": "Polygon",
            "coordinates": [
                [
                    [0.0, 0.0],
                    [1.0, 0.0],
                    [1.0, 1.0],
                    [0.0, 1.0],
                    [0.0, 0.0]
                ]
            ]
        }
    )

    response = client.post(
        OrganizationsURL.wards,
        json=ward.get_data(),
        headers=admin.headers
    )
    
    assert response.status_code == 201
    assert response.json().get('success') is True

    response = client.get(
        OrganizationsURL.wards,
        headers=admin.headers
    )

    assert response.status_code == 200
    assert response.json().get('success') is True

    data = response.json().get('data')

    assert isinstance(data, list)
    assert len(data) == 1

    data = data[0]
    assert data.get('name') == ward.name
    assert data.get('geo_boundary') == ward.geo_boundary


def test_organization_category(client):
    admin = setup_organization(client)
    department = setup_department(client, admin)

    category = Category(name="Health Category", department_id=department.get('id'))

    response = client.post(
        OrganizationsURL.categories,
        json=category.get_data(),
        headers=admin.headers
    )

    assert response.status_code == 201
    assert response.json().get('success') is True


def test_organization_department_staff(client):
    admin = setup_organization(client)
    department = setup_department(client, admin)

    staff_member = User(
        name="Staff Member",
        email="staff@dept.com",
        password="password123"
    )
    data = staff_member.get_register_data()
    data["department_id"] = department.get('id')

    response = client.post(
        OrganizationsURL.departments_staff,
        json=data,
        headers=admin.headers
    )

    assert response.status_code == 201
    assert response.json().get('success') is True

    response = client.get(
        OrganizationsURL.departments_staff,
        headers=admin.headers
    )

    assert response.status_code == 200
    assert response.json().get('success') is True

    data = response.json().get('data')
    assert isinstance(data, list)
    assert len(data) == 1

    data = data[0]
    assert data.get('name') == staff_member.name
    assert data.get('email') == staff_member.email
