from app.core.config import get_settings
from app.services.ai.base import AIProvider
from app.services.ai.configured_provider import ConfiguredLLMProvider
from app.services.ai.disabled_provider import DisabledAIProvider
from app.services.ai.fake_provider import FakeAIProvider


def get_ai_provider() -> AIProvider:
    """Factory method returning configured AI Provider instance."""
    settings = get_settings()

    if not settings.ai_enabled or settings.ai_provider == "disabled":
        return DisabledAIProvider()

    if settings.ai_provider == "fake" or settings.app_env == "test":
        return FakeAIProvider()

    return ConfiguredLLMProvider()
