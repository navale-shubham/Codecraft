import pytest
from pathlib import Path
import shutil

from fastapi.testclient import TestClient
from sqlmodel import SQLModel

from app.models import *
from app.core.database import engine
from app.main import app


@pytest.fixture(autouse=True)
def setup_database():
    SQLModel.metadata.create_all(engine)
    yield
    SQLModel.metadata.drop_all(engine)


@pytest.fixture(scope="session", autouse=True)
def setup_media_dir():
    media_dir = Path(__file__).parent.parent / 'media'
    media_dir.mkdir(exist_ok=True)
    yield
    shutil.rmtree(media_dir, ignore_errors=True)


@pytest.fixture
def client():
    with TestClient(app) as client:
        yield client
