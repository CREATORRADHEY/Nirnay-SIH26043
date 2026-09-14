from functools import lru_cache
import json
from typing import Any, List, Literal, Union

from pydantic import Field, field_validator, model_validator
from pydantic_settings import BaseSettings, SettingsConfigDict

AppEnvironment = Literal["development", "test", "staging", "production"]


class Settings(BaseSettings):
    """Application Settings for NIRNAY API.

    Loads configuration from environment variables and optional local .env file.
    Default DATABASE_URL matches local PostgreSQL Docker service configuration.
    """

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )

    app_name: str = Field(default="nirnay-api", validation_alias="APP_NAME")
    app_env: AppEnvironment = Field(
        default="development", validation_alias="APP_ENV"
    )
    debug: bool = Field(default=False, validation_alias="DEBUG")
    database_url: str = Field(
        default="postgresql+psycopg://postgres:postgres@127.0.0.1:5432/nirnay",
        validation_alias="DATABASE_URL",
        description="PostgreSQL connection string using psycopg3 driver",
    )
    demo_mode: bool = Field(default=True, validation_alias="DEMO_MODE")
    cors_origins: Union[List[str], str] = Field(
        default_factory=list, validation_alias="CORS_ORIGINS"
    )

    # AI Assistance Settings
    ai_enabled: bool = Field(default=False, validation_alias="AI_ENABLED")
    ai_provider: str = Field(default="disabled", validation_alias="AI_PROVIDER")
    ai_model: str = Field(default="gemini-2.5-flash", validation_alias="AI_MODEL")
    ai_timeout_seconds: int = Field(default=15, validation_alias="AI_TIMEOUT_SECONDS")
    ai_api_key: Union[str, None] = Field(default=None, validation_alias="AI_API_KEY")

    @field_validator("cors_origins", mode="before")
    @classmethod
    def parse_cors_origins(cls, v: Any) -> List[str]:
        if v is None or v == "":
            return []
        if isinstance(v, str):
            v_str = v.strip()
            if not v_str:
                return []
            if v_str.startswith("[") and v_str.endswith("]"):
                try:
                    parsed = json.loads(v_str)
                    if isinstance(parsed, list):
                        return [str(item).strip() for item in parsed if item]
                except Exception:
                    pass
            return [item.strip() for item in v_str.split(",") if item.strip()]
        if isinstance(v, list):
            return [str(item).strip() for item in v if item]
        return []

    @model_validator(mode="after")
    def validate_production_failsafes(self) -> "Settings":
        """Enforces production fail-safes when APP_ENV is set to 'production'."""
        if self.app_env == "production":
            if self.demo_mode:
                raise ValueError(
                    "DEMO_MODE cannot be enabled (true) in production environment."
                )
            default_local_urls = [
                "postgresql+psycopg://postgres:postgres@localhost:5432/nirnay",
                "postgresql://postgres:postgres@localhost:5432/nirnay",
            ]
            if (
                self.database_url in default_local_urls
                or "localhost" in self.database_url
                or "127.0.0.1" in self.database_url
            ):
                raise ValueError(
                    "Default or local development DATABASE_URL cannot be used in production environment."
                )
        return self


@lru_cache
def get_settings() -> Settings:
    """Returns a cached instance of application settings.

    Use get_settings.cache_clear() in tests to reset cached settings after environment mutations.
    """
    return Settings()
