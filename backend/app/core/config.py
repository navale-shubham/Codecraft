"""
Core Configuration & Environment Settings for CivicPulse Backend.
"""
import os

class Settings:
    PROJECT_NAME: str = "CivicPulse - Civic Issue Reporting & Resolution API"
    VERSION: str = "0.1.0"
    
    # Database
    DATABASE_URL: str = os.getenv(
        "DATABASE_URL"
    )
    
    # Security & Auth
    SECRET_KEY: str = os.getenv("SECRET_KEY")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "1440")) # 24 hours
    
    # CORS
    CORS_ORIGINS: list[str] = ["*"]

settings = Settings()
