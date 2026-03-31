from abc import ABC, abstractmethod
from typing import List, Optional
from sqlalchemy.orm import Session
from app.models import Expense, ExpenseSplit
from datetime import datetime

class ICommand(ABC):
    @abstractmethod
    def execute(self):
        pass
    
    @abstractmethod
    def undo(self):
        pass

class AddExpenseCommand(ICommand):
    def __init__(self, db: Session, expense_data: dict, splits_data: List[dict]):
        self.db = db
        self.expense_data = expense_data
        self.splits_data = splits_data
        self.expense_id: Optional[str] = None
        self.split_ids: List[str] = []
    
    def execute(self):
        expense = Expense(**self.expense_data)
        self.db.add(expense)
        self.db.flush()
        
        self.expense_id = expense.expense_id
        
        for split_data in self.splits_data:
            split = ExpenseSplit(
                expense_id=self.expense_id,
                **split_data
            )
            self.db.add(split)
            self.db.flush()
            self.split_ids.append(split.split_id)
        
        self.db.commit()
        return self.expense_id
    
    def undo(self):
        if self.expense_id:
            expense = self.db.query(Expense).filter(Expense.expense_id == self.expense_id).first()
            if expense:
                self.db.delete(expense)
                self.db.commit()

class DeleteExpenseCommand(ICommand):
    def __init__(self, db: Session, expense_id: str):
        self.db = db
        self.expense_id = expense_id
        self.expense_backup = None
        self.splits_backup = []
    
    def execute(self):
        expense = self.db.query(Expense).filter(Expense.expense_id == self.expense_id).first()
        if not expense:
            raise ValueError(f"Expense {self.expense_id} not found")
        
        self.expense_backup = {
            'expense_id': expense.expense_id,
            'description': expense.description,
            'amount': expense.amount,
            'paid_by_id': expense.paid_by_id,
            'group_id': expense.group_id,
            'split_type': expense.split_type,
            'date': expense.date
        }
        
        for split in expense.splits:
            self.splits_backup.append({
                'split_id': split.split_id,
                'user_id': split.user_id,
                'amount': split.amount
            })
        
        self.db.delete(expense)
        self.db.commit()
    
    def undo(self):
        if self.expense_backup:
            expense = Expense(**self.expense_backup)
            self.db.add(expense)
            self.db.flush()
            
            for split_data in self.splits_backup:
                split = ExpenseSplit(
                    expense_id=self.expense_id,
                    user_id=split_data['user_id'],
                    amount=split_data['amount']
                )
                self.db.add(split)
            
            self.db.commit()

class CommandManager:
    _instance = None
    
    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(CommandManager, cls).__new__(cls)
            cls._instance.history: List[ICommand] = []
            cls._instance.redo_stack: List[ICommand] = []
        return cls._instance
    
    def execute(self, command: ICommand):
        result = command.execute()
        self.history.append(command)
        self.redo_stack.clear()
        return result
    
    def undo(self):
        if not self.history:
            raise ValueError("No commands to undo")
        
        command = self.history.pop()
        command.undo()
        self.redo_stack.append(command)
    
    def redo(self):
        if not self.redo_stack:
            raise ValueError("No commands to redo")
        
        command = self.redo_stack.pop()
        result = command.execute()
        self.history.append(command)
        return result
    
    def clear_history(self):
        self.history.clear()
        self.redo_stack.clear()
