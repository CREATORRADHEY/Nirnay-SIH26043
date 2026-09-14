with open("apps/api/app/models/organization.py", "r") as f:
    content = f.read()

target = """    status: Mapped[str] = mapped_column(String(50), nullable=False, default="ACTIVE", index=True)
    is_active: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True, index=True)"""

replacement = """    status: Mapped[str] = mapped_column(String(50), nullable=False, default="ACTIVE", index=True)
    status_rationale: Mapped[Optional[str]] = mapped_column(sa.Text, nullable=True) if hasattr(sa, 'Text') else mapped_column(String, nullable=True)
    status_updated_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True, index=True)"""

if "import sqlalchemy as sa" not in content and "from sqlalchemy import Text" not in content:
    content = content.replace("from sqlalchemy import Boolean, DateTime, String", "from sqlalchemy import Boolean, DateTime, String, Text")
    replacement = """    status: Mapped[str] = mapped_column(String(50), nullable=False, default="ACTIVE", index=True)
    status_rationale: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    status_updated_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True, index=True)"""

content = content.replace(target, replacement)

with open("apps/api/app/models/organization.py", "w") as f:
    f.write(content)

print("apps/api/app/models/organization.py updated")
