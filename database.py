import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

def _normalize_database_url(url: str) -> str:
    if url.startswith("postgres://"):
        return url.replace("postgres://", "postgresql://", 1)
    return url


def _create_engine():
    url = os.getenv("DATABASE_URL")
    if url:
        url = _normalize_database_url(url)
        return create_engine(url), url

    local_pg = "postgresql://energy_user:energy_password@localhost:5432/energy_db"
    try:
        engine = create_engine(local_pg)
        with engine.connect():
            pass
        return engine, local_pg
    except Exception:
        sqlite_url = "sqlite:///./energy_app.db"
        return create_engine(sqlite_url, connect_args={"check_same_thread": False}), sqlite_url


engine, DATABASE_URL = _create_engine()

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# Dependency to get DB session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
