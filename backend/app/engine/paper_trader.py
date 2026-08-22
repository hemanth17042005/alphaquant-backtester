import json
import os
import uuid
import logging
from datetime import datetime
from typing import Dict, Any, List, Optional

from backend.app.config import DATA_CACHE_DIR
from backend.app.data.fetcher import fetch_live_quote

logger = logging.getLogger(__name__)

PAPER_STATE_FILE = DATA_CACHE_DIR / "paper_portfolio_state.json"

DEFAULT_INITIAL_CASH = 100000.0  # $100,000 default virtual funds

def _load_paper_state() -> Dict[str, Any]:
    """Load paper trading state from disk or initialize new."""
    if PAPER_STATE_FILE.exists():
        try:
            with open(PAPER_STATE_FILE, "r", encoding="utf-8") as f:
                return json.load(f)
        except Exception as e:
            logger.warning(f"Error loading paper trading state: {e}")
            
    # Fresh state
    return {
        "initial_capital": DEFAULT_INITIAL_CASH,
        "cash": DEFAULT_INITIAL_CASH,
        "realized_pnl": 0.0,
        "positions": [],  # List of open position dicts
        "history": [],    # List of closed trade dicts
        "created_at": datetime.now().isoformat(),
        "last_updated": datetime.now().isoformat()
    }

def _save_paper_state(state: Dict[str, Any]) -> None:
    """Save paper trading state to disk."""
    try:
        DATA_CACHE_DIR.mkdir(parents=True, exist_ok=True)
        state["last_updated"] = datetime.now().isoformat()
        with open(PAPER_STATE_FILE, "w", encoding="utf-8") as f:
            json.dump(state, f, indent=2)
    except Exception as e:
        logger.error(f"Error saving paper trading state: {e}")

def get_paper_portfolio() -> Dict[str, Any]:
    """
    Get full paper trading portfolio with real-time mark-to-market valuations.
    """
    state = _load_paper_state()
    positions = state.get("positions", [])
    
    total_unrealized_pnl = 0.0
    total_position_value = 0.0
    updated_positions = []
    
    # Mark each position to live market price
    for pos in positions:
        sym = pos["symbol"]
        qty = pos["quantity"]
        entry_price = pos["entry_price"]
        side = pos.get("side", "BUY").upper()
        
        # Get live quote
        quote = fetch_live_quote(sym)
        current_price = quote.get("current_price", entry_price)
        
        if side == "BUY" or side == "LONG":
            unrealized_pnl = (current_price - entry_price) * qty
            unrealized_pnl_pct = ((current_price - entry_price) / entry_price) * 100 if entry_price else 0.0
        else:
            unrealized_pnl = (entry_price - current_price) * qty
            unrealized_pnl_pct = ((entry_price - current_price) / entry_price) * 100 if entry_price else 0.0
            
        pos_value = current_price * qty
        total_position_value += pos_value
        total_unrealized_pnl += unrealized_pnl
        
        updated_pos = {
            **pos,
            "current_price": round(current_price, 2),
            "position_value": round(pos_value, 2),
            "unrealized_pnl": round(unrealized_pnl, 2),
            "unrealized_pnl_pct": round(unrealized_pnl_pct, 2),
            "quote_change": quote.get("change", 0.0),
            "quote_change_pct": quote.get("change_pct", 0.0)
        }
        updated_positions.append(updated_pos)
        
    cash = state.get("cash", DEFAULT_INITIAL_CASH)
    equity = cash + total_position_value + total_unrealized_pnl
    initial_cap = state.get("initial_capital", DEFAULT_INITIAL_CASH)
    total_pnl = equity - initial_cap
    total_pnl_pct = (total_pnl / initial_cap) * 100 if initial_cap else 0.0
    
    return {
        "initial_capital": round(initial_cap, 2),
        "cash": round(cash, 2),
        "equity": round(equity, 2),
        "total_position_value": round(total_position_value, 2),
        "unrealized_pnl": round(total_unrealized_pnl, 2),
        "realized_pnl": round(state.get("realized_pnl", 0.0), 2),
        "total_pnl": round(total_pnl, 2),
        "total_pnl_pct": round(total_pnl_pct, 2),
        "positions": updated_positions,
        "history": state.get("history", [])[-50:],  # Return latest 50 closed trades
        "open_positions_count": len(updated_positions),
        "closed_trades_count": len(state.get("history", [])),
        "last_updated": datetime.now().isoformat()
    }

def execute_paper_order(
    symbol: str,
    side: str = "BUY",
    order_type: str = "MARKET",
    quantity: float = 1.0,
    limit_price: Optional[float] = None,
    stop_loss: Optional[float] = None,
    take_profit: Optional[float] = None
) -> Dict[str, Any]:
    """
    Execute a virtual paper trade order against live quotes.
    """
    symbol = symbol.upper().strip()
    side = side.upper().strip()
    order_type = order_type.upper().strip()
    quantity = float(quantity)
    
    if quantity <= 0:
        raise ValueError("Quantity must be greater than zero.")
        
    # Get live quote
    quote = fetch_live_quote(symbol)
    market_price = float(quote.get("current_price", 100.0))
    
    # Determine execution price with realistic 0.02% slippage model
    slippage = 0.0002
    if side in ["BUY", "LONG"]:
        exec_price = market_price * (1 + slippage)
    else:
        exec_price = market_price * (1 - slippage)
        
    if order_type == "LIMIT" and limit_price:
        exec_price = float(limit_price)
        
    total_cost = exec_price * quantity
    commission = total_cost * 0.0005  # 0.05% commission
    
    state = _load_paper_state()
    cash = state.get("cash", DEFAULT_INITIAL_CASH)
    
    if side in ["BUY", "LONG"] and total_cost + commission > cash:
        raise ValueError(f"Insufficient virtual cash. Required: ${total_cost + commission:,.2f}, Available: ${cash:,.2f}")
        
    position_id = str(uuid.uuid4())[:8]
    
    new_position = {
        "id": position_id,
        "symbol": symbol,
        "name": quote.get("name", symbol),
        "side": side,
        "quantity": quantity,
        "entry_price": round(exec_price, 2),
        "stop_loss": round(float(stop_loss), 2) if stop_loss else None,
        "take_profit": round(float(take_profit), 2) if take_profit else None,
        "commission_paid": round(commission, 2),
        "opened_at": datetime.now().isoformat()
    }
    
    # Deduct cash for long purchase
    if side in ["BUY", "LONG"]:
        state["cash"] = cash - (total_cost + commission)
    else:
        state["cash"] = cash - commission
        
    if "positions" not in state:
        state["positions"] = []
    state["positions"].append(new_position)
    
    _save_paper_state(state)
    logger.info(f"Executed paper order {side} {quantity} {symbol} @ {exec_price:.2f}")
    
    return {
        "success": True,
        "message": f"Successfully executed {side} {quantity} {symbol} at ${exec_price:.2f}",
        "order": new_position,
        "portfolio": get_paper_portfolio()
    }

def close_paper_position(position_id: str) -> Dict[str, Any]:
    """
    Close an open paper trading position at live market price.
    """
    state = _load_paper_state()
    positions = state.get("positions", [])
    
    target_pos = None
    remaining_positions = []
    for pos in positions:
        if pos.get("id") == position_id:
            target_pos = pos
        else:
            remaining_positions.append(pos)
            
    if not target_pos:
        raise ValueError(f"Position with ID '{position_id}' not found.")
        
    symbol = target_pos["symbol"]
    qty = target_pos["quantity"]
    entry_price = target_pos["entry_price"]
    side = target_pos.get("side", "BUY").upper()
    
    # Fetch live exit quote
    quote = fetch_live_quote(symbol)
    exit_price = float(quote.get("current_price", entry_price))
    
    # Calculate PnL
    if side in ["BUY", "LONG"]:
        gross_pnl = (exit_price - entry_price) * qty
    else:
        gross_pnl = (entry_price - exit_price) * qty
        
    exit_commission = (exit_price * qty) * 0.0005
    net_pnl = gross_pnl - exit_commission - target_pos.get("commission_paid", 0.0)
    net_pnl_pct = (gross_pnl / (entry_price * qty)) * 100 if entry_price else 0.0
    
    # Return cash
    return_cash = (exit_price * qty) - exit_commission if side in ["BUY", "LONG"] else (gross_pnl - exit_commission)
    state["cash"] = state.get("cash", DEFAULT_INITIAL_CASH) + return_cash
    state["realized_pnl"] = state.get("realized_pnl", 0.0) + net_pnl
    state["positions"] = remaining_positions
    
    closed_trade = {
        **target_pos,
        "exit_price": round(exit_price, 2),
        "realized_pnl": round(net_pnl, 2),
        "realized_pnl_pct": round(net_pnl_pct, 2),
        "closed_at": datetime.now().isoformat()
    }
    
    if "history" not in state:
        state["history"] = []
    state["history"].append(closed_trade)
    
    _save_paper_state(state)
    logger.info(f"Closed paper position {position_id} ({symbol}): PnL ${net_pnl:.2f}")
    
    return {
        "success": True,
        "message": f"Closed {symbol} position. Realized PnL: ${net_pnl:+,.2f} ({net_pnl_pct:+.2f}%)",
        "closed_trade": closed_trade,
        "portfolio": get_paper_portfolio()
    }

def reset_paper_account(initial_capital: float = DEFAULT_INITIAL_CASH) -> Dict[str, Any]:
    """Reset paper trading account to clean state."""
    state = {
        "initial_capital": float(initial_capital),
        "cash": float(initial_capital),
        "realized_pnl": 0.0,
        "positions": [],
        "history": [],
        "created_at": datetime.now().isoformat(),
        "last_updated": datetime.now().isoformat()
    }
    _save_paper_state(state)
    return get_paper_portfolio()
