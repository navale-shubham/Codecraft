from tests.constants import (
    OrganizationsURL, User,
    AuthURL,
    Department,
    Ward,
    Category
)


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
    assert response.json().get('success') is True

    data = response.json().get('data')

    token_type = data.get('token_type')
    access_token = data.get('access_token')
    
    admin.set_header('Authorization', f'{token_type} {access_token}')
    return admin


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


########################## ERROR ##########################
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
