from enum import Enum

from app.models import UserRole


class Permission(str, Enum):
    #issue
    CREATE_ISSUE = "create_issue"
    VIEW_ISSUE = "view_issue"
    ASSIGN_ISSUE = "assign_issue"
    REJECT_ISSUE = "reject_issue"
    CLOSE_ISSUE = "close_issue"
    RESOLVE_ISSUE = "resolve_issue"

    #department
    CREATE_DEPARTMENT = "create_department"
    VIEW_DEPARTMENT = "view_department"
    UPDATE_DEPARTMENT = "update_department"
    DELETE_DEPARTMENT = "delete_department"

    #category
    CREATE_CATEGORY = "create_category"
    VIEW_CATEGORY = "view_category"
    UPDATE_CATEGORY = "update_category"
    DELETE_CATEGORY = "delete_category"

    #ward
    CREATE_WARD = "create_ward"
    VIEW_WARD = "view_ward"
    UPDATE_WARD = "update_ward"
    DELETE_WARD = "delete_ward"

    #field team
    CREATE_FIELD_TEAM = "create_field_team"
    VIEW_FIELD_TEAM = "view_field_team"
    UPDATE_FIELD_TEAM = "update_field_team"
    DELETE_FIELD_TEAM = "delete_field_team"

    #field staff
    CREATE_FIELD_STAFF = "create_field_staff"
    VIEW_FIELD_STAFF = "view_field_staff"
    UPDATE_FIELD_STAFF = "update_field_staff"
    DELETE_FIELD_STAFF = "delete_field_staff"


ROLE_PERMISSIONS = {
    UserRole.CITIZEN: [
        Permission.CREATE_ISSUE,
        Permission.VIEW_ISSUE,
    ],
    UserRole.ORG_ADMIN: [
        Permission.CREATE_DEPARTMENT,
        Permission.VIEW_DEPARTMENT,
        Permission.UPDATE_DEPARTMENT,
        Permission.DELETE_DEPARTMENT,
        Permission.CREATE_CATEGORY,
        Permission.VIEW_CATEGORY,
        Permission.UPDATE_CATEGORY,
        Permission.DELETE_CATEGORY,
        Permission.CREATE_WARD,
        Permission.VIEW_WARD,
        Permission.UPDATE_WARD,
        Permission.DELETE_WARD,
        Permission.VIEW_ISSUE,
        Permission.VIEW_FIELD_TEAM,
        Permission.VIEW_FIELD_STAFF,
    ],
    UserRole.DEPARTMENT_STAFF: [
        Permission.VIEW_ISSUE,
        Permission.ASSIGN_ISSUE,
        Permission.REJECT_ISSUE,
        Permission.CLOSE_ISSUE,
        Permission.CREATE_FIELD_TEAM,
        Permission.VIEW_FIELD_TEAM,
        Permission.UPDATE_FIELD_TEAM,
        Permission.DELETE_FIELD_TEAM,
        Permission.CREATE_FIELD_STAFF,
        Permission.VIEW_FIELD_STAFF,
        Permission.UPDATE_FIELD_STAFF,
        Permission.DELETE_FIELD_STAFF,
    ],
    UserRole.FIELD_STAFF: [
        Permission.VIEW_ISSUE,
        Permission.RESOLVE_ISSUE,
    ],
}


def has_permissions(user_role: UserRole, permission: Permission) -> bool:
    return permission in ROLE_PERMISSIONS.get(user_role, set())
