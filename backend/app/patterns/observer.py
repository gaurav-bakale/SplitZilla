from abc import ABC, abstractmethod
from typing import List, Dict, Any
from sqlalchemy.orm import Session
from app.models import Notification

class IObserver(ABC):
    @abstractmethod
    def update(self, event: Dict[str, Any]):
        pass

class NotificationObserver(IObserver):
    def __init__(self, db: Session):
        self.db = db
    
    def update(self, event: Dict[str, Any]):
        event_type = event.get('type')
        
        if event_type == 'expense_added':
            self._handle_expense_added(event)
        elif event_type == 'member_added':
            self._handle_member_added(event)
        elif event_type == 'group_created':
            self._handle_group_created(event)
    
    def _handle_expense_added(self, event: Dict[str, Any]):
        group_members = event.get('group_members', [])
        expense_desc = event.get('expense_description', 'New expense')
        payer_name = event.get('payer_name', 'Someone')
        amount = event.get('amount', 0)
        
        for member_id in group_members:
            notification = Notification(
                user_id=member_id,
                message=f"{payer_name} added expense '{expense_desc}' for ${amount:.2f}"
            )
            self.db.add(notification)
        
        self.db.commit()
    
    def _handle_member_added(self, event: Dict[str, Any]):
        user_id = event.get('user_id')
        group_name = event.get('group_name', 'a group')
        
        if user_id:
            notification = Notification(
                user_id=user_id,
                message=f"You were added to group '{group_name}'"
            )
            self.db.add(notification)
            self.db.commit()
    
    def _handle_group_created(self, event: Dict[str, Any]):
        creator_id = event.get('creator_id')
        group_name = event.get('group_name', 'New group')
        
        if creator_id:
            notification = Notification(
                user_id=creator_id,
                message=f"Group '{group_name}' created successfully"
            )
            self.db.add(notification)
            self.db.commit()

class NotificationService:
    _instance = None
    
    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(NotificationService, cls).__new__(cls)
            cls._instance.observers: List[IObserver] = []
        return cls._instance
    
    def attach(self, observer: IObserver):
        if observer not in self.observers:
            self.observers.append(observer)
    
    def detach(self, observer: IObserver):
        if observer in self.observers:
            self.observers.remove(observer)
    
    def notify(self, event: Dict[str, Any]):
        for observer in self.observers:
            observer.update(event)
