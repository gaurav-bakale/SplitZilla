from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session
from app.config import get_settings

settings = get_settings()

Base = declarative_base()

class DatabaseManager:
    _instance = None
    _engine = None
    _session_local = None
    
    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(DatabaseManager, cls).__new__(cls)
            cls._engine = create_engine(
                settings.database_url,
                connect_args={"check_same_thread": False} if "sqlite" in settings.database_url else {}
            )
            cls._session_local = sessionmaker(autocommit=False, autoflush=False, bind=cls._engine)
        return cls._instance
    
    def get_engine(self):
        return self._engine
    
    def get_session(self) -> Session:
        return self._session_local()
    
    def create_tables(self):
        Base.metadata.create_all(bind=self._engine)

def get_db():
    db_manager = DatabaseManager()
    db = db_manager.get_session()
    try:
        yield db
    finally:
        db.close()
