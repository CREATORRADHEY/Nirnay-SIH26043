from typing import Generator
from sqlalchemy import create_engine, Engine
from sqlalchemy.orm import sessionmaker, Session
from app.core.config import get_settings


def create_database_engine(database_url: str) -> Engine:
    """Creates a SQLAlchemy engine for the specified database URL.

    Engine creation does not establish an immediate network connection.
    pool_pre_ping=True ensures stale connections are detected before use.
    """
    return create_engine(
        database_url,
        pool_pre_ping=True,
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
