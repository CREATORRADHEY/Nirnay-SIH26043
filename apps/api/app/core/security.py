import hashlib
import hmac
import secrets
from typing import Optional
from argon2 import PasswordHasher
from argon2.exceptions import VerifyMismatchError, VerificationError

ph = PasswordHasher()

def hash_password(password: str) -> str:
    return ph.hash(password)

def verify_password(password: str, hashed_password: str) -> tuple[bool, bool]:
    if hashed_password.startswith("$argon2"):
        try:
            ph.verify(hashed_password, password)
            needs_rehash = ph.check_needs_rehash(hashed_password)
            return True, needs_rehash
        except (VerifyMismatchError, VerificationError):
            return False, False

    if hashed_password.startswith("pbkdf2:"):
        try:
            parts = hashed_password.split(":")
            if len(parts) == 3:
                salt = bytes.fromhex(parts[1])
                expected = bytes.fromhex(parts[2])
                calc = hashlib.pbkdf2_hmac("sha256", password.encode("utf-8"), salt, 100000)
                if hmac.compare_digest(expected, calc):
                    return True, True
        except Exception:
            pass

    return False, False

def generate_secure_token() -> str:
    return secrets.token_hex(32)

def hash_token(token: str) -> str:
    return hashlib.sha256(token.encode("utf-8")).hexdigest()
