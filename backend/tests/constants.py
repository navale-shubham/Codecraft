from dataclasses import dataclass, field
import uuid
import json
from io import BytesIO


class URL:
    BASE = "/api/v1"


class AuthURL:
    base = URL.BASE + "/auth"

    citizen_register = base + "/citizen/register"
    organization_register = base + "/organization/register"
    login = base + "/login"


class CitizensURL:
    base = URL.BASE + "/citizens"

    me = base + "/me"
    issues = base + "/issues"
    issue_media = lambda issue_id: CitizensURL.base + f"/issues/{issue_id}/media"
    issue = lambda issue_id: CitizensURL.base + f"/issues/{issue_id}"
    issue_categories = base + "/issue-categories"


class OrganizationsURL:
    base = URL.BASE + "/organizations"

    dashboard = base + "/dashboard"
    departments = base + "/departments"
    wards = base + "/wards"
    categories = base + "/categories"
    departments_staff = base + "/departments/staff"


class DepartmentURL:
    base = URL.BASE + "/departments"

    dashboard = base + "/dashboard"
    fieldstaff = base + "/fieldstaff"
    issues = base + "/issues"
    assign_issue = lambda issue_id: DepartmentURL.issues + f"/{issue_id}/assign"
    resolve_issue = lambda issue_id: DepartmentURL.issues + f"/{issue_id}/resolve"


class FieldStaffURL:
    base = URL.BASE + "/field-staff"

    issues = base + "/issues"
    resolve_issue = lambda issue_id: FieldStaffURL.base + f"/issues/{issue_id}/resolve"
    resolve_issue_media = lambda issue_id: FieldStaffURL.base + f'/issues/{issue_id}/resolve/media'


@dataclass
class User:
    name: str
    email: str
    password: str

    headers: dict[str, str] = field(default_factory=dict)

    def get_register_data(self) -> dict:
        return {
            "name": self.name,
            "email": self.email,
            "password": self.password,
        }

    def get_login_data(self) -> dict:
        return {
            "username": self.email,
            "password": self.password,
        }

    def set_header(self, key, value):
        self.headers[key] = value


@dataclass
class Issue:
    title: str
    description: str
    latitude: float
    longitude: float

    category: str = 'pothole'

    def get_data(self) -> dict:
        return {
            "title": self.title,
            "description": self.description,
            "latitude": self.latitude,
            "longitude": self.longitude,
        }
    
    @staticmethod
    def get_media_data():
        file_names = [
            'pothole-1.jpg',
            'pothole-2.jpg',
            'pothole-3.jpg',
            'pothole-4.jpg'
        ]
        files = []
        
        for file_name in file_names:
            with open(f'backend/tests/assets/{file_name}', 'rb') as file:
                file_data = file.read()
                files.append(('files', (file_name, file_data, 'image/jpeg')))

        return files
    
    @staticmethod
    def get_resolve_media_data():
        file_names = [
            'pothole-fixed-1.jpg',
            'pothole-fixed-2.jpg'
        ]
        files = []

        for file_name in file_names:
            with open(f'backend/tests/assets/{file_name}', 'rb') as file:
                file_data = file.read()
                files.append(('files', (file_name, file_data, 'image/jpeg')))

        return files


@dataclass
class Department:
    name: str
    id: uuid.UUID | None = None

    def get_data(self) -> dict:
        return {
            "name": self.name,
        }

    def get_data_with_id(self) -> dict:
        return {
            "id": self.id,
            "name": self.name,
        }


@dataclass
class Ward:
    name: str
    geo_boundary: dict
    id: uuid.UUID | None = None

    def get_data(self) -> dict:
        return {
            "name": self.name,
            "geo_boundary": self.geo_boundary,
        }

    def get_data_with_id(self) -> dict:
        return {
            "id": self.id,
            "name": self.name,
            "geo_boundary": self.geo_boundary,
        }


@dataclass
class Category:
    name: str
    department_id: uuid.UUID
    id: uuid.UUID | None = None

    def get_data(self) -> dict:
        return {
            "name": self.name,
            "department_id": self.department_id,
        }

    def get_data_with_id(self) -> dict:
        return {
            "id": self.id,
            "name": self.name,
            "department_id": self.department_id,
        }
