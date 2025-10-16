#!/usr/bin/env python3
"""
Find a free port in the range 8000-8010.
"""
import socket
import sys

def is_port_free(port):
    """Check if a port is free."""
    try:
        with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
            s.bind(('127.0.0.1', port))
            return True
    except OSError:
        return False

def find_free_port(start_port=8000, max_port=8010):
    """Find the first free port in the range."""
    for port in range(start_port, max_port + 1):
        if is_port_free(port):
            return port
    return None

def main():
    """Find and return a free port."""
    port = find_free_port()
    if port is None:
        print("❌ No free ports found in range 8000-8010")
        sys.exit(1)
    
    print(f"🔌 Found free port: {port}")
    return port

if __name__ == "__main__":
    port = main()
    print(port)  # Output the port for other scripts to use

