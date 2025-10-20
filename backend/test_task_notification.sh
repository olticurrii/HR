#!/bin/bash

echo "🧪 Testing Task Assignment Notification"
echo "========================================"

# Login as admin to get token
echo "1. Logging in as admin..."
TOKEN_RESPONSE=$(curl -s -X POST "http://localhost:8000/api/v1/auth/login" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=admin@company.com&password=admin123")

TOKEN=$(echo $TOKEN_RESPONSE | python3 -c "import sys, json; print(json.load(sys.stdin)['access_token'])" 2>/dev/null)

if [ -z "$TOKEN" ]; then
    echo "❌ Failed to get token"
    echo "Response: $TOKEN_RESPONSE"
    exit 1
fi

echo "✅ Got auth token"

# Create a task assigned to user ID 3
echo ""
echo "2. Creating task assigned to user ID 3..."
TASK_RESPONSE=$(curl -s -X POST "http://localhost:8000/api/v1/tasks" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test Notification Task - '$(date +%H:%M:%S)'",
    "description": "This task should trigger a notification",
    "assignee_id": 3,
    "status": "pending",
    "priority": "medium"
  }')

echo "Task created:"
echo "$TASK_RESPONSE" | python3 -m json.tool 2>/dev/null || echo "$TASK_RESPONSE"

echo ""
echo "✅ Check the monitor terminal - you should see a new notification!"
echo ""
echo "3. Waiting 3 seconds then checking notifications for user 3..."
sleep 3

# Get notifications for user 3
NOTIF_RESPONSE=$(curl -s "http://localhost:8000/api/v1/notifications/?limit=5" \
  -H "Authorization: Bearer $TOKEN")

echo "Recent notifications:"
echo "$NOTIF_RESPONSE" | python3 -m json.tool 2>/dev/null || echo "$NOTIF_RESPONSE"

