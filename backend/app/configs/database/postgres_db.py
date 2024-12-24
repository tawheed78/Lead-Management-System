import os
from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

load_dotenv()

POSTGRES_URL = os.getenv('POSTGRES_URL')

engine = create_engine(POSTGRES_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
BasePostgres = declarative_base()

def get_postgres_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def test_get_postgres_db():
    try:
        db = next(get_postgres_db())
        print("Database session created successfully.")
        db.close()
    except Exception as e:
        print(f"Failed to create a database session: {e}")
