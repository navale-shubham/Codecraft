from dataclasses import dataclass
import io


class URL:
    BASE = "/api/v1"


class AuthURL:
    login = URL.BASE + "/auth/login"
    register = URL.BASE + "/auth/register"
    

class CitizenURL:
    me = URL.BASE + "/citizens/me"
    issues = URL.BASE + "/citizens/issues"
    issues_with_id = lambda issue_id: URL.BASE + f"/citizens/issues/{issue_id}"
    issues_media = lambda issue_id: URL.BASE + f"/citizens/issues/{issue_id}/media"


@dataclass
class Headers:
    authorization: str = ""

    def get_headers(self) -> dict:
        return {
            "Authorization": self.authorization
        }


@dataclass
class User:
    name: str
    email: str
    password: str

    headers: Headers | None = None

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
    
    def set_headers(self, token_type: str, access_token: str):
        self.headers = Headers(authorization=f"{token_type} {access_token}")
    
    def get_headers(self) -> dict:
        if self.headers is None:
            raise Exception("User is not logged in.")
        return self.headers.get_headers()


class Citizen(User):
    role: str = "CITIZEN"

    def get_register_data(self) -> dict:
        return {
            "name": self.name,
            "email": self.email,
            "password": self.password,
            "role": self.role,
        }


@dataclass
class LocationData:
    latitude: float
    longitude: float

    def get_location_data(self) -> dict:
        return {
            "latitude": self.latitude,
            "longitude": self.longitude,
        }


@dataclass
class IssueData:
    title: str
    description: str
    category_id: str
    location: LocationData
    created_at: str
    
    def get_issue_data(self) -> dict:
        return {
            "title": self.title,
            "description": self.description,
            "category_id": self.category_id,
            "location": self.location.get_location_data(),
            "created_at": self.created_at,
        }
    
    def get_media_data(self) -> dict:
        file = io.BytesIO(b"\xFF\xD8\xFF\xE0\x00\x10JFIF\x00\x01\x01\x01\x00H\x00H\x00")
        file.name = "test.jpg"
        return {
            "file": file
        }