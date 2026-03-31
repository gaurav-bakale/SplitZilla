from pydantic import BaseModel, EmailStr
from typing import List, Optional, Dict
from datetime import datetime

class UserCreate(BaseModel):
    name: str
    email: EmailStr
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    user_id: str
    name: str
    email: str
    created_at: datetime
    
    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str

class GroupCreate(BaseModel):
    name: str
    description: Optional[str] = ""
    group_type: str = "general"

class GroupResponse(BaseModel):
    group_id: str
    name: str
    description: Optional[str]
    created_at: datetime
    members: List[UserResponse] = []
    
    class Config:
        from_attributes = True

class ExpenseCreate(BaseModel):
    description: str
    amount: float
    group_id: str
    split_type: str
    percentages: Optional[Dict[str, float]] = None
    exact_amounts: Optional[Dict[str, float]] = None

class ExpenseSplitResponse(BaseModel):
    split_id: str
    user_id: str
    amount: float
    
    class Config:
        from_attributes = True

class ExpenseResponse(BaseModel):
    expense_id: str
    description: str
    amount: float
    paid_by_id: str
    group_id: str
    split_type: str
    date: datetime
    splits: List[ExpenseSplitResponse] = []
    
    class Config:
        from_attributes = True

class NotificationResponse(BaseModel):
    notification_id: str
    user_id: str
    message: str
    is_read: int
    created_at: datetime
    
    class Config:
        from_attributes = True

class BalanceResponse(BaseModel):
    user_id: str
    user_name: str
    balance: float

class GroupBalanceResponse(BaseModel):
    group_id: str
    group_name: str
    balances: List[BalanceResponse]
