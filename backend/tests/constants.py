from dataclasses import dataclass, field
import io
import uuid


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
class Location:
    latitude: float
    longitude: float

    def get_data(self) -> dict:
        return {
            "latitude": self.latitude,
            "longitude": self.longitude,
        }


@dataclass
class Issue:
    title: str
    description: str
    category_id: str
    location: Location

    def get_data(self) -> dict:
        return {
            "title": self.title,
            "description": self.description,
            "category_id": self.category_id,
            "location": self.location.get_data(),
        }
    
    @staticmethod
    def get_media_data() -> dict:
        file = io.BytesIO(b"\xFF\xD8\xFF\xE0\x00\x10JFIF\x00\x01\x01\x01\x00H\x00H\x00")
        file.name = "test_image.jpg"
        return {
            "file": file
        }


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
