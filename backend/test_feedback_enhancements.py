"""
Test script for feedback enhancements
Tests: threading, moderation, notifications, weekly digest
"""
import requests
import json

BASE_URL = "http://localhost:8000/api/v1"

def test_feedback_enhancements():
    """Test all feedback enhancements"""
    
    print("🧪 Testing Feedback Enhancements\n")
    print("=" * 60)
    
    # Login
    print("\n1. Logging in...")
    login_response = requests.post(
        f"{BASE_URL}/auth/login",
        data={
            "username": "admin@test.com",
            "password": "admin123"
        }
    )
    
    if login_response.status_code != 200:
        print("❌ Login failed!")
        return
    
    token = login_response.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}
    print("✅ Login successful")
    
    # Test 1: Create feedback with moderation
    print("\n2. Testing Moderation Filter (Blocking Behavior)...")
    test_contents = [
        ("Great work on the project!", True),   # Clean - should pass
        ("This is damn good work!", False),     # Profanity - should BLOCK
        ("EXCELLENT JOB!!!!!!", False),         # Excessive ! - should BLOCK
        ("I appreciate the effort", True),      # Clean - should pass
    ]
    
    feedback_ids = []
    for content, should_pass in test_contents:
        response = requests.post(
            f"{BASE_URL}/feedback",
            headers=headers,
            json={
                "content": content,
                "is_anonymous": False,
                "recipient_type": "EVERYONE"
            }
        )
        
        if response.status_code == 201:
            if should_pass:
                print(f"✅ ALLOWED: '{content[:40]}...'")
                feedback_ids.append(response.json()['id'])
            else:
                print(f"⚠️  UNEXPECTED: Should have been blocked: '{content[:40]}...'")
                feedback_ids.append(response.json()['id'])
        elif response.status_code == 400:
            if not should_pass:
                error_msg = response.json().get('detail', 'Unknown error')
                print(f"🚫 BLOCKED: '{content[:40]}...'")
                print(f"   Reason: {error_msg}")
            else:
                print(f"❌ UNEXPECTED BLOCK: '{content[:40]}...'")
                print(f"   Error: {response.json().get('detail')}")
        else:
            print(f"❌ Error {response.status_code}: {response.text}")
    
    # Test 2: Create threaded replies
    print("\n3. Testing Threaded Replies...")
    if feedback_ids:
        parent_id = feedback_ids[0]
        reply_response = requests.post(
            f"{BASE_URL}/feedback",
            headers=headers,
            json={
                "content": "Thank you for the feedback!",
                "is_anonymous": False,
                "recipient_type": "EVERYONE",
                "parent_id": parent_id
            }
        )
        
        if reply_response.status_code == 201:
            print(f"✅ Reply created for feedback #{parent_id}")
            
            # Get replies
            replies_response = requests.get(
                f"{BASE_URL}/feedback/{parent_id}/replies",
                headers=headers
            )
            
            if replies_response.status_code == 200:
                replies = replies_response.json()
                print(f"✅ Retrieved {len(replies)} replies")
            else:
                print(f"❌ Failed to get replies")
        else:
            print(f"❌ Failed to create reply")
    
    # Test 3: Anonymous feedback
    print("\n4. Testing Anonymous Feedback...")
    anon_response = requests.post(
        f"{BASE_URL}/feedback",
        headers=headers,
        json={
            "content": "Anonymous suggestion for improvement",
            "is_anonymous": True,
            "recipient_type": "ADMIN"
        }
    )
    
    if anon_response.status_code == 201:
        data = anon_response.json()
        print(f"✅ Anonymous feedback created")
        print(f"   Author display: {data.get('author_display')}")
        print(f"   Anonymous: {data.get('is_anonymous')}")
    else:
        print(f"❌ Failed to create anonymous feedback")
    
    # Test 4: Get flagged feedback (admin)
    print("\n5. Testing Flagged Feedback Retrieval...")
    flagged_response = requests.get(
        f"{BASE_URL}/admin/feedback/flagged",
        headers=headers
    )
    
    if flagged_response.status_code == 200:
        flagged = flagged_response.json()
        print(f"✅ Retrieved {len(flagged)} flagged feedback items")
        for fb in flagged[:3]:
            print(f"   - ID {fb['id']}: {fb['flagged_reason']}")
    else:
        print(f"❌ Failed to get flagged feedback")
    
    # Test 5: Weekly digest
    print("\n6. Testing Weekly Digest...")
    digest_response = requests.get(
        f"{BASE_URL}/admin/feedback/weekly-digest",
        headers=headers
    )
    
    if digest_response.status_code == 200:
        digest = digest_response.json()
        print(f"✅ Weekly digest generated")
        print(f"   Total feedback: {digest['total_feedback']}")
        print(f"   Positive: {digest['sentiment']['positive']}")
        print(f"   Neutral: {digest['sentiment']['neutral']}")
        print(f"   Negative: {digest['sentiment']['negative']}")
        print(f"   Flagged: {digest['flagged_count']}")
        print(f"   Anonymous: {digest['anonymous_count']}")
    else:
        print(f"❌ Failed to get weekly digest")
    
    # Test 6: Recipient types
    print("\n7. Testing Recipient Types...")
    recipient_types = ['USER', 'ADMIN', 'EVERYONE']
    for rec_type in recipient_types:
        payload = {
            "content": f"Test feedback for {rec_type}",
            "is_anonymous": False,
            "recipient_type": rec_type
        }
        
        if rec_type == 'USER':
            # Need to get a user ID first
            users_response = requests.get(f"{BASE_URL}/users", headers=headers)
            if users_response.status_code == 200:
                users = users_response.json()
                if users:
                    payload['recipient_id'] = users[0]['id']
                else:
                    print(f"⚠️  Skipping USER test - no users available")
                    continue
        
        response = requests.post(f"{BASE_URL}/feedback", headers=headers, json=payload)
        
        if response.status_code == 201:
            print(f"✅ {rec_type} feedback created")
        else:
            print(f"❌ {rec_type} feedback failed: {response.text}")
    
    print("\n" + "=" * 60)
    print("✅ All feedback enhancement tests completed!\n")


if __name__ == "__main__":
    try:
        test_feedback_enhancements()
    except requests.exceptions.ConnectionError:
        print("\n❌ Error: Could not connect to backend server.")
        print("   Make sure the backend is running on http://localhost:8000")
    except Exception as e:
        print(f"\n❌ Error: {e}")

