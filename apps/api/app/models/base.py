from sqlalchemy.orm import DeclarativeBase


class Base(DeclarativeBase):
    """Declarative Base class for all SQLAlchemy ORM models in NIRNAY.

    Does not define domain fields, mixins, or automatic table creation.
    """

    pass
