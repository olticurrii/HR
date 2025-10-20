"""
Simple test script to verify profile endpoints are working.
Run this after starting the backend server.
"""
import requests
import json

BASE_URL = "http://localhost:8000/api/v1"

def test_profile_endpoints():
    """Test profile endpoints with a test user"""
    
    print("🧪 Testing Profile Endpoints\n")
    print("=" * 50)
    
    # First, login to get a token
    print("\n1. Logging in...")
    login_response = requests.post(
        f"{BASE_URL}/auth/login",
        data={
            "username": "admin@test.com",  # Update with your test user
            "password": "admin123"          # Update with your test password
        }
    )
    
    if login_response.status_code != 200:
        print("❌ Login failed!")
        print(f"Status: {login_response.status_code}")
        print(f"Response: {login_response.text}")
        return
    
    token = login_response.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}
    print("✅ Login successful")
    
    # Test GET /me
    print("\n2. Testing GET /me...")
    me_response = requests.get(f"{BASE_URL}/me", headers=headers)
    if me_response.status_code == 200:
        print("✅ GET /me successful")
        profile = me_response.json()
        print(f"   User: {profile['full_name']} ({profile['email']})")
        print(f"   Role: {profile['role']}")
        print(f"   Department: {profile.get('department_name', 'N/A')}")
    else:
        print(f"❌ GET /me failed: {me_response.status_code}")
        print(f"   Response: {me_response.text}")
    
    # Test PATCH /me
    print("\n3. Testing PATCH /me...")
    update_data = {
        "timezone": "Europe/Pristina",
        "theme": "dark"
    }
    update_response = requests.patch(
        f"{BASE_URL}/me",
        headers=headers,
        json=update_data
    )
    if update_response.status_code == 200:
        print("✅ PATCH /me successful")
        updated = update_response.json()
        print(f"   Timezone: {updated.get('timezone')}")
        print(f"   Theme: {updated.get('theme')}")
    else:
        print(f"❌ PATCH /me failed: {update_response.status_code}")
        print(f"   Response: {update_response.text}")
    
    # Test GET /me/sessions
    print("\n4. Testing GET /me/sessions...")
    sessions_response = requests.get(f"{BASE_URL}/me/sessions", headers=headers)
    if sessions_response.status_code == 200:
        sessions = sessions_response.json()
        print(f"✅ GET /me/sessions successful")
        print(f"   Active sessions: {len(sessions)}")
        for i, session in enumerate(sessions[:3], 1):  # Show first 3
            print(f"   Session {i}: {session.get('device_info', 'Unknown')} - Current: {session['is_current']}")
    else:
        print(f"❌ GET /me/sessions failed: {sessions_response.status_code}")
        print(f"   Response: {sessions_response.text}")
    
    # Test GET /me/performance/summary
    print("\n5. Testing GET /me/performance/summary...")
    perf_response = requests.get(
        f"{BASE_URL}/me/performance/summary",
        headers=headers,
        params={"window_days": 180}
    )
    if perf_response.status_code == 200:
        perf = perf_response.json()
        print("✅ GET /me/performance/summary successful")
        print(f"   Goals: {len(perf.get('goals', []))}")
        print(f"   KPIs: {len(perf.get('kpis', []))}")
        print(f"   Last Review: {'Yes' if perf.get('last_review') else 'No'}")
        print(f"   Trend Points: {len(perf.get('trend', []))}")
    else:
        print(f"❌ GET /me/performance/summary failed: {perf_response.status_code}")
        print(f"   Response: {perf_response.text}")
    
    # Test POST /me/2fa/toggle (stub)
    print("\n6. Testing POST /me/2fa/toggle...")
    twofa_response = requests.post(f"{BASE_URL}/me/2fa/toggle", headers=headers)
    if twofa_response.status_code == 200:
        twofa = twofa_response.json()
        print("✅ POST /me/2fa/toggle successful")
        print(f"   Message: {twofa.get('message')}")
    else:
        print(f"❌ POST /me/2fa/toggle failed: {twofa_response.status_code}")
        print(f"   Response: {twofa_response.text}")
    
    print("\n" + "=" * 50)
    print("✅ All endpoint tests completed!\n")


if __name__ == "__main__":
    try:
        test_profile_endpoints()
    except requests.exceptions.ConnectionError:
        print("\n❌ Error: Could not connect to backend server.")
        print("   Make sure the backend is running on http://localhost:8000")
    except Exception as e:
        print(f"\n❌ Error: {e}")

