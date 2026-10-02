import pytest

from fastapi.testclient import TestClient
from sqlmodel import SQLModel

from app.models import *
from app.core.database import engine
from app.main import app

from tests.constants import AuthURL


@pytest.fixture(autouse=True)
def setup():
    SQLModel.metadata.create_all(engine)
    yield
    SQLModel.metadata.drop_all(engine)


@pytest.fixture
def client():
    with TestClient(app) as client:
        yield client


@pytest.fixture
def login_user():
    def _login_user(client: TestClient, user):
        response = client.post(
            AuthURL.register,
            json=user.get_register_data()
        )

        if response.status_code != 201:
            raise Exception('Error in User Registration.')
        
        response = client.post(
            AuthURL.login,
            data=user.get_login_data()
        )

        if response.status_code != 200:
            raise Exception('Error in User Login.')
        
        data = response.json()

        token_type = data.get('token_type')
        access_token = data.get('access_token')
        
        user.set_headers(token_type, access_token)

    return _login_user
