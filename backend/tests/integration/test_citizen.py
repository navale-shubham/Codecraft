from tests.constants import (
    CitizensURL, Location, Issue
)
from tests.utils import (
    setup_citizen,
    setup_organization,
    setup_department,
    setup_ward,
    setup_issue_category,
    get_issue_categories
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


def test_citizen_issue(client):
    organization_admin = setup_organization(client)
    department = setup_department(client, organization_admin)
    ward = setup_ward(client, organization_admin)
    category = setup_issue_category(client, organization_admin, department)

    citizen = setup_citizen(client)
    category = get_issue_categories(client, citizen)[0]

    issue = Issue(
        title="Test Issue",
        description="Test Description",
        category_id=category['id'],
        location=Location(
            latitude=19.577123,
            longitude=74.445428,
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

    response = client.post(
        CitizensURL.issue_media(issue_id),
        headers=citizen.headers,
        files=issue.get_media_data()
    )

    response = client.post(
        CitizensURL.issue_media(issue_id),
        headers=citizen.headers,
        files=issue.get_media_data()
    )

    assert response.status_code == 201

    response = client.get(
        CitizensURL.issue(issue_id),
        headers=citizen.headers
    )

    assert response.status_code == 200

    data = response.json().get('data')

    assert data.get('id') == issue_id
    assert data.get('citizen').get('name') == citizen.name
    assert data.get('category').get('id') == category['id']
    assert data.get('title') == issue.title
    assert data.get('description') == issue.description
    
    media_file_urls = [media_file_data.get('file_url') for media_file_data in data.get('media')]

    for media_file_url in media_file_urls:
        response = client.get(
            media_file_url,
            headers=citizen.headers
        )

        assert response.status_code == 200
