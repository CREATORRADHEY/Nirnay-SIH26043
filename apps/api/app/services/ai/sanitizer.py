import re
from typing import Any, Dict, List

# Regex patterns for PII redaction
EMAIL_REGEX = re.compile(r"[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+")
PHONE_REGEX = re.compile(r"\b(?:\+91[\-\s]?)?[6-9]\d{9}\b")
TOKEN_REGEX = re.compile(r"\b(?:bearer|token|session|key)[=:\s]+[A-Za-z0-9_\-\.\=]{16,}\b", re.IGNORECASE)

# Prohibited prompt injection attack markers
PROHIBITED_INJECTION_KEYWORDS = [
    "ignore previous instructions",
    "ignore all instructions",
    "system prompt",
    "reveal prompt",
    "become root",
    "bypass rbac",
    "set pilot_ready",
    "mark validated",
]


class AISanitizer:
    @staticmethod
    def redact_pii(text: str) -> str:
        """Strips PII (emails, phone numbers, auth tokens) from prompt input."""
        if not text:
            return ""
        cleaned = EMAIL_REGEX.sub("[REDACTED_EMAIL]", text)
        cleaned = PHONE_REGEX.sub("[REDACTED_PHONE]", cleaned)
        cleaned = TOKEN_REGEX.sub("[REDACTED_TOKEN]", cleaned)
        return cleaned

    @staticmethod
    def wrap_untrusted_input(text: str) -> str:
        """Wraps untrusted user text in data isolation boundaries."""
        sanitized = AISanitizer.redact_pii(text)
        return f"<untrusted_user_data>\n{sanitized}\n</untrusted_user_data>"

    @staticmethod
    def is_adversarial_prompt(text: str) -> bool:
        """Detects explicit prompt injection attack vectors."""
        lower = text.lower()
        return any(keyword in lower for keyword in PROHIBITED_INJECTION_KEYWORDS)

    @staticmethod
    def sanitize_output(output_text: str) -> str:
        """Verifies output text does not inject unauthorized command state overrides."""
        if not output_text:
            return ""
        # Remove any hallucinated state commands or code block injection
        cleaned = output_text.replace("PILOT_READY", "REVIEW_REQUIRED")
        cleaned = cleaned.replace("VALIDATED", "NOT_REVIEWED")
        return cleaned
