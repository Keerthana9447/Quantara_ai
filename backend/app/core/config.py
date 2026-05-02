"""
Quantara AI — Configuration
Python 3.14.2 compatible (uses built-in type hints throughout)
"""
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    APP_NAME: str = "Quantara AI"
    DEBUG: bool = False
    VERSION: str = "1.0.0"

    # SQLite by default — zero config, works instantly
    # Switch to PostgreSQL: postgresql+asyncpg://user:pass@host/db
    DATABASE_URL: str = "sqlite+aiosqlite:///./quantara.db"

    SECRET_KEY: str = "quantara-dev-secret-change-in-production-min32chars!"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 24 hours

    OPENAI_API_KEY: str = ""

    ALLOWED_ORIGINS: list[str] = [
        "http://localhost:3000",
        "http://localhost:3001",
        "http://127.0.0.1:3000",
    ]

    class Config:
        env_file = ".env"
        extra = "ignore"


settings = Settings()
