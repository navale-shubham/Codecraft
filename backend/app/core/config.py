import os

class Settings:
    PROJECT_NAME: str = "CivicPulse - Civic Issue Reporting & Resolution API"
    VERSION: str = "0.1.0"
    
    # Database
    DATABASE_URL: str = os.getenv("DATABASE_URL", "postgresql://postgres:2833@localhost:5432/civicpulse")
    
    # Security & Auth
    SECRET_KEY: str = os.getenv("SECRET_KEY", "a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "1440")) # 24 hours
    
    # CORS
    CORS_ORIGINS: list[str] = ["*"]

settings = Settings()
