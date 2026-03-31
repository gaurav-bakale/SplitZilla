from sqlalchemy import Column, String, Float, DateTime, ForeignKey, Table, Integer
from sqlalchemy.orm import relationship
from datetime import datetime
import uuid
from app.database import Base

group_members = Table(
    'group_members',
    Base.metadata,
    Column('user_id', String, ForeignKey('users.user_id')),
    Column('group_id', String, ForeignKey('groups.group_id'))
)

class User(Base):
    __tablename__ = "users"
    
    user_id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String, nullable=False)
    email = Column(String, unique=True, nullable=False, index=True)
    password = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    groups = relationship("Group", secondary=group_members, back_populates="members")
    expenses_paid = relationship("Expense", back_populates="payer", foreign_keys="Expense.paid_by_id")

class Group(Base):
    __tablename__ = "groups"
    
    group_id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String, nullable=False)
    description = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    members = relationship("User", secondary=group_members, back_populates="groups")
    expenses = relationship("Expense", back_populates="group", cascade="all, delete-orphan")

class Expense(Base):
    __tablename__ = "expenses"
    
    expense_id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    description = Column(String, nullable=False)
    amount = Column(Float, nullable=False)
    paid_by_id = Column(String, ForeignKey("users.user_id"), nullable=False)
    group_id = Column(String, ForeignKey("groups.group_id"), nullable=False)
    split_type = Column(String, nullable=False)
    date = Column(DateTime, default=datetime.utcnow)
    
    payer = relationship("User", back_populates="expenses_paid", foreign_keys=[paid_by_id])
    group = relationship("Group", back_populates="expenses")
    splits = relationship("ExpenseSplit", back_populates="expense", cascade="all, delete-orphan")

class ExpenseSplit(Base):
    __tablename__ = "expense_splits"
    
    split_id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    expense_id = Column(String, ForeignKey("expenses.expense_id"), nullable=False)
    user_id = Column(String, ForeignKey("users.user_id"), nullable=False)
    amount = Column(Float, nullable=False)
    
    expense = relationship("Expense", back_populates="splits")
    user = relationship("User")

class Notification(Base):
    __tablename__ = "notifications"
    
    notification_id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, ForeignKey("users.user_id"), nullable=False)
    message = Column(String, nullable=False)
    is_read = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    user = relationship("User")
