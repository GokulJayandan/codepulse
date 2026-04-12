from pydantic_settings import BaseSettings, SettingsConfigDict
from functools import lru_cache


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_prefix="CODEPULSE_",
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
    )

    # Database
    database_url: str = "postgresql+asyncpg://postgres:postgres@localhost:5432/codepulse"

    # GitHub
    github_webhook_secret: str = "changeme"
    github_token: str = ""

    # Redis
    redis_url: str = "redis://localhost:6379/0"

    # Algorithm
    algorithm_sensitivity: float = 1.0
    monte_carlo_simulations: int = 1000
    risk_recalculation_interval_seconds: int = 300

    # App
    debug: bool = False
    cors_origins: list[str] = ["*"]


@lru_cache()
def get_settings() -> Settings:
    return Settings()
