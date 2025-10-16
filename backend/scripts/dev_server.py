#!/usr/bin/env python3
"""
Development server with port management and PID tracking.
"""
import os
import sys
import signal
import subprocess
import psutil
from pathlib import Path

def get_pid_file():
    """Get the path to the PID file."""
    backend_dir = Path(__file__).parent.parent
    return backend_dir / "server.pid"

def is_server_running(pid_file):
    """Check if server is already running."""
    if not pid_file.exists():
        return False
    
    try:
        with open(pid_file, 'r') as f:
            pid = int(f.read().strip())
        
        # Check if process is still alive
        if psutil.pid_exists(pid):
            try:
                process = psutil.Process(pid)
                # Check if it's actually our server process
                if 'uvicorn' in ' '.join(process.cmdline()):
                    return True
            except (psutil.NoSuchProcess, psutil.AccessDenied):
                pass
        
        # PID file exists but process is dead, clean it up
        pid_file.unlink()
        return False
        
    except (ValueError, FileNotFoundError):
        return False

def write_pid(pid_file, pid):
    """Write PID to file."""
    with open(pid_file, 'w') as f:
        f.write(str(pid))

def cleanup_pid_file(pid_file):
    """Remove PID file."""
    if pid_file.exists():
        pid_file.unlink()

def signal_handler(signum, frame):
    """Handle shutdown signals."""
    print("\n🛑 Shutting down server...")
    cleanup_pid_file(get_pid_file())
    sys.exit(0)

def main():
    """Start the development server."""
    # Set up signal handlers
    signal.signal(signal.SIGINT, signal_handler)
    signal.signal(signal.SIGTERM, signal_handler)
    
    pid_file = get_pid_file()
    
    # Check if server is already running
    if is_server_running(pid_file):
        print("🚫 Server is already running!")
        print("   Use 'taskkill /F /PID <pid>' to stop it, or restart your terminal")
        sys.exit(1)
    
    # Find free port
    try:
        result = subprocess.run([
            sys.executable, 
            str(Path(__file__).parent / "find_free_port.py")
        ], capture_output=True, text=True, check=True)
        port = int(result.stdout.strip())
    except (subprocess.CalledProcessError, ValueError):
        print("❌ Failed to find free port")
        sys.exit(1)
    
    print(f"🚀 Starting server on port {port}")
    
    # Start uvicorn server
    try:
        process = subprocess.Popen([
            sys.executable, "-m", "uvicorn", 
            "app.main:app", 
            "--host", "0.0.0.0", 
            "--port", str(port), 
            "--reload"
        ], cwd=Path(__file__).parent.parent)
        
        # Write PID to file
        write_pid(pid_file, process.pid)
        
        print(f"✅ Server started with PID {process.pid}")
        print(f"🌐 Server running at: http://127.0.0.1:{port}")
        print(f"📚 API docs at: http://127.0.0.1:{port}/docs")
        print("Press Ctrl+C to stop the server")
        
        # Wait for process to complete
        process.wait()
        
    except KeyboardInterrupt:
        print("\n🛑 Stopping server...")
        if process:
            process.terminate()
            process.wait()
    except Exception as e:
        print(f"❌ Failed to start server: {e}")
        sys.exit(1)
    finally:
        cleanup_pid_file(pid_file)

if __name__ == "__main__":
    main()

