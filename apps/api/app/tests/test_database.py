import unittest
from sqlalchemy.engine import Engine
from sqlalchemy.orm import Session, sessionmaker
from sqlalchemy import MetaData

from app.core.database import create_database_engine, SessionLocal, get_db_session, get_db
from app.models.base import Base


class TestDatabase(unittest.TestCase):

    def test_database_engine_construction(self) -> None:
        url = "postgresql+psycopg://postgres:postgres@127.0.0.1:5432/nirnay"
        engine = create_database_engine(url)
        self.assertIsInstance(engine, Engine)
        self.assertEqual(engine.url.drivername, "postgresql+psycopg")
        self.assertEqual(engine.url.host, "127.0.0.1")
        self.assertEqual(engine.url.port, 5432)
        self.assertEqual(engine.url.database, "nirnay")

    def test_session_factory_configuration(self) -> None:
        self.assertIsInstance(SessionLocal, sessionmaker)
        self.assertFalse(SessionLocal.kw.get("autocommit", True))
        self.assertFalse(SessionLocal.kw.get("autoflush", True))
        self.assertFalse(SessionLocal.kw.get("expire_on_commit", True))

    def test_get_db_session_lifecycle(self) -> None:
        generator = get_db_session()
        session = next(generator)
        self.assertIsInstance(session, Session)
        self.assertTrue(session.is_active)

        # Trigger completion cleanup
        try:
            next(generator)
        except StopIteration:
            pass

    def test_get_db_session_exception_cleanup(self) -> None:
        generator = get_db_session()
        session = next(generator)
        self.assertTrue(session.is_active)

        # Simulate exception during request handling
        try:
            generator.throw(RuntimeError("Simulated request failure"))
        except RuntimeError:
            pass

    def test_get_db_alias(self) -> None:
        self.assertEqual(get_db, get_db_session)

    def test_declarative_base_metadata(self) -> None:
        self.assertTrue(hasattr(Base, "metadata"))
        self.assertIsInstance(Base.metadata, MetaData)
        self.assertTrue(isinstance(Base.metadata.tables, dict))



if __name__ == "__main__":
    unittest.main()
