import json
import logging
import requests
import urllib3
from datetime import datetime
from typing import Dict, Any, Optional

urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

logger = logging.getLogger(__name__)

def send_discord_webhook(webhook_url: str, title: str, description: str, color_hex: int = 0x00F5D4, fields: list = None) -> bool:
    """Send formatted rich embed to Discord webhook."""
    payload = {
        "username": "AlphaQuant Signals",
        "avatar_url": "https://raw.githubusercontent.com/hemanth17042005/alphaquant-backtester/main/frontend/public/favicon.ico",
        "embeds": [
            {
                "title": f"🚨 {title}",
                "description": description,
                "color": color_hex,
                "fields": fields or [],
                "footer": {
                    "text": "AlphaQuant Pro Quantitative Trading Terminal • Real-Time Alert Engine",
                    "icon_url": "https://raw.githubusercontent.com/hemanth17042005/alphaquant-backtester/main/frontend/public/favicon.ico"
                },
                "timestamp": datetime.utcnow().isoformat()
            }
        ]
    }
    try:
        resp = requests.post(webhook_url, json=payload, timeout=5)
        return resp.status_code in [200, 204]
    except Exception as e:
        logger.error(f"Error sending Discord webhook: {e}")
        return False

def send_telegram_message(bot_token: str, chat_id: str, message: str) -> bool:
    """Send Markdown formatted message to Telegram Bot."""
    url = f"https://api.telegram.org/bot{bot_token}/sendMessage"
    payload = {
        "chat_id": chat_id,
        "text": message,
        "parse_mode": "Markdown"
    }
    try:
        resp = requests.post(url, json=payload, timeout=5)
        return resp.status_code == 200
    except Exception as e:
        logger.error(f"Error sending Telegram message: {e}")
        return False

def test_alert_dispatch(platform: str, destination: str, chat_id: Optional[str] = None, symbol: str = "BTC-USD") -> Dict[str, Any]:
    """
    Dispatch a test trade alert notification.
    """
    platform = platform.lower().strip()
    
    if platform == "discord":
        fields = [
            {"name": "Asset", "value": f"`{symbol}`", "inline": True},
            {"name": "Signal", "value": "🟢 `BULLISH BREAKOUT`", "inline": True},
            {"name": "AI Conviction", "value": "`84.5%`", "inline": True},
            {"name": "Target Horizon", "value": "30 Days", "inline": True},
            {"name": "Status", "value": "✅ Operational", "inline": True}
        ]
        success = send_discord_webhook(
            webhook_url=destination,
            title=f"AlphaQuant Signal Alert: {symbol}",
            description=f"Automated trade signal generated for **{symbol}**. Real-time alert connectivity verified successfully.",
            color_hex=0x00F5D4,
            fields=fields
        )
        if success:
            return {"success": True, "message": "Discord test alert dispatched successfully!"}
        else:
            raise ValueError("Failed to deliver Discord alert. Please verify your Webhook URL.")
            
    elif platform == "telegram":
        if not chat_id:
            raise ValueError("Telegram requires both Bot Token and Chat ID.")
        msg = (
            f"🚨 *ALPHAQUANT TRADE ALERT: {symbol}*\n\n"
            f"• *Signal:* 🟢 Bullish Consensus\n"
            f"• *AI Conviction:* 84.5%\n"
            f"• *Time:* {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n\n"
            f"✅ Telegram alert integration is active and verified."
        )
        success = send_telegram_message(bot_token=destination, chat_id=chat_id, message=msg)
        if success:
            return {"success": True, "message": "Telegram test alert dispatched successfully!"}
        else:
            raise ValueError("Failed to deliver Telegram alert. Please verify Bot Token & Chat ID.")
            
    else:
        raise ValueError(f"Unsupported alert platform '{platform}'. Choose 'discord' or 'telegram'.")
