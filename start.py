import os
import sys
import subprocess
import webbrowser
import time
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent
FRONTEND_DIR = BASE_DIR / "frontend"
DIST_DIR = FRONTEND_DIR / "dist"

def run():
    print("=" * 65)
    print("🚀 ALPHAQUANT AUTOMATED TRADING BACKTESTING PLATFORM")
    print("=" * 65)
    
    # Check Python virtual environment
    venv_python = BASE_DIR / ".venv" / "Scripts" / "python.exe"
    python_cmd = str(venv_python) if venv_python.exists() else sys.executable
    
    # Check if frontend is built
    if not DIST_DIR.exists():
        print("📦 Building frontend production bundle for zero-latency UI...")
        try:
            subprocess.run(["cmd.exe", "/c", "npm", "run", "build"], cwd=str(FRONTEND_DIR), check=True)
            print("✅ Frontend build completed!")
        except Exception as e:
            print(f"⚠️ Frontend build warning: {e}. You can run Vite dev server separately via 'npm run dev'.")

    print("\n🌐 Launching AlphaQuant API & Web Dashboard on http://127.0.0.1:8000 ...")
    print("📊 API Documentation available at: http://127.0.0.1:8000/docs")
    print("\nPress Ctrl+C to terminate the platform.\n")

    # Open browser after a brief delay
    time.sleep(1.5)
    webbrowser.open("http://127.0.0.1:8000")

    # Start Uvicorn
    import uvicorn
    uvicorn.run("backend.app.main:app", host="127.0.0.1", port=8000, reload=False)

if __name__ == "__main__":
    run()
