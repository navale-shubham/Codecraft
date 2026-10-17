from fastapi.testclient import TestClient
import json
from tests.constants import (
    CitizensURL, Issue
)
from tests.utils import (
    setup_citizen,
    setup_organization,
    setup_department,
    setup_ward,
    setup_issue_category
)


def test_citizen_me(client):
    citizen = setup_citizen(client)

    response = client.get(
        CitizensURL.me,
        headers=citizen.headers
    )

    assert response.status_code == 200

    data = response.json().get("data")

    assert data.get("email") == citizen.email
    assert data.get("name") == citizen.name


def test_citizen_issue(client: TestClient):
    organization_admin = setup_organization(client)
    department = setup_department(client, organization_admin)
    ward = setup_ward(client, organization_admin)
    category = setup_issue_category(client, organization_admin, department)

    citizen = setup_citizen(client)

    issue = Issue(
        title="Test Issue",
        description="Test Description",
        latitude=19.577123,
        longitude=74.445428,
    )

    response = client.post(
        CitizensURL.issues,
        data=issue.get_data(),
        headers=citizen.headers,
        files=issue.get_media_data()
    )

    assert response.status_code == 201

    data = response.json().get('data')
    issue_id = data.get('id')

    response = client.get(
        CitizensURL.issue(issue_id),
        headers=citizen.headers
    )

    assert response.status_code == 200

    data = response.json().get('data')

    assert data.get('id') == issue_id
    assert data.get('citizen').get('name') == citizen.name
    assert data.get('title') == issue.title
    assert data.get('description') == issue.description
    assert data.get('category').get('name') == 'Pothole'

    media_file_urls = [media_file_data.get('file_url') for media_file_data in data.get('media')]

    for media_file_url in media_file_urls:
        response = client.get(
            media_file_url,
            headers=citizen.headers
        )

        assert response.status_code == 200
