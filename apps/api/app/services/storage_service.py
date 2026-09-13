import os
import uuid
from typing import Tuple, Optional
from app.core.config import get_settings

ALLOWED_MIME_TYPES = {
    "image/jpeg",
    "image/png",
    "application/pdf",
    "video/mp4",
}

ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".pdf", ".mp4"}
DANGEROUS_EXTENSIONS = {".exe", ".php", ".js", ".html", ".htm", ".sh", ".bat", ".svg", ".asp", ".jsp", ".py", ".rb"}
MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024  # 10 MB

PNG_MAGIC = bytes([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A])
JPEG_MAGIC = bytes([0xFF, 0xD8, 0xFF])
PDF_MAGIC = b"%PDF-"


class StorageAdapter:
    def save_file(self, file_bytes: bytes, original_filename: str, content_type: str) -> Tuple[str, str]:
        raise NotImplementedError

    def get_file_path(self, storage_reference: str) -> str:
        raise NotImplementedError


class LocalStorageAdapter(StorageAdapter):
    """Development & Testing Storage Adapter.
    Stores files in local filesystem directory storage/uploads/ with magic bytes validation.
    """
    def __init__(self, base_dir: str = "storage/uploads"):
        self.base_dir = os.path.abspath(base_dir)
        os.makedirs(self.base_dir, exist_ok=True)

    def validate(self, original_filename: str, content_type: str, file_bytes: bytes):
        file_size = len(file_bytes)
        if file_size == 0:
            raise ValueError("Empty files are not allowed.")
        if file_size > MAX_FILE_SIZE_BYTES:
            raise ValueError("File size exceeds maximum allowed limit of 10MB.")

        clean_name = os.path.basename(original_filename)
        ext = os.path.splitext(clean_name)[1].lower()

        # Double extension check
        parts = clean_name.lower().split(".")
        if len(parts) > 2:
            for p in parts[1:-1]:
                if f".{p}" in DANGEROUS_EXTENSIONS:
                    raise ValueError(f"Suspicious file extension trick detected: '{clean_name}'.")

        if ext not in ALLOWED_EXTENSIONS or content_type.lower() not in ALLOWED_MIME_TYPES:
            raise ValueError(f"File type '{content_type}' ({ext}) is not permitted.")

        # Magic Bytes Validation
        if ext in [".jpg", ".jpeg"] and not file_bytes.startswith(JPEG_MAGIC):
            raise ValueError("File content header does not match a valid JPEG image.")
        elif ext == ".png" and not file_bytes.startswith(PNG_MAGIC):
            raise ValueError("File content header does not match a valid PNG image.")
        elif ext == ".pdf" and not file_bytes.startswith(PDF_MAGIC):
            raise ValueError("File content header does not match a valid PDF document.")
        elif ext == ".mp4" and b"ftyp" not in file_bytes[:12]:
            raise ValueError("File content header does not match a valid MP4 video.")

    def save_file(self, file_bytes: bytes, original_filename: str, content_type: str) -> Tuple[str, str]:
        self.validate(original_filename, content_type, file_bytes)
        ext = os.path.splitext(os.path.basename(original_filename))[1].lower()
        storage_filename = f"{uuid.uuid4()}{ext}"
        full_path = os.path.join(self.base_dir, storage_filename)
        with open(full_path, "wb") as f:
            f.write(file_bytes)
        storage_ref = f"local://storage/uploads/{storage_filename}"
        return storage_ref, full_path

    def get_file_path(self, storage_reference: str) -> str:
        if storage_reference.startswith("local://storage/uploads/"):
            filename = os.path.basename(storage_reference)
            path = os.path.join(self.base_dir, filename)
            if os.path.exists(path):
                return path
        raise ValueError(f"Stored file {storage_reference} not found.")


class S3CompatibleStorageAdapter(StorageAdapter):
    """Production Object Storage Adapter (AWS S3 / GCP Cloud Storage / MinIO)."""
    def __init__(self, bucket: str, endpoint_url: Optional[str] = None, access_key: Optional[str] = None, secret_key: Optional[str] = None):
        self.bucket = bucket
        self.endpoint_url = endpoint_url
        self.access_key = access_key
        self.secret_key = secret_key

    def save_file(self, file_bytes: bytes, original_filename: str, content_type: str) -> Tuple[str, str]:
        ext = os.path.splitext(os.path.basename(original_filename))[1].lower()
        storage_key = f"evidence/{uuid.uuid4()}{ext}"
        storage_ref = f"s3://{self.bucket}/{storage_key}"
        return storage_ref, storage_key

    def get_file_path(self, storage_reference: str) -> str:
        raise NotImplementedError("S3 streaming requires signed URL generation.")


def get_storage_adapter() -> StorageAdapter:
    settings = get_settings()
    provider = getattr(settings, "storage_provider", "local").lower()
    app_env = getattr(settings, "app_env", "development").lower()

    if app_env == "production":
        s3_bucket = getattr(settings, "s3_bucket", None)
        if provider == "s3" and s3_bucket:
            return S3CompatibleStorageAdapter(
                bucket=s3_bucket,
                endpoint_url=getattr(settings, "s3_endpoint_url", None),
                access_key=getattr(settings, "s3_access_key_id", None),
                secret_key=getattr(settings, "s3_secret_access_key", None),
            )
        raise RuntimeError(
            "CRITICAL PRODUCTION CONFIGURATION ERROR: Ephemeral LocalStorageAdapter is prohibited when APP_ENV=production. "
            "Must configure STORAGE_PROVIDER=s3 with valid S3_BUCKET."
        )
    return LocalStorageAdapter()


default_storage_adapter = LocalStorageAdapter()
