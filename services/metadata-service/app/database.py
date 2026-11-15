import logging
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker
from app.config import settings

logger = logging.getLogger(__name__)

db_url = settings.DATABASE_URL
connect_args = {}
engine_kwargs = {"pool_pre_ping": True}

if db_url.startswith("sqlite"):
    connect_args = {"check_same_thread": False}
else:
    # High-concurrency connection pooling for PostgreSQL (50-100+ parallel users)
    engine_kwargs.update({
        "pool_size": 20,
        "max_overflow": 20,
        "pool_recycle": 1800,
        "pool_timeout": 30
    })

try:
    engine = create_engine(db_url, connect_args=connect_args, **engine_kwargs)
    with engine.connect() as conn:
        logger.info(f"Connected to primary database: {db_url.split('@')[-1]}")
except Exception as e:
    logger.warning(f"Could not connect to primary database ({e}). Falling back to local SQLite for isolated testing.")
    db_url = "sqlite:///./metadata_local.db"
    engine = create_engine(db_url, connect_args={"check_same_thread": False})

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
