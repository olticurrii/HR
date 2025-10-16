#!/usr/bin/env python3
"""
Check if required dependencies are installed and importable.
"""
import sys
import importlib

def check_import(module_name, package_name=None):
    """Check if a module can be imported."""
    try:
        importlib.import_module(module_name)
        print(f"✅ {package_name or module_name} is available")
        return True
    except ImportError as e:
        print(f"❌ {package_name or module_name} is missing: {e}")
        return False

def main():
    """Check all required dependencies."""
    required_modules = [
        ("fastapi", "FastAPI"),
        ("uvicorn", "Uvicorn"),
        ("sqlalchemy", "SQLAlchemy"),
        ("pydantic", "Pydantic"),
        ("dotenv", "python-dotenv"),
    ]
    
    print("🔍 Checking dependencies...")
    
    all_good = True
    for module, name in required_modules:
        if not check_import(module, name):
            all_good = False
    
    if all_good:
        print("🎉 All dependencies are available!")
        sys.exit(0)
    else:
        print("❌ Some dependencies are missing. Run setup_venv.py first.")
        sys.exit(1)

if __name__ == "__main__":
    main()

