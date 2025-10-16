#!/usr/bin/env python3
"""
Cross-platform development server launcher.
"""
import os
import sys
import subprocess
from pathlib import Path

def main():
    """Run the development server setup and start."""
    print("🚀 Starting HR Management Backend Development Server")
    
    # Change to backend directory
    backend_dir = Path(__file__).parent
    os.chdir(backend_dir)
    
    # Run setup
    print("📦 Setting up virtual environment...")
    try:
        subprocess.run([sys.executable, "scripts/setup_venv.py"], check=True)
    except subprocess.CalledProcessError:
        print("❌ Failed to setup virtual environment")
        sys.exit(1)
    
    # Check dependencies
    print("🔍 Checking dependencies...")
    try:
        subprocess.run([sys.executable, "scripts/check_deps.py"], check=True)
    except subprocess.CalledProcessError:
        print("❌ Dependencies check failed")
        sys.exit(1)
    
    # Start development server
    print("🚀 Starting development server...")
    try:
        subprocess.run([sys.executable, "scripts/dev_server.py"], check=True)
    except subprocess.CalledProcessError:
        print("❌ Failed to start development server")
        sys.exit(1)

if __name__ == "__main__":
    main()

