from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.database import get_db
from app.models import User, Group, Expense, Notification
from datetime import datetime

router = APIRouter(prefix="/api/health", tags=["Health"])

@router.get("/")
def health_check():
    """Basic health check endpoint"""
    return {
        "status": "healthy",
        "timestamp": datetime.utcnow().isoformat(),
        "service": "SplitZilla API",
        "version": "1.0.0"
    }

@router.get("/stats")
def get_system_stats(db: Session = Depends(get_db)):
    """Get system statistics"""
    try:
        total_users = db.query(func.count(User.user_id)).scalar()
        total_groups = db.query(func.count(Group.group_id)).scalar()
        total_expenses = db.query(func.count(Expense.expense_id)).scalar()
        total_notifications = db.query(func.count(Notification.notification_id)).scalar()
        
        return {
            "status": "healthy",
            "statistics": {
                "total_users": total_users,
                "total_groups": total_groups,
                "total_expenses": total_expenses,
                "total_notifications": total_notifications
            },
            "timestamp": datetime.utcnow().isoformat()
        }
    except Exception as e:
        return {
            "status": "error",
            "message": str(e),
            "timestamp": datetime.utcnow().isoformat()
        }
