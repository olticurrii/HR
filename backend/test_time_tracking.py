#!/usr/bin/env python3
"""
Test script for Time Tracking API endpoints
"""
import requests
import json

BASE_URL = "http://localhost:8000/api/v1"

def login():
    """Login and get access token"""
    print("🔐 Logging in...")
    response = requests.post(
        f"{BASE_URL}/auth/login",
        data={
            "username": "admin@example.com",  # Change to your admin email
            "password": "admin123"  # Change to your admin password
        }
    )
    
    if response.status_code == 200:
        token = response.json()["access_token"]
        print("✓ Login successful")
        return token
    else:
        print(f"✗ Login failed: {response.status_code}")
        print(response.text)
        return None

def test_clock_in(token):
    """Test clock in endpoint"""
    print("\n⏰ Testing Clock In...")
    headers = {"Authorization": f"Bearer {token}"}
    
    response = requests.post(
        f"{BASE_URL}/time/clock-in",
        headers=headers,
        params={"is_terrain": False}
    )
    
    if response.status_code == 200:
        print("✓ Clock in successful")
        print(f"  Entry ID: {response.json()['id']}")
        return True
    else:
        print(f"✗ Clock in failed: {response.status_code}")
        print(f"  {response.json().get('detail', response.text)}")
        return False

def test_get_status(token):
    """Test get status endpoint"""
    print("\n📊 Testing Get Status...")
    headers = {"Authorization": f"Bearer {token}"}
    
    response = requests.get(f"{BASE_URL}/time/status", headers=headers)
    
    if response.status_code == 200:
        data = response.json()
        print("✓ Status retrieved successfully")
        print(f"  Clocked in: {data['is_clocked_in']}")
        print(f"  On break: {data['is_on_break']}")
        print(f"  Terrain: {data['is_terrain']}")
        if data['current_duration_minutes']:
            print(f"  Duration: {data['current_duration_minutes']} minutes")
        return True
    else:
        print(f"✗ Get status failed: {response.status_code}")
        return False

def test_start_break(token):
    """Test start break endpoint"""
    print("\n☕ Testing Start Break...")
    headers = {"Authorization": f"Bearer {token}"}
    
    response = requests.post(f"{BASE_URL}/time/start-break", headers=headers)
    
    if response.status_code == 200:
        print("✓ Break started successfully")
        return True
    else:
        print(f"✗ Start break failed: {response.status_code}")
        print(f"  {response.json().get('detail', response.text)}")
        return False

def test_end_break(token):
    """Test end break endpoint"""
    print("\n▶️ Testing End Break...")
    headers = {"Authorization": f"Bearer {token}"}
    
    response = requests.post(f"{BASE_URL}/time/end-break", headers=headers)
    
    if response.status_code == 200:
        print("✓ Break ended successfully")
        return True
    else:
        print(f"✗ End break failed: {response.status_code}")
        print(f"  {response.json().get('detail', response.text)}")
        return False

def test_toggle_terrain(token):
    """Test toggle terrain endpoint"""
    print("\n🗺️ Testing Toggle Terrain...")
    headers = {"Authorization": f"Bearer {token}"}
    
    response = requests.post(f"{BASE_URL}/time/terrain", headers=headers)
    
    if response.status_code == 200:
        print("✓ Terrain toggled successfully")
        print(f"  Is terrain: {response.json()['is_terrain']}")
        return True
    else:
        print(f"✗ Toggle terrain failed: {response.status_code}")
        return False

def test_get_active_users(token):
    """Test get active users endpoint (admin only)"""
    print("\n👥 Testing Get Active Users (Admin)...")
    headers = {"Authorization": f"Bearer {token}"}
    
    response = requests.get(f"{BASE_URL}/time/active", headers=headers)
    
    if response.status_code == 200:
        users = response.json()
        print(f"✓ Active users retrieved: {len(users)} users")
        for user in users[:3]:  # Show first 3
            print(f"  - {user['full_name']} ({user['current_duration_minutes']} min)")
        return True
    elif response.status_code == 403:
        print("⚠️ Admin access required (expected if not admin)")
        return True
    else:
        print(f"✗ Get active users failed: {response.status_code}")
        return False

def test_clock_out(token):
    """Test clock out endpoint"""
    print("\n🏁 Testing Clock Out...")
    headers = {"Authorization": f"Bearer {token}"}
    
    response = requests.post(f"{BASE_URL}/time/clock-out", headers=headers)
    
    if response.status_code == 200:
        print("✓ Clock out successful")
        data = response.json()
        print(f"  Clock in: {data['clock_in']}")
        print(f"  Clock out: {data['clock_out']}")
        return True
    else:
        print(f"✗ Clock out failed: {response.status_code}")
        print(f"  {response.json().get('detail', response.text)}")
        return False

def main():
    """Run all tests"""
    print("=" * 60)
    print("Time Tracking API Test Suite")
    print("=" * 60)
    
    # Login
    token = login()
    if not token:
        print("\n❌ Tests aborted: Login failed")
        return
    
    # Run tests
    results = []
    
    # Test flow: Clock in -> Get Status -> Start Break -> End Break -> Toggle Terrain -> Clock Out
    results.append(("Clock In", test_clock_in(token)))
    results.append(("Get Status", test_get_status(token)))
    results.append(("Start Break", test_start_break(token)))
    results.append(("Get Status (on break)", test_get_status(token)))
    results.append(("End Break", test_end_break(token)))
    results.append(("Toggle Terrain", test_toggle_terrain(token)))
    results.append(("Get Active Users", test_get_active_users(token)))
    results.append(("Clock Out", test_clock_out(token)))
    
    # Summary
    print("\n" + "=" * 60)
    print("Test Results Summary")
    print("=" * 60)
    
    passed = sum(1 for _, result in results if result)
    total = len(results)
    
    for test_name, result in results:
        status = "✓ PASS" if result else "✗ FAIL"
        print(f"{status}: {test_name}")
    
    print("\n" + "-" * 60)
    print(f"Total: {passed}/{total} tests passed ({passed/total*100:.0f}%)")
    
    if passed == total:
        print("\n🎉 All tests passed! Time Tracking system is working correctly.")
    else:
        print(f"\n⚠️ {total - passed} test(s) failed. Please review the errors above.")
    
    print("=" * 60)

if __name__ == "__main__":
    main()

