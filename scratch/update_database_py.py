with open("apps/api/app/core/database.py", "r") as f:
    content = f.read()

target = """def create_database_engine(database_url: str) -> Engine:
    \"\"\"Creates a SQLAlchemy engine for the specified database URL.

    Engine creation does not establish an immediate network connection.
    pool_pre_ping=True ensures stale connections are detected before use.
    \"\"\"
    return create_engine(
        database_url,
        pool_pre_ping=True,
    )"""

replacement = """def create_database_engine(database_url: str) -> Engine:
    \"\"\"Creates a SQLAlchemy engine with connection pool hardening.

    pool_pre_ping=True ensures stale connections are detected before use.
    \"\"\"
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
    )"""

content = content.replace(target, replacement)

with open("apps/api/app/core/database.py", "w") as f:
    f.write(content)

print("apps/api/app/core/database.py updated")
