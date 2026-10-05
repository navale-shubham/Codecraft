from fastapi import HTTPException

from app.models import ApiErrorResponse


class HTTPException(HTTPException):
    def __init__(self, status_code: int, error_code: str):
        super().__init__(
            status_code,
            ApiErrorResponse(
                success=False,
                error_code=error_code
            ).model_dump()
        )
