#!/usr/bin/env python3
"""
Setup virtual environment and install requirements if not already installed.
"""
import os
import sys
import subprocess
import venv
from pathlib import Path

def main():
    # Get the backend directory (parent of scripts)
    backend_dir = Path(__file__).parent.parent
    venv_dir = backend_dir / "venv"
    requirements_file = backend_dir / "requirements.txt"
    
    print(f"🔧 Setting up virtual environment in {venv_dir}")
    
    # Create venv if it doesn't exist
    if not venv_dir.exists():
        print("📦 Creating virtual environment...")
        venv.create(venv_dir, with_pip=True)
        print("✅ Virtual environment created")
    else:
        print("✅ Virtual environment already exists")
    
    # Determine the correct python executable
    if os.name == 'nt':  # Windows
        python_exe = venv_dir / "Scripts" / "python.exe"
        pip_exe = venv_dir / "Scripts" / "pip.exe"
    else:  # Unix-like
        python_exe = venv_dir / "bin" / "python"
        pip_exe = venv_dir / "bin" / "pip"
    
    # Check if requirements.txt exists
    if not requirements_file.exists():
        print("❌ requirements.txt not found!")
        sys.exit(1)
    
    # Install requirements
    print("📦 Installing requirements...")
    try:
        subprocess.run([
            str(pip_exe), "install", "-r", str(requirements_file)
        ], check=True, cwd=backend_dir)
        print("✅ Requirements installed successfully")
    except subprocess.CalledProcessError as e:
        print(f"❌ Failed to install requirements: {e}")
        sys.exit(1)
    
    print(f"🎉 Setup complete! Python executable: {python_exe}")
    return str(python_exe)

if __name__ == "__main__":
    main()

