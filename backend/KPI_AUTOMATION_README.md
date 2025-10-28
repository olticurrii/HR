# 🤖 Automated KPI Calculation System

## 🎯 Overview

Your HR Management System now features a **fully automated KPI aggregation engine** that:
- **Calculates metrics automatically** from existing Tasks, Projects, and Time Tracking data
- **Runs on a schedule** (every 6 hours) without manual intervention
- **Provides real-time insights** and trend analysis
- **Stores historical data** for performance tracking
- **Generates actionable recommendations** based on performance trends

---

## 📊 Auto-Calculated Metrics

### 1. **Task Completion Rate** (`%`)
- Percentage of completed tasks vs total tasks
- Calculated from Tasks table
- Updated quarterly

### 2. **On-Time Delivery Rate** (`%`)
- Percentage of tasks completed before or on due date
- Only includes tasks with completion dates
- Measures deadline adherence

### 3. **Productivity Score** (`%`)
- Ratio of logged working hours vs expected hours
- Based on Time Tracking data
- Normalized to 100% maximum

### 4. **Innovation Projects** (`count`)
- Number of projects tagged as innovation/R&D
- Identifies based on project name/description keywords
- Company-wide metric

### 5. **Average Task Duration** (`days`)
- Mean time from task creation to completion
- Helps identify bottlenecks
- Calculated per user or team

### 6. **Project Delivery Rate** (`%`)
- Percentage of projects completed vs total projects
- Strategic planning metric
- Admin-visible

### 7. **Team Collaboration Score** (`/10`)
- Based on task interactions and cross-team activities
- Measures engagement and teamwork
- Normalized 0-10 scale

---

## 🔄 How It Works

### Architecture Flow

```
┌────────────────────────────────────────────────────────┐
│                   Data Sources                          │
│  ┌─────────┐  ┌─────────┐  ┌──────────────┐           │
│  │  Tasks  │  │ Projects│  │ Time Tracking│           │
│  └────┬────┘  └────┬────┘  └──────┬───────┘           │
└───────│────────────│───────────────│────────────────────┘
        │            │               │
        ▼            ▼               ▼
   ┌────────────────────────────────────┐
   │   KPI Calculator Service           │
   │  (app/services/kpi_calculator.py)  │
   │                                    │
   │  • Aggregates data                │
   │  • Calculates metrics             │
   │  • Compares to previous values    │
   │  • Generates insights             │
   └───────────────┬────────────────────┘
                   │
                   ▼
        ┌──────────────────────┐
        │  KPI Snapshots Table │
        │   (Database Storage) │
        └──────────┬───────────┘
                   │
                   ▼
        ┌──────────────────────┐
        │   API Endpoints      │
        │  /api/v1/kpis/*      │
        └──────────┬───────────┘
                   │
                   ▼
        ┌──────────────────────┐
        │  Frontend Dashboard  │
        │  (KPI Trends Page)   │
        └──────────────────────┘
```

### Background Scheduler

The system uses **APScheduler** to run calculations automatically:

- **Schedule**: Every 6 hours (00:00, 06:00, 12:00, 18:00)
- **Location**: `app/services/kpi_scheduler.py`
- **Startup**: Initializes automatically when backend starts
- **Graceful**: Handles missed runs with 1-hour grace period

---

## 🚀 API Endpoints

### 1. Trigger Manual Calculation (Async)
```http
POST /api/v1/kpis/calculate
Authorization: Bearer {admin/manager token}
Query Params: user_id (optional)
```

Triggers background KPI calculation job. Returns immediately.

**Response:**
```json
{
  "status": "started",
  "message": "KPI calculation job started for all users",
  "timestamp": "2025-10-25T12:00:00Z"
}
```

### 2. Calculate KPIs Now (Sync)
```http
POST /api/v1/kpis/calculate-now
Authorization: Bearer {admin/manager token}
Query Params: user_id, days
```

Calculates KPIs immediately (synchronous). Good for testing.

**Response:**
```json
{
  "status": "success",
  "kpis_calculated": 7,
  "timestamp": "2025-10-25T12:00:00Z",
  "metrics": [
    {
      "metric_name": "Task Completion Rate",
      "value": 85.5,
      "unit": "%",
      "recorded_at": "2025-10-25T12:00:00Z"
    }
  ]
}
```

### 3. Get Auto-Calculated KPIs
```http
GET /api/v1/kpis/auto-calculated
Authorization: Bearer {token}
Query Params: user_id (optional), days (default: 90)
```

Retrieves auto-calculated KPIs with trends and insights.

**Response:**
```json
{
  "user_id": 1,
  "date_range": {
    "start": "2025-07-27T00:00:00Z",
    "end": "2025-10-25T12:00:00Z",
    "days": 90
  },
  "metrics": [
    {
      "kpi_name": "Task Completion Rate",
      "current_value": 85.5,
      "unit": "%",
      "data_points": [
        {"date": "2025-10-01T00:00:00Z", "value": 82.3},
        {"date": "2025-10-08T00:00:00Z", "value": 84.1},
        {"date": "2025-10-15T00:00:00Z", "value": 85.5}
      ],
      "last_updated": "2025-10-25T12:00:00Z",
      "trend_direction": "up",
      "change_percent": 3.9,
      "insight": "📈 Excellent! Task Completion Rate improved significantly by +3.9% to 85.5%"
    }
  ],
  "total_metrics": 7,
  "last_calculation": "2025-10-25T12:00:00Z"
}
```

### 4. Get KPI Calculation Status
```http
GET /api/v1/kpis/status
Authorization: Bearer {token}
```

Returns status of KPI calculation system.

**Response:**
```json
{
  "status": "operational",
  "last_calculation": "2025-10-25T12:00:00Z",
  "total_metrics": 7,
  "total_snapshots": 245,
  "metrics_tracked": [
    {
      "name": "Task Completion Rate",
      "data_points": 35,
      "last_updated": "2025-10-25T12:00:00Z"
    }
  ],
  "auto_calculation_enabled": true,
  "calculation_frequency": "Every 6 hours"
}
```

### 5. Get Metric Insights
```http
GET /api/v1/kpis/insights/{metric_name}
Authorization: Bearer {token}
Query Params: user_id, days
```

Get detailed analysis and recommendations for a specific metric.

**Response:**
```json
{
  "metric_name": "Task Completion Rate",
  "user_id": 1,
  "current_value": 85.5,
  "statistics": {
    "average": 83.2,
    "minimum": 78.5,
    "maximum": 87.3,
    "change_from_start": 7.0,
    "change_percent": 8.9
  },
  "data_points": 12,
  "historical_data": [...],
  "recommendations": [
    "Excellent performance! Share your workflow with the team"
  ]
}
```

---

## 💻 Frontend Integration

### Updated Components

#### 1. **KPITrends Component**
- Now uses `useKPIData` hook with auto-calculated data
- Displays insights automatically
- Shows last calculation time
- Refresh button triggers manual calculation

#### 2. **useKPIData Hook**
- Fetches from `/api/v1/kpis/auto-calculated`
- Transforms data to match UI requirements
- Handles loading and error states
- Supports auto-refresh

### Usage Example

```typescript
const {
  trends,           // Auto-calculated KPI trends
  overviewStats,    // Summary statistics
  loading,          // Loading state
  refreshData,      // Manual refresh function
  hasData,          // Boolean: has KPI data
  lastUpdated,      // Last calculation timestamp
} = useKPIData({
  userId: user.id,
  days: 90,
  autoRefresh: false  // Can enable for real-time updates
});
```

---

## ⚙️ Configuration

### Change Calculation Schedule

Edit `/app/services/kpi_scheduler.py`:

```python
# Current: Every 6 hours (00:00, 06:00, 12:00, 18:00)
scheduler.add_job(
    kpi_calculation_job,
    trigger=CronTrigger(hour='0,6,12,18', minute=0),
    ...
)

# Example: Daily at midnight
scheduler.add_job(
    kpi_calculation_job,
    trigger=CronTrigger(hour=0, minute=0),
    ...
)

# Example: Every hour
scheduler.add_job(
    kpi_calculation_job,
    trigger=CronTrigger(hour='*/1'),
    ...
)
```

### Add New Metrics

1. Create calculation method in `kpi_calculator.py`:

```python
def _calculate_your_new_metric(self, user_id, start_date, end_date):
    # Query your data
    query = self.db.query(...)
    
    # Calculate value
    value = ...
    
    # Get previous value for trend
    previous_value = self._get_previous_kpi_value('Metric Name', user_id, start_date)
    
    return {
        'metric_name': 'Your Metric Name',
        'value': value,
        'unit': '%',  # or 'count', '/10', etc.
        'period': 'monthly',
        'visibility': 'manager',
        'notes': 'Description',
        'previous_value': previous_value,
    }
```

2. Add to metrics list in `calculate_all_kpis()`:

```python
metrics = [
    self._calculate_task_completion_rate,
    self._calculate_on_time_delivery_rate,
    # ... existing metrics
    self._calculate_your_new_metric,  # Add here
]
```

---

## 🧪 Testing

### Manual Trigger (Command Line)

```bash
# From backend directory
python -c "
from app.core.database import SessionLocal
from app.services.kpi_calculator import run_kpi_calculation_job

db = SessionLocal()
run_kpi_calculation_job(db, user_id=None)
db.close()
"
```

### API Testing

```bash
# Get auto-calculated KPIs
curl -X GET "http://localhost:8000/api/v1/kpis/auto-calculated?days=90" \
  -H "Authorization: Bearer YOUR_TOKEN"

# Trigger manual calculation
curl -X POST "http://localhost:8000/api/v1/kpis/calculate" \
  -H "Authorization: Bearer ADMIN_TOKEN"

# Get status
curl -X GET "http://localhost:8000/api/v1/kpis/status" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Frontend Testing

1. Navigate to **Performance → KPI Trends**
2. You should see auto-calculated metrics (if data exists)
3. Click "Refresh" to trigger manual calculation
4. Check browser console for data structure

---

## 📝 Insights & Recommendations

The system automatically generates insights based on performance:

### Trend Insights

- **📈 Significant Improvement** (>20% increase): "Excellent! {Metric} improved significantly by +X%"
- **↗️ Improvement** (10-20%): "{Metric} improved by +X%"
- **➡️ Stable** (<5% change): "{Metric} remains stable"
- **↘️ Decline** (10-20%): "{Metric} declined by -X%"
- **⚠️ Significant Decline** (>20%): "{Metric} dropped significantly. Review needed."

### Actionable Recommendations

- Task completion < 70%: "Consider breaking down large tasks..."
- Productivity < 60%: "Review time tracking patterns..."
- Declining metrics: "Schedule 1-on-1 with manager..."
- High performance: "Share your methods with the team!"

---

## 🎯 Next Steps

### Immediate
- [ ] Review auto-calculated KPIs in the dashboard
- [ ] Verify calculation accuracy with sample data
- [ ] Set up monitoring for calculation failures

### Optional Enhancements
- [ ] Add KPI targets/thresholds table
- [ ] Implement email/Slack notifications for KPI alerts
- [ ] Add "Compare vs Team Average" feature
- [ ] Create PDF export for KPI reports
- [ ] Add custom KPI formulas via UI
- [ ] Implement real-time websocket updates

---

## 🐛 Troubleshooting

### KPIs Not Calculating

1. **Check scheduler status:**
   ```bash
   # Look for "KPI scheduler started successfully" in logs
   tail -f backend/logs/app.log
   ```

2. **Verify APScheduler is installed:**
   ```bash
   pip list | grep APScheduler
   ```

3. **Manual trigger:**
   ```bash
   curl -X POST "http://localhost:8000/api/v1/kpis/calculate-now"
   ```

### No Data Showing

1. **Ensure there's source data:**
   - Create some tasks and complete them
   - Log time tracking entries
   - Create projects

2. **Check database:**
   ```sql
   SELECT * FROM kpi_snapshots ORDER BY snapshot_date DESC LIMIT 10;
   ```

3. **Verify API response:**
   ```bash
   curl "http://localhost:8000/api/v1/kpis/status"
   ```

---

## 📚 Related Documentation

- `/frontend/src/components/Performance/README.md` - Frontend KPI components
- `/backend/app/services/kpi_calculator.py` - Calculation logic
- `/backend/app/api/kpi_automation.py` - API endpoints
- `/backend/app/services/kpi_scheduler.py` - Background scheduler

---

**Built with ❤️ for automated performance tracking** 🚀
