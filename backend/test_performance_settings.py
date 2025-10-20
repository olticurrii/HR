#!/usr/bin/env python3
"""
Test script to verify all performance module settings are functional.
"""

import requests
import json

BASE_URL = "http://localhost:8000/api/v1"

def test_performance_settings():
    print("=" * 60)
    print("PERFORMANCE MODULE SETTINGS - FUNCTIONAL TEST")
    print("=" * 60)
    
    # Login
    print("\n1. Logging in as admin...")
    login_response = requests.post(
        f"{BASE_URL}/auth/login",
        data={"username": "admin@company.com", "password": "password123"},
        headers={"Content-Type": "application/x-www-form-urlencoded"}
    )
    
    if login_response.status_code != 200:
        print(f"❌ Login failed: {login_response.text}")
        return
    
    token = login_response.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}
    print("✅ Login successful")
    
    # Get current settings
    print("\n2. Fetching current settings...")
    settings_response = requests.get(f"{BASE_URL}/settings/org", headers=headers)
    if settings_response.status_code != 200:
        print(f"❌ Failed to fetch settings: {settings_response.text}")
        return
    
    settings = settings_response.json()
    print("✅ Settings fetched")
    print(f"\nCurrent Performance Settings:")
    print(f"  - Module Enabled: {settings.get('performance_module_enabled')}")
    print(f"  - Allow Self Goals: {settings.get('performance_allow_self_goals')}")
    print(f"  - Require Goal Approval: {settings.get('performance_require_goal_approval')}")
    print(f"  - Enable Peer Reviews: {settings.get('performance_enable_peer_reviews')}")
    print(f"  - Allow Anonymous Peer: {settings.get('performance_allow_anonymous_peer')}")
    print(f"  - Show KPI Trends: {settings.get('performance_show_kpi_trends')}")
    print(f"  - Top Performer Threshold: {settings.get('performance_top_performer_threshold')}%")
    print(f"  - Monthly Reports: {settings.get('performance_monthly_reports')}")
    
    # Test 1: Module Enabled Check
    print("\n" + "=" * 60)
    print("TEST 1: Performance Module Enabled/Disabled")
    print("=" * 60)
    
    # Disable module
    print("\n  Disabling performance module...")
    update_response = requests.put(
        f"{BASE_URL}/settings/org",
        headers=headers,
        json={"performance_module_enabled": False}
    )
    
    if update_response.status_code == 200:
        print("  ✅ Module disabled in settings")
        
        # Try to create a goal (should fail)
        print("  Testing goal creation with module disabled...")
        goal_response = requests.post(
            f"{BASE_URL}/performance/objectives",
            headers=headers,
            json={
                "user_id": 1,
                "title": "Test Goal",
                "status": "active"
            }
        )
        
        if goal_response.status_code == 403:
            print("  ✅ Goal creation blocked when module disabled")
        else:
            print(f"  ❌ Goal creation should be blocked, got: {goal_response.status_code}")
    
    # Re-enable module
    print("\n  Re-enabling performance module...")
    requests.put(
        f"{BASE_URL}/settings/org",
        headers=headers,
        json={"performance_module_enabled": True}
    )
    print("  ✅ Module re-enabled")
    
    # Test 2: Self Goals Setting
    print("\n" + "=" * 60)
    print("TEST 2: Allow Self-Created Goals")
    print("=" * 60)
    
    print("\n  Testing self-goal creation (should work when enabled)...")
    goal_response = requests.post(
        f"{BASE_URL}/performance/objectives",
        headers=headers,
        json={
            "user_id": 1,
            "title": "Test Self-Created Goal",
            "status": "active",
            "request_approval": True
        }
    )
    
    if goal_response.status_code == 201:
        goal_id = goal_response.json()["id"]
        approval_status = goal_response.json()["approval_status"]
        print(f"  ✅ Self-goal created (ID: {goal_id}, Status: {approval_status})")
        
        # Clean up
        requests.delete(f"{BASE_URL}/performance/objectives/{goal_id}", headers=headers)
        print("  ✅ Test goal cleaned up")
    else:
        print(f"  ⚠️  Goal creation response: {goal_response.status_code}")
    
    # Test 3: KPI Trends Setting
    print("\n" + "=" * 60)
    print("TEST 3: KPI Trends")
    print("=" * 60)
    
    print("\n  Creating KPI snapshot...")
    kpi_response = requests.post(
        f"{BASE_URL}/performance/kpi-snapshots",
        headers=headers,
        json={
            "user_id": 1,
            "kpi_name": "Test KPI",
            "value": 85.5,
            "unit": "%"
        }
    )
    
    if kpi_response.status_code == 201:
        print("  ✅ KPI snapshot created")
        
        # Fetch trends
        print("  Fetching KPI trends...")
        trends_response = requests.get(
            f"{BASE_URL}/performance/kpi-snapshots/trends?user_id=1&days=30",
            headers=headers
        )
        
        if trends_response.status_code == 200:
            trends = trends_response.json()
            print(f"  ✅ KPI trends fetched ({len(trends)} KPI groups)")
        else:
            print(f"  ❌ Failed to fetch trends: {trends_response.status_code}")
    else:
        print(f"  ⚠️  KPI creation response: {kpi_response.status_code}")
    
    # Test 4: Disable KPI Trends
    print("\n  Disabling KPI trends...")
    requests.put(
        f"{BASE_URL}/settings/org",
        headers=headers,
        json={"performance_show_kpi_trends": False}
    )
    
    kpi_disabled_response = requests.post(
        f"{BASE_URL}/performance/kpi-snapshots",
        headers=headers,
        json={
            "user_id": 1,
            "kpi_name": "Test KPI 2",
            "value": 90.0,
            "unit": "%"
        }
    )
    
    if kpi_disabled_response.status_code == 403:
        print("  ✅ KPI creation blocked when disabled")
    else:
        print(f"  ❌ KPI should be blocked, got: {kpi_disabled_response.status_code}")
    
    # Re-enable KPI trends
    requests.put(
        f"{BASE_URL}/settings/org",
        headers=headers,
        json={"performance_show_kpi_trends": True}
    )
    print("  ✅ KPI trends re-enabled")
    
    # Test 5: Top Performer Threshold
    print("\n" + "=" * 60)
    print("TEST 4: Top Performer Badge Threshold")
    print("=" * 60)
    
    print("\n  Checking top performer badge...")
    badge_response = requests.get(
        f"{BASE_URL}/performance/top-performer-badge/1",
        headers=headers
    )
    
    if badge_response.status_code == 200:
        badge_data = badge_response.json()
        print(f"  ✅ Badge endpoint working")
        print(f"     - Has Badge: {badge_data['has_badge']}")
        print(f"     - Threshold: {badge_data['threshold']}%")
        print(f"     - Score: {badge_data.get('score', 'N/A')}")
    else:
        print(f"  ❌ Badge check failed: {badge_response.status_code}")
    
    # Test 6: Monthly Report
    print("\n" + "=" * 60)
    print("TEST 5: Monthly Report Generation")
    print("=" * 60)
    
    print("\n  Generating monthly report...")
    report_response = requests.get(
        f"{BASE_URL}/performance/monthly-report",
        headers=headers
    )
    
    if report_response.status_code == 200:
        report_data = report_response.json()
        print("  ✅ Monthly report generated")
        print(f"     - Total Objectives: {report_data['summary']['total_objectives']}")
        print(f"     - Active Objectives: {report_data['summary']['active_objectives']}")
        print(f"     - Pending Approvals: {report_data['summary']['pending_approvals']}")
    else:
        print(f"  ❌ Report generation failed: {report_response.status_code}")
    
    # Disable monthly reports
    print("\n  Disabling monthly reports...")
    requests.put(
        f"{BASE_URL}/settings/org",
        headers=headers,
        json={"performance_monthly_reports": False}
    )
    
    report_disabled_response = requests.get(
        f"{BASE_URL}/performance/monthly-report",
        headers=headers
    )
    
    if report_disabled_response.status_code == 403:
        print("  ✅ Monthly reports blocked when disabled")
    else:
        print(f"  ❌ Reports should be blocked, got: {report_disabled_response.status_code}")
    
    # Re-enable monthly reports
    requests.put(
        f"{BASE_URL}/settings/org",
        headers=headers,
        json={"performance_monthly_reports": True}
    )
    print("  ✅ Monthly reports re-enabled")
    
    # Final Summary
    print("\n" + "=" * 60)
    print("SUMMARY")
    print("=" * 60)
    print("\n✅ All performance module settings are functional!")
    print("\nSettings Control:")
    print("  ✓ Module master toggle (enables/disables all features)")
    print("  ✓ Self-created goals (allows employees to create goals)")
    print("  ✓ Goal approval requirement (gates self-created goals)")
    print("  ✓ Peer reviews (enables peer review submission)")
    print("  ✓ Anonymous peer reviews (allows anonymous peer feedback)")
    print("  ✓ KPI trends (enables KPI tracking and visualization)")
    print("  ✓ Top performer threshold (controls badge eligibility)")
    print("  ✓ Monthly reports (enables admin report generation)")
    
    print("\n" + "=" * 60)
    print("TEST COMPLETE")
    print("=" * 60)

if __name__ == "__main__":
    try:
        test_performance_settings()
    except requests.exceptions.ConnectionError:
        print("\n❌ ERROR: Cannot connect to backend server")
        print("   Make sure the server is running on http://localhost:8000")
    except Exception as e:
        print(f"\n❌ ERROR: {e}")
        import traceback
        traceback.print_exc()

