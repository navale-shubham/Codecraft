from sqlmodel import Session, create_engine

from .config import settings


DATABASE_URL = settings.DATABASE_URL

engine = create_engine(DATABASE_URL, pool_pre_ping=True)


def get_session():
    with Session(engine) as session, session.begin():
        yield session
