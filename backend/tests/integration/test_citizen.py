from tests.constants import Citizen
from tests.constants import AuthURL, CitizenURL


def test_citizen_auth(client):
    user = Citizen(
        name = "Shubham Navale",
        email = "shub@xyz.com",
        password = "123456"
    )

    response = client.post(
        AuthURL.register,
        json=user.get_register_data()
    )

    assert response.status_code == 201
    assert response.json().get('success') is True

    response = client.post(
        AuthURL.login,
        data=user.get_login_data()
    )
    assert response.status_code == 200
    assert response.json().get('success') is True
    assert 'access_token' in response.json().get('data')

    user.set_headers("Bearer", response.json().get('data').get('access_token'))

    response = client.get(
        CitizenURL.me,
        headers=user.get_headers()
    )

    assert response.status_code == 200
    assert response.json().get('success') is True
    assert response.json().get('data').get('name') == user.name
    assert response.json().get('data').get('email') == user.email
