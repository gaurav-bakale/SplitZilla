# SplitZilla Features

## Health Monitoring Endpoints

### Basic Health Check
**Endpoint:** `GET /api/health/`

Returns the current health status of the API service.

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2026-03-31T19:06:00.000Z",
  "service": "SplitZilla API",
  "version": "1.0.0"
}
```

### System Statistics
**Endpoint:** `GET /api/health/stats`

Returns comprehensive system statistics including total counts of users, groups, expenses, and notifications.

**Response:**
```json
{
  "status": "healthy",
  "statistics": {
    "total_users": 10,
    "total_groups": 5,
    "total_expenses": 25,
    "total_notifications": 50
  },
  "timestamp": "2026-03-31T19:06:00.000Z"
}
```

**Use Cases:**
- Monitor system health
- Track application usage
- Generate analytics dashboards
- System administration

---

**Author:** Gaurav Bakale  
**Feature Branch:** gaurav/feature  
**Date:** March 31, 2026
