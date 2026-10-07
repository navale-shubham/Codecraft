from tests.constants import (
    AuthURL,
    User,
    Department,
    OrganizationsURL,
    DepartmentURL,
    CitizensURL,
    Ward
)


def login_user(client, user):
    response = client.post(
        AuthURL.login,
        data=user.get_login_data()
    )

    assert response.status_code == 200
    token_type = response.json().get('token_type')
    access_token = response.json().get('access_token')
    
    user.set_header('Authorization', f'{token_type} {access_token}')


def setup_organization(client):
    admin = User(
        name="Org Admin",
        email="admin@org.com",
        password="password123"
    )

    data = admin.get_register_data()
    data.update({"organization_name": "Test Organization"})

    # Register and login admin
    response = client.post(
        AuthURL.organization_register,
        json=data
    )

    assert response.status_code == 201
    assert response.json().get('success') is True

    response = client.post(
        AuthURL.login,
        data=admin.get_login_data()
    )

    assert response.status_code == 200

    token_type = response.json().get('token_type')
    access_token = response.json().get('access_token')
    
    admin.set_header('Authorization', f'{token_type} {access_token}')
    return admin


def setup_department(client, admin):
    department_data = Department(name="Health Department")

    response = client.post(
        OrganizationsURL.departments,
        json=department_data.get_data(),
        headers=admin.headers
    )

    assert response.status_code == 201

    response = client.get(
        OrganizationsURL.departments,
        headers=admin.headers
    )

    assert response.status_code == 200
    
    return response.json().get('data')[0]


def setup_department_staff(client, admin, department_id):
    staff_member = User(
        name="Staff Member",
        email="staff@dept.com",
        password="password123"
    )

    data = staff_member.get_register_data()
    data["department_id"] = department_id

    response = client.post(
        OrganizationsURL.departments_staff,
        json=data,
        headers=admin.headers
    )

    assert response.status_code == 201

    login_user(client, staff_member)
    return staff_member


def setup_field_staff(client, department_id, department_staff):
    field_staff = User(
        name="Field Staff",
        email="fieldstaff@dept.com",
        password="password123"
    )

    data = field_staff.get_register_data()
    data["department_id"] = department_id

    response = client.post(
        DepartmentURL.fieldstaff,
        json=data,
        headers=department_staff.headers
    )

    assert response.status_code == 201

    login_user(client, field_staff)
    return field_staff


def setup_citizen(client):
    citizen = User(
        name="Citizen",
        email="cit@izen.com",
        password="password123"
    )

    response = client.post(
        AuthURL.citizen_register,
        json=citizen.get_register_data()
    )

    assert response.status_code == 201
    assert response.json().get('success') is True

    response = client.post(
        AuthURL.login,
        data=citizen.get_login_data()
    )

    assert response.status_code == 200

    data = response.json()
    token_type = data.get('token_type')
    access_token = data.get('access_token')
    
    citizen.set_header('Authorization', f'{token_type} {access_token}')
    return citizen


def get_issue_categories(client, citizen):
    response = client.get(
        CitizensURL.issue_categories,
        headers=citizen.headers
    )

    assert response.status_code == 200
    return response.json().get('data')


def setup_ward(client, organization_admin):
    ward_data = Ward(
        name="Ward 1",
        geo_boundary={
            "type": "Polygon",
            "coordinates": [
          [
            [
                74.364792, 19.650033 
            ],
            [
                74.296915, 19.535384
            ],
            [
                74.601907, 19.483549
            ],
            [
                74.560331, 19.736700
            ],
            [
                74.364792, 19.650033 
            ]
          ]
        ]
        }
    )

    response = client.post(
        OrganizationsURL.wards,
        json=ward_data.get_data(),
        headers=organization_admin.headers
    )

    assert response.status_code == 201

    response = client.get(
        OrganizationsURL.wards,
        headers=organization_admin.headers
    )

    assert response.status_code == 200
    
    return response.json().get('data')[0]


def setup_issue_category(client, admin, department):
    category_data = {
        "name": "Test Category",
        "department_id": department['id']
    }

    response = client.post(
        OrganizationsURL.categories,
        json=category_data,
        headers=admin.headers
    )

    assert response.status_code == 201

    response = client.get(
        OrganizationsURL.categories,
        headers=admin.headers
    )

    assert response.status_code == 200
    
    return response.json().get('data')[0]
