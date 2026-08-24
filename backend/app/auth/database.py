import sqlite3
import hashlib
import os
import json
import uuid
from datetime import datetime, timedelta
from typing import Dict, Any, Optional, Tuple

from backend.app.config import DATA_CACHE_DIR

DB_PATH = DATA_CACHE_DIR / "users.db"

def get_db_connection() -> sqlite3.Connection:
    """Create and return a SQLite database connection with row factory."""
    DATA_CACHE_DIR.mkdir(parents=True, exist_ok=True)
    conn = sqlite3.connect(str(DB_PATH))
    conn.row_factory = sqlite3.Row
    return conn

def init_auth_db() -> None:
    """Initialize database tables for users, OTP verification codes, and user profiles."""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # 1. Users Table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS users (
            id TEXT PRIMARY KEY,
            email TEXT UNIQUE NOT NULL,
            full_name TEXT NOT NULL,
            password_hash TEXT NOT NULL,
            salt TEXT NOT NULL,
            is_verified INTEGER DEFAULT 0,
            tier TEXT DEFAULT 'PRO_QUANT',
            created_at TEXT NOT NULL,
            last_login TEXT
        )
    """)
    
    # 2. Email OTP Verification Codes Table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS email_otps (
            id TEXT PRIMARY KEY,
            email TEXT NOT NULL,
            otp_code TEXT NOT NULL,
            otp_type TEXT DEFAULT 'REGISTRATION',
            expires_at TEXT NOT NULL,
            created_at TEXT NOT NULL,
            is_used INTEGER DEFAULT 0
        )
    """)
    
    # 3. User Saved Strategies & Preferences Table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS user_profiles (
            user_id TEXT PRIMARY KEY,
            watchlist TEXT DEFAULT '[]',
            saved_strategies TEXT DEFAULT '[]',
            paper_portfolio TEXT DEFAULT '{}',
            updated_at TEXT NOT NULL,
            FOREIGN KEY (user_id) REFERENCES users (id)
        )
    """)
    
    conn.commit()
    conn.close()

# ----------------- HASHING & SECURITY -----------------

def hash_password(password: str, salt: Optional[str] = None) -> Tuple[str, str]:
    """Hash a password using salted PBKDF2-HMAC-SHA256 (institutional cryptography)."""
    if not salt:
        salt = os.urandom(16).hex()
    pwd_bytes = password.encode('utf-8')
    salt_bytes = salt.encode('utf-8')
    key = hashlib.pbkdf2_hmac('sha256', pwd_bytes, salt_bytes, 100000)
    return key.hex(), salt

def verify_password(password: str, stored_hash: str, salt: str) -> bool:
    """Verify an input password against stored salt and hash."""
    calc_hash, _ = hash_password(password, salt)
    return calc_hash == stored_hash

# ----------------- USER CRUD OPERATIONS -----------------

def create_user(email: str, full_name: str, password: str, is_verified: bool = False) -> Dict[str, Any]:
    """Create a new user in the database."""
    email = email.lower().strip()
    user_id = str(uuid.uuid4())
    pwd_hash, salt = hash_password(password)
    now_str = datetime.now().isoformat()
    
    conn = get_db_connection()
    cursor = conn.cursor()
    
    try:
        cursor.execute("""
            INSERT INTO users (id, email, full_name, password_hash, salt, is_verified, tier, created_at, last_login)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (user_id, email, full_name.strip(), pwd_hash, salt, 1 if is_verified else 0, 'PRO_QUANT', now_str, now_str))
        
        # Initialize user profile
        cursor.execute("""
            INSERT INTO user_profiles (user_id, watchlist, saved_strategies, paper_portfolio, updated_at)
            VALUES (?, ?, ?, ?, ?)
        """, (user_id, json.dumps(["BTC-USD", "NVDA", "RELIANCE.NS", "TATAPOWER.NS"]), json.dumps([]), json.dumps({}), now_str))
        
        conn.commit()
    finally:
        conn.close()
        
    return get_user_by_email(email)

def get_user_by_email(email: str) -> Optional[Dict[str, Any]]:
    """Retrieve user dictionary by email."""
    email = email.lower().strip()
    conn = get_db_connection()
    cursor = conn.cursor()
    
    cursor.execute("SELECT * FROM users WHERE email = ?", (email,))
    row = cursor.fetchone()
    conn.close()
    
    if not row:
        return None
        
    return {
        "id": row["id"],
        "email": row["email"],
        "full_name": row["full_name"],
        "is_verified": bool(row["is_verified"]),
        "tier": row["tier"],
        "created_at": row["created_at"],
        "last_login": row["last_login"]
    }

def get_user_by_id(user_id: str) -> Optional[Dict[str, Any]]:
    """Retrieve user dictionary by UUID."""
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM users WHERE id = ?", (user_id,))
    row = cursor.fetchone()
    conn.close()
    
    if not row:
        return None
        
    return {
        "id": row["id"],
        "email": row["email"],
        "full_name": row["full_name"],
        "is_verified": bool(row["is_verified"]),
        "tier": row["tier"],
        "created_at": row["created_at"],
        "last_login": row["last_login"]
    }

def authenticate_user(email: str, password: str) -> Optional[Dict[str, Any]]:
    """Authenticate email & password credentials."""
    email = email.lower().strip()
    conn = get_db_connection()
    cursor = conn.cursor()
    
    cursor.execute("SELECT * FROM users WHERE email = ?", (email,))
    row = cursor.fetchone()
    
    if not row:
        conn.close()
        return None
        
    is_valid = verify_password(password, row["password_hash"], row["salt"])
    
    if is_valid:
        # Update last login timestamp
        now_str = datetime.now().isoformat()
        cursor.execute("UPDATE users SET last_login = ? WHERE id = ?", (now_str, row["id"]))
        conn.commit()
        conn.close()
        return get_user_by_id(row["id"])
        
    conn.close()
    return None

def mark_user_verified(email: str) -> bool:
    """Mark a user account as email-verified."""
    email = email.lower().strip()
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("UPDATE users SET is_verified = 1 WHERE email = ?", (email,))
    conn.commit()
    rows = cursor.rowcount
    conn.close()
    return rows > 0

# ----------------- OTP VERIFICATION CODES -----------------

def create_email_otp(email: str, otp_type: str = "REGISTRATION") -> str:
    """Generate a secure 6-digit numeric verification OTP with 10-minute validity."""
    import secrets
    email = email.lower().strip()
    # 6-digit cryptographic random number
    otp_code = f"{secrets.randbelow(900000) + 100000}"
    
    otp_id = str(uuid.uuid4())
    now = datetime.now()
    expires_at = (now + timedelta(minutes=10)).isoformat()
    created_at = now.isoformat()
    
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # Invalidate previous unexpired OTPs for this email
    cursor.execute("UPDATE email_otps SET is_used = 1 WHERE email = ? AND is_used = 0", (email,))
    
    cursor.execute("""
        INSERT INTO email_otps (id, email, otp_code, otp_type, expires_at, created_at, is_used)
        VALUES (?, ?, ?, ?, ?, ?, 0)
    """, (otp_id, email, otp_code, otp_type, expires_at, created_at))
    
    conn.commit()
    conn.close()
    
    return otp_code

def verify_email_otp(email: str, otp_code: str) -> bool:
    """Verify an input 6-digit OTP code against the database."""
    email = email.lower().strip()
    otp_code = str(otp_code).strip()
    
    conn = get_db_connection()
    cursor = conn.cursor()
    
    now_str = datetime.now().isoformat()
    
    cursor.execute("""
        SELECT * FROM email_otps 
        WHERE email = ? AND otp_code = ? AND is_used = 0 AND expires_at >= ?
        ORDER BY created_at DESC LIMIT 1
    """, (email, otp_code, now_str))
    
    row = cursor.fetchone()
    if row:
        # Mark as used
        cursor.execute("UPDATE email_otps SET is_used = 1 WHERE id = ?", (row["id"],))
        cursor.execute("UPDATE users SET is_verified = 1 WHERE email = ?", (email,))
        conn.commit()
        conn.close()
        return True
        
    conn.close()
    return False

def delete_user_by_id(user_id: str) -> bool:
    """Permanently delete user account, profiles, and associated OTPs by ID."""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # Get user email first
    cursor.execute("SELECT email FROM users WHERE id = ?", (user_id,))
    row = cursor.fetchone()
    email = row["email"] if row else None
    
    # Cascade delete
    cursor.execute("DELETE FROM user_profiles WHERE user_id = ?", (user_id,))
    cursor.execute("DELETE FROM users WHERE id = ?", (user_id,))
    user_deleted = cursor.rowcount > 0
    if email:
        cursor.execute("DELETE FROM email_otps WHERE email = ?", (email,))
        
    conn.commit()
    conn.close()
    return user_deleted

def delete_user_by_email(email: str) -> bool:
    """Permanently delete user account, profiles, and associated OTPs by email."""
    email = email.lower().strip()
    conn = get_db_connection()
    cursor = conn.cursor()
    
    cursor.execute("SELECT id FROM users WHERE email = ?", (email,))
    row = cursor.fetchone()
    if not row:
        conn.close()
        return False
        
    user_id = row["id"]
    cursor.execute("DELETE FROM user_profiles WHERE user_id = ?", (user_id,))
    cursor.execute("DELETE FROM users WHERE id = ?", (user_id,))
    cursor.execute("DELETE FROM email_otps WHERE email = ?", (email,))
    
    conn.commit()
    conn.close()
    return True

# Initialize the database upon module load
init_auth_db()
