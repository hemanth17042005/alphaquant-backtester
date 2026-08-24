import pytest
import sqlite3
from backend.app.auth.database import (
    get_db_connection, init_auth_db, create_user, get_user_by_email,
    get_user_by_id, authenticate_user, create_email_otp, verify_email_otp,
    mark_user_verified, hash_password, verify_password
)
from backend.app.auth.security import create_access_token, verify_access_token
from backend.app.auth.mailer import send_verification_email

@pytest.fixture(autouse=True)
def setup_db():
    init_auth_db()
    yield

def test_password_hashing():
    pwd = "InstitutionalSecretPassword2026!"
    hashed, salt = hash_password(pwd)
    assert hashed is not None
    assert salt is not None
    assert verify_password(pwd, hashed, salt) is True
    assert verify_password("WrongPassword!", hashed, salt) is False

def test_jwt_token_lifecycle():
    user_data = {
        "id": "uuid-999-quant",
        "email": "lead.quant@alphaquant.io",
        "full_name": "Lead Quant",
        "tier": "PRO_QUANT"
    }
    token = create_access_token(user_data, expires_in_seconds=3600)
    assert token is not None
    
    payload = verify_access_token(token)
    assert payload is not None
    assert payload["user_id"] == "uuid-999-quant"
    assert payload["email"] == "lead.quant@alphaquant.io"
    assert payload["tier"] == "PRO_QUANT"

def test_user_creation_and_auth():
    test_email = "test.trader.alpha@example.com"
    
    # Clean up prior test data
    conn = get_db_connection()
    conn.execute("DELETE FROM users WHERE email = ?", (test_email,))
    conn.execute("DELETE FROM email_otps WHERE email = ?", (test_email,))
    conn.commit()
    conn.close()
    
    # 1. Create unverified user
    user = create_user(test_email, "Alpha Trader", "MySecurePass123!", is_verified=False)
    assert user is not None
    assert user["email"] == test_email
    assert user["full_name"] == "Alpha Trader"
    assert user["is_verified"] is False
    
    # 2. Authenticate unverified user
    auth_user = authenticate_user(test_email, "MySecurePass123!")
    assert auth_user is not None
    assert auth_user["is_verified"] is False
    
    # 3. Mark verified
    mark_user_verified(test_email)
    user_verified = get_user_by_email(test_email)
    assert user_verified["is_verified"] is True
    
    # 4. Wrong password fails
    bad_auth = authenticate_user(test_email, "InvalidPassword")
    assert bad_auth is None

def test_email_otp_generation_and_verification():
    test_email = "otp.tester@example.com"
    
    # Generate OTP
    otp_code = create_email_otp(test_email, "REGISTRATION")
    assert len(otp_code) == 6
    assert otp_code.isdigit()
    
    # Mailer dispatch simulation
    mail_res = send_verification_email(test_email, otp_code, "OTP Tester")
    assert mail_res["success"] is True
    assert "demo_code" in mail_res
    
    # Verify with invalid OTP
    assert verify_email_otp(test_email, "000000") is False
    
    # Verify with valid OTP
    assert verify_email_otp(test_email, otp_code) is True
    
    # Ensure one-time use (cannot be reused)
    assert verify_email_otp(test_email, otp_code) is False
