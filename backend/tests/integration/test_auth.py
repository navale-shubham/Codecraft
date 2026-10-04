from tests.constants import (
    AuthURL,
    User
)


def test_citizen_register(client):
    user = User(
        name="ABC DEF",
        email="abc@def.com",
        password="password123",
    )

    response = client.post(
        AuthURL.citizen_register,
        json=user.get_register_data()
    )

    assert response.status_code == 201
    assert response.json().get('success') is True


def test_organization_register(client):
    user = User(
        name="ABC DEF",
        email="abc@def.com",
        password="password123",
    )

    data = user.get_register_data()
    data['organization_name'] = 'Test Organization'

    response = client.post(
        AuthURL.organization_register,
        json=data
    )

    assert response.status_code == 201
    assert response.json().get('success') is True


def test_login(client):
    user = User(
        name="ABC DEF",
        email="abc@def.com",
        password="password123",
    )

    response = client.post(
        AuthURL.citizen_register,
        json=user.get_register_data()
    )

    assert response.status_code == 201

    response = client.post(
        AuthURL.login,
        data=user.get_login_data()
    )

    assert response.status_code == 200
    assert response.json().get('success') is True
    assert 'access_token' in response.json().get('data')
