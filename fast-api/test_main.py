import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from main import app, get_db
from database import Base

# Utwórz bazę danych SQLite w pamięci
SQLALCHEMY_DATABASE_URL = "sqlite:///./test.db"
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Fixture dla FastAPI
@pytest.fixture(scope="module")
def test_client():
    # Wyczyść bazę danych przed testami
    Base.metadata.create_all(bind=engine)
    client = TestClient(app)

    # Zastąp funkcję `get_db` dla testów
    def override_get_db():
        db = TestingSessionLocal()
        try:
            yield db
        finally:
            db.close()

    app.dependency_overrides[get_db] = override_get_db

    yield client

    # Usuń tabelki po testach
    Base.metadata.drop_all(bind=engine)
