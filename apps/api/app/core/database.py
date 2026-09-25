from typing import Generator
from sqlalchemy import create_engine, Engine
from sqlalchemy.orm import sessionmaker, Session
from app.core.config import get_settings


def create_database_engine(database_url: str) -> Engine:
    """Creates a SQLAlchemy engine with connection pool hardening.

    pool_pre_ping=True ensures stale connections are detected before use.
    """
    database_url = database_url.strip().strip('"').strip("'").strip()
    if database_url.startswith("postgresql://"):
        database_url = "postgresql+psycopg://" + database_url[len("postgresql://"):]
    elif database_url.startswith("postgres://"):
        database_url = "postgresql+psycopg://" + database_url[len("postgres://"):]

    connect_args = {}
    if database_url.startswith("sqlite"):
        connect_args["check_same_thread"] = False
        return create_engine(database_url, pool_pre_ping=True, connect_args=connect_args)

    return create_engine(
        database_url,
        pool_pre_ping=True,
        pool_recycle=3600,
        pool_size=10,
        max_overflow=20,
    )


# Primary application database engine initialized from application settings
engine = create_database_engine(get_settings().database_url)

# Canonical session factory configured for explicit transaction control
SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    expire_on_commit=False,
    bind=engine,
)


def get_db_session() -> Generator[Session, None, None]:
    """FastAPI dependency / generator yielding a managed database session.

    Guarantees session closure on completion or exception.
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# Alias for dependency injection shorthand
get_db = get_db_session
