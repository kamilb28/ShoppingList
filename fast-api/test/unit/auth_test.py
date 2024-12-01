from auth import get_password_hash, verify_password, create_access_token, get_current_user
from datetime import timedelta
import pytest
from schemas.userrepo import UserCreate
from unittest.mock import MagicMock
from main import register_user
from fastapi import HTTPException

def test_get_password_hash():
    password = "mypassword"
    hashed_password = get_password_hash(password)
    assert hashed_password != password
    assert isinstance(hashed_password, str)

def test_verify_password():
    password = "mypassword"
    hashed_password = get_password_hash(password)
    assert verify_password(password, hashed_password) is True
    assert verify_password("wrongpassword", hashed_password) is False

def test_create_access_token():
    data = {"sub": "testuser"}
    token = create_access_token(data)
    assert token is not None
    assert isinstance(token, str)

def test_get_current_user_valid_token():
    data = {"sub": "testuser"}
    token = create_access_token(data)
    username = get_current_user(token=token)
    assert username == "testuser"

def test_get_current_user_invalid_token():
    with pytest.raises(Exception):
        get_current_user(token="invalidtoken")

def test_user_create_validation():
    user_data = {"username": "testuser", "password": "securepassword"}
    user = UserCreate(**user_data)
    assert user.username == "testuser"
    assert user.password == "securepassword"

def test_user_create_missing_fields():
    import pytest
    with pytest.raises(ValueError):
        UserCreate(username="testuser")  # Brak hasła

def test_get_current_user_invalid_token_exception():
    with pytest.raises(HTTPException) as exc_info:
        get_current_user(token="invalidtoken")
    assert exc_info.value.status_code == 401
    assert exc_info.value.detail == "Invalid token"

def test_register_user_success():
    mock_db = MagicMock()
    mock_db.query.return_value.filter.return_value.first.return_value = None
    mock_response = MagicMock()

    user_data = UserCreate(username="testuser", password="securepassword")
    register_user(user_data, db=mock_db, response=mock_response)

    assert mock_response.status_code == 201
    mock_db.add.assert_called_once()
    mock_db.commit.assert_called_once()

def test_register_user_duplicate():
    mock_db = MagicMock()
    mock_db.query.return_value.filter.return_value.first.return_value = "existing_user"
    mock_response = MagicMock()

    user_data = UserCreate(username="testuser", password="securepassword")

    with pytest.raises(HTTPException) as exc_info:
        register_user(user_data, db=mock_db, response=mock_response)

    assert exc_info.value.status_code == 409
    assert exc_info.value.detail == "Username already registered"
    mock_response.status_code = None
