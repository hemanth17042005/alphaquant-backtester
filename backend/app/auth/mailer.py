import os
import smtplib
import logging
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from typing import Dict, Any, Optional

from backend.app.config import load_env_file

logger = logging.getLogger(__name__)

def get_smtp_config():
    """Dynamically read current SMTP environment variables from .env."""
    load_env_file()
    host = os.getenv("SMTP_HOST", "").strip()
    user = os.getenv("SMTP_USER", "").strip()
    password = os.getenv("SMTP_PASSWORD", "").strip()
    from_addr = os.getenv("SMTP_FROM", "").strip()

    # Ignore sample placeholders
    if user in ["your_email@gmail.com", "your_brevo_smtp_login"] or password in ["your_16_char_app_password", "your_16_character_app_password"]:
        user = ""
        password = ""

    return {
        "host": host,
        "port": int(os.getenv("SMTP_PORT", "587")),
        "user": user,
        "password": password,
        "from_addr": from_addr or (f"AlphaQuant Security <{user}>" if user else "AlphaQuant Security <no-reply@alphaquant.io>")
    }

def send_verification_email(to_email: str, otp_code: str, user_name: str = "Trader") -> Dict[str, Any]:
    """
    Send a 6-digit Email Verification OTP code.
    If SMTP is configured (e.g. Gmail / Brevo / SendGrid in .env), sends via live SMTP server.
    Otherwise, simulates instant verification with console logging for developer testing.
    """
    smtp = get_smtp_config()
    subject = f"[ALPHAQUANT] Your Verification Code: {otp_code}"
    
    html_content = f"""
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body {{ font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #080B11; color: #F8FAFC; padding: 20px; }}
        .card {{ max-width: 500px; margin: 0 auto; background-color: #0F172A; border: 1px solid rgba(0, 245, 212, 0.3); border-radius: 12px; padding: 28px; }}
        .logo {{ font-size: 20px; font-weight: 800; color: #00F5D4; letter-spacing: -0.02em; margin-bottom: 12px; }}
        .otp-box {{ background: rgba(0, 245, 212, 0.1); border: 1px dashed #00F5D4; border-radius: 8px; font-size: 32px; font-weight: 900; letter-spacing: 8px; color: #00F5D4; text-align: center; padding: 16px; margin: 24px 0; }}
        .footer {{ font-size: 11px; color: #64748B; margin-top: 24px; border-top: 1px solid rgba(255,255,255,0.08); padding-top: 12px; }}
      </style>
    </head>
    <body>
      <div class="card">
        <div class="logo">ALPHAQUANT PRO TERMINAL</div>
        <p>Hello <strong>{user_name}</strong>,</p>
        <p>Use the following 6-digit verification code to complete your secure authentication:</p>
        <div class="otp-box">{otp_code}</div>
        <p style="font-size: 13px; color: #94A3B8;">This code is valid for <strong>10 minutes</strong>. Do not share this code with anyone.</p>
        <div class="footer">
          AlphaQuant Quantitative Backtesting & AI Forecasting Core • If you did not request this, please ignore this email.
        </div>
      </div>
    </body>
    </html>
    """
    
    text_content = f"Your AlphaQuant verification code is: {otp_code}. Valid for 10 minutes."
    
    # Try sending via live SMTP if credentials provided
    if smtp["host"] and smtp["user"] and smtp["password"]:
        try:
            msg = MIMEMultipart("alternative")
            msg["Subject"] = subject
            msg["From"] = smtp["from_addr"]
            msg["To"] = to_email
            
            msg.attach(MIMEText(text_content, "plain", "utf-8"))
            msg.attach(MIMEText(html_content, "html", "utf-8"))
            
            server = smtplib.SMTP(smtp["host"], smtp["port"], timeout=10)
            server.starttls()
            server.login(smtp["user"], smtp["password"])
            server.sendmail(smtp["from_addr"], [to_email], msg.as_string())
            server.quit()
            
            logger.info(f"Verification email sent to {to_email} via live SMTP ({smtp['host']}).")
            print(f"\n[LIVE SMTP SUCCESS] Verification email delivered to: {to_email} via {smtp['host']}\n")
            return {
                "success": True,
                "delivery": "SMTP_SENT",
                "otp_code": otp_code,
                "message": f"Verification code sent to {to_email}. Please check your inbox and spam folder."
            }
        except Exception as e:
            logger.error(f"SMTP send failed: {e}. Falling back to simulated delivery.")
            print(f"\n[SMTP ERROR] Could not deliver email via {smtp['host']}: {e}")
            print("Falling back to simulated delivery with demo code.\n")
            
    # Simulated delivery log
    logger.info(f"[ALPHAQUANT AUTH] Verification code for {to_email}: {otp_code}")
    print(f"\n==========================================")
    print(f"[EMAIL OTP VERIFICATION DISPATCH]")
    print(f"To: {to_email}")
    print(f"Code: >>> {otp_code} <<<")
    print(f"Valid: 10 minutes")
    print(f"Notice: Configure SMTP in .env to deliver real emails to inboxes.")
    print(f"==========================================\n")
    
    return {
        "success": True,
        "delivery": "SIMULATED_INSTANT",
        "demo_code": otp_code,
        "message": f"Verification code generated for {to_email}."
    }

