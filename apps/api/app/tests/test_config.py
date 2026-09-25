import os
import unittest
from unittest.mock import patch
from pydantic import ValidationError

from app.core.config import Settings, get_settings


class TestConfig(unittest.TestCase):

    def setUp(self) -> None:
        get_settings.cache_clear()

    def tearDown(self) -> None:
        get_settings.cache_clear()

    def test_default_settings_construction(self) -> None:
        with patch.dict(os.environ, {}, clear=True):
            settings = Settings(_env_file=None)
            self.assertEqual(settings.app_name, "nirnay-api")
            self.assertEqual(settings.app_env, "development")
            self.assertFalse(settings.debug)
            self.assertTrue(settings.demo_mode)
            self.assertIn("postgresql+psycopg://", settings.database_url)
            self.assertEqual(settings.cors_origins, [])

    def test_app_env_accepted_environments(self) -> None:
        for env_name in ["development", "test", "staging"]:
            with patch.dict(os.environ, {"APP_ENV": env_name}, clear=True):
                settings = Settings()
                self.assertEqual(settings.app_env, env_name)

        # Production with valid non-local config
        prod_env = {
            "APP_ENV": "production",
            "DEMO_MODE": "false",
            "DATABASE_URL": "postgresql+psycopg://prod_user:secure_pass@prod-db.internal:5432/nirnay_prod",
        }
        with patch.dict(os.environ, prod_env, clear=True):
            settings = Settings()
            self.assertEqual(settings.app_env, "production")

    def test_app_env_invalid_rejected(self) -> None:
        with patch.dict(os.environ, {"APP_ENV": "invalid_environment"}, clear=True):
            with self.assertRaises(ValidationError):
                Settings()

    def test_production_failsafe_demo_mode_rejected(self) -> None:
        prod_demo_env = {
            "APP_ENV": "production",
            "DEMO_MODE": "true",
            "DATABASE_URL": "postgresql+psycopg://prod_user:secure_pass@prod-db.internal:5432/nirnay_prod",
        }
        with patch.dict(os.environ, prod_demo_env, clear=True):
            with self.assertRaises(ValidationError) as cm:
                Settings()
            self.assertIn("DEMO_MODE cannot be enabled", str(cm.exception))

    def test_production_failsafe_local_db_rejected(self) -> None:
        prod_local_db_env = {
            "APP_ENV": "production",
            "DEMO_MODE": "false",
            "DATABASE_URL": "postgresql+psycopg://postgres:postgres@localhost:5432/nirnay",
        }
        with patch.dict(os.environ, prod_local_db_env, clear=True):
            with self.assertRaises(ValidationError) as cm:
                Settings()
            self.assertIn("local development DATABASE_URL", str(cm.exception))

    def test_env_var_override(self) -> None:
        env_vars = {
            "APP_NAME": "nirnay-staging-api",
            "APP_ENV": "staging",
            "DEBUG": "true",
            "DEMO_MODE": "false",
            "DATABASE_URL": "postgresql+psycopg://user:pass@staging-db:5432/nirnay_staging",
            "CORS_ORIGINS": "https://staging.nirnay.gov.in, https://admin.nirnay.gov.in",
        }
        with patch.dict(os.environ, env_vars, clear=True):
            get_settings.cache_clear()
            settings = get_settings()

            self.assertEqual(settings.app_name, "nirnay-staging-api")
            self.assertEqual(settings.app_env, "staging")
            self.assertTrue(settings.debug)
            self.assertFalse(settings.demo_mode)
            self.assertEqual(
                settings.database_url,
                "postgresql+psycopg://user:pass@staging-db:5432/nirnay_staging",
            )
            self.assertEqual(
                settings.cors_origins,
                ["https://staging.nirnay.gov.in", "https://admin.nirnay.gov.in"],
            )

    def test_boolean_config_parsing(self) -> None:
        with patch.dict(os.environ, {"DEBUG": "1", "DEMO_MODE": "0"}, clear=True):
            settings = Settings()
            self.assertTrue(settings.debug)
            self.assertFalse(settings.demo_mode)

    def test_cors_origins_parsing_variations(self) -> None:
        # Empty string
        with patch.dict(os.environ, {"CORS_ORIGINS": ""}, clear=True):
            self.assertEqual(Settings().cors_origins, [])

        # Single string
        with patch.dict(os.environ, {"CORS_ORIGINS": "http://localhost:3000"}, clear=True):
            self.assertEqual(Settings().cors_origins, ["http://localhost:3000"])

        # Comma separated
        with patch.dict(
            os.environ,
            {"CORS_ORIGINS": "http://localhost:3000,http://127.0.0.1:3000"},
            clear=True,
        ):
            self.assertEqual(
                Settings().cors_origins,
                ["http://localhost:3000", "http://127.0.0.1:3000"],
            )

        # JSON array string
        with patch.dict(
            os.environ,
            {"CORS_ORIGINS": '["http://localhost:3000"]'},
            clear=True,
        ):
            self.assertEqual(Settings().cors_origins, ["http://localhost:3000"])

    def test_settings_cache_clear(self) -> None:
        with patch.dict(os.environ, {"APP_NAME": "initial-app"}, clear=True):
            get_settings.cache_clear()
            initial = get_settings()
            self.assertEqual(initial.app_name, "initial-app")

        with patch.dict(os.environ, {"APP_NAME": "updated-app"}, clear=True):
            cached = get_settings()
            self.assertEqual(cached.app_name, "initial-app")

            get_settings.cache_clear()
            updated = get_settings()
            self.assertEqual(updated.app_name, "updated-app")

    def test_cookie_security_defaults(self) -> None:
        # Development mode defaults to secure=False
        with patch.dict(os.environ, {"APP_ENV": "development"}, clear=True):
            settings = Settings()
            self.assertFalse(settings.is_cookie_secure)

        # Production mode defaults to secure=True
        prod_env = {
            "APP_ENV": "production",
            "DEMO_MODE": "false",
            "DATABASE_URL": "postgresql+psycopg://user:pass@prod-db:5432/nirnay",
        }
        with patch.dict(os.environ, prod_env, clear=True):
            settings = Settings()
            self.assertTrue(settings.is_cookie_secure)

    def test_release_sha_defaults(self) -> None:
        with patch.dict(os.environ, {}, clear=True):
            settings = Settings(_env_file=None)
            self.assertEqual(settings.release_sha, "unknown")

        with patch.dict(os.environ, {"NIRNAY_RELEASE_SHA": "abc123def456"}, clear=True):
            settings = Settings()
            self.assertEqual(settings.release_sha, "abc123def456")

    def test_storage_adapter_production_fail_closed(self) -> None:
        from app.services.storage_service import get_storage_adapter, S3CompatibleStorageAdapter

        prod_local_storage = {
            "APP_ENV": "production",
            "DEMO_MODE": "false",
            "DATABASE_URL": "postgresql+psycopg://user:pass@prod-db:5432/nirnay",
            "STORAGE_PROVIDER": "local",
        }
        with patch.dict(os.environ, prod_local_storage, clear=True):
            get_settings.cache_clear()
            with self.assertRaises(RuntimeError) as cm:
                get_storage_adapter()
            self.assertIn("CRITICAL PRODUCTION CONFIGURATION ERROR", str(cm.exception))

        prod_s3_storage = {
            "APP_ENV": "production",
            "DEMO_MODE": "false",
            "DATABASE_URL": "postgresql+psycopg://user:pass@prod-db:5432/nirnay",
            "STORAGE_PROVIDER": "s3",
            "S3_BUCKET": "nirnay-evidence-prod",
        }
        with patch.dict(os.environ, prod_s3_storage, clear=True):
            get_settings.cache_clear()
            adapter = get_storage_adapter()
            self.assertIsInstance(adapter, S3CompatibleStorageAdapter)
            self.assertEqual(adapter.bucket, "nirnay-evidence-prod")

    def test_database_url_whitespace_and_scheme_sanitization(self) -> None:
        raw_urls = [
            'postgresql://user:pass@host:5432/postgres\n',
            ' postgresql://user:pass@host:5432/postgres \n',
            '"postgresql://user:pass@host:5432/postgres"\n',
            'postgres://user:pass@host:5432/postgres\r\n',
        ]
        for url in raw_urls:
            with patch.dict(os.environ, {"DATABASE_URL": url}, clear=True):
                get_settings.cache_clear()
                settings = get_settings()
                self.assertEqual(
                    settings.database_url,
                    "postgresql+psycopg://user:pass@host:5432/postgres",
                )


if __name__ == "__main__":
    unittest.main()
