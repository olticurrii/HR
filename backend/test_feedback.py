"""
Quick test script for the Feedback module API endpoints.
Verifies that all endpoints are working correctly.
"""

import requests
import json

BASE_URL = "http://localhost:8000/api/v1"

def login():
    """Login and get token"""
    response = requests.post(
        f"{BASE_URL}/auth/login",
        data={
            "username": "admin@example.com",  # Update with your admin email
            "password": "admin123"  # Update with your admin password
        }
    )
    if response.status_code == 200:
        token = response.json()["access_token"]
        print("✓ Login successful")
        return token
    else:
        print("✗ Login failed:", response.text)
        return None

def test_create_feedback(token):
    """Test creating feedback"""
    headers = {"Authorization": f"Bearer {token}"}
    
    # Test 1: Feedback to Everyone
    data = {
        "content": "This is a test feedback to everyone. Great work team!",
        "is_anonymous": False,
        "recipient_type": "EVERYONE"
    }
    response = requests.post(f"{BASE_URL}/feedback", json=data, headers=headers)
    if response.status_code == 201:
        print("✓ Created feedback to EVERYONE")
        print(f"  - Sentiment: {response.json()['sentiment_label']}")
        print(f"  - Score: {response.json()['sentiment_score']}")
        print(f"  - Keywords: {response.json()['keywords']}")
    else:
        print("✗ Failed to create feedback:", response.text)
    
    # Test 2: Anonymous feedback to Admin
    data = {
        "content": "I think we need better communication tools. The current system is confusing.",
        "is_anonymous": True,
        "recipient_type": "ADMIN"
    }
    response = requests.post(f"{BASE_URL}/feedback", json=data, headers=headers)
    if response.status_code == 201:
        print("✓ Created anonymous feedback to ADMIN")
        print(f"  - Sentiment: {response.json()['sentiment_label']}")
    else:
        print("✗ Failed to create anonymous feedback:", response.text)

def test_get_my_feedback(token):
    """Test getting received feedback"""
    headers = {"Authorization": f"Bearer {token}"}
    response = requests.get(f"{BASE_URL}/feedback/my", headers=headers)
    if response.status_code == 200:
        feedbacks = response.json()
        print(f"✓ Retrieved {len(feedbacks)} received feedback items")
    else:
        print("✗ Failed to get my feedback:", response.text)

def test_get_sent_feedback(token):
    """Test getting sent feedback"""
    headers = {"Authorization": f"Bearer {token}"}
    response = requests.get(f"{BASE_URL}/feedback/sent", headers=headers)
    if response.status_code == 200:
        feedbacks = response.json()
        print(f"✓ Retrieved {len(feedbacks)} sent feedback items")
    else:
        print("✗ Failed to get sent feedback:", response.text)

def test_admin_endpoints(token):
    """Test admin endpoints"""
    headers = {"Authorization": f"Bearer {token}"}
    
    # Test getting all feedback
    response = requests.get(f"{BASE_URL}/admin/feedback", headers=headers)
    if response.status_code == 200:
        feedbacks = response.json()
        print(f"✓ Admin: Retrieved {len(feedbacks)} total feedback items")
    else:
        print("✗ Admin: Failed to get all feedback:", response.text)
    
    # Test getting insights
    response = requests.get(f"{BASE_URL}/admin/feedback/insights?window_days=30", headers=headers)
    if response.status_code == 200:
        insights = response.json()
        print(f"✓ Admin: Retrieved insights")
        print(f"  - Total feedback: {insights['total_feedback']}")
        print(f"  - Positive: {insights['sentiment']['positive_pct']}%")
        print(f"  - Neutral: {insights['sentiment']['neutral_pct']}%")
        print(f"  - Negative: {insights['sentiment']['negative_pct']}%")
        print(f"  - Top keywords: {[k['term'] for k in insights['keywords'][:5]]}")
    else:
        print("✗ Admin: Failed to get insights:", response.text)

def main():
    print("=" * 60)
    print("Testing Feedback Module API")
    print("=" * 60)
    
    # Login
    token = login()
    if not token:
        print("\nPlease update the login credentials in this script")
        return
    
    print("\n--- Testing Feedback Creation ---")
    test_create_feedback(token)
    
    print("\n--- Testing Feedback Retrieval ---")
    test_get_my_feedback(token)
    test_get_sent_feedback(token)
    
    print("\n--- Testing Admin Endpoints ---")
    test_admin_endpoints(token)
    
    print("\n" + "=" * 60)
    print("✓ All tests completed!")
    print("=" * 60)

if __name__ == "__main__":
    main()

