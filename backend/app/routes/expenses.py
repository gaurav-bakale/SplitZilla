from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.models import User, Group, Expense, ExpenseSplit
from app.schemas import ExpenseCreate, ExpenseResponse, GroupBalanceResponse, BalanceResponse
from app.auth import get_current_user
from app.patterns.strategy import SplitStrategyFactory
from app.patterns.observer import NotificationService, NotificationObserver
from app.patterns.command import CommandManager, AddExpenseCommand, DeleteExpenseCommand
from collections import defaultdict

router = APIRouter(prefix="/api/expenses", tags=["Expenses"])

@router.post("/", response_model=ExpenseResponse, status_code=status.HTTP_201_CREATED)
def create_expense(
    expense_data: ExpenseCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    group = db.query(Group).filter(Group.group_id == expense_data.group_id).first()
    
    if not group:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Group not found"
        )
    
    if current_user not in group.members:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You are not a member of this group"
        )
    
    strategy = SplitStrategyFactory.get_strategy(expense_data.split_type)
    member_ids = [member.user_id for member in group.members]
    
    kwargs = {}
    if expense_data.percentages:
        kwargs['percentages'] = expense_data.percentages
    if expense_data.exact_amounts:
        kwargs['exact_amounts'] = expense_data.exact_amounts
    
    try:
        splits = strategy.split(expense_data.amount, member_ids, **kwargs)
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    
    expense_dict = {
        'description': expense_data.description,
        'amount': expense_data.amount,
        'paid_by_id': current_user.user_id,
        'group_id': expense_data.group_id,
        'split_type': expense_data.split_type
    }
    
    splits_data = [
        {'user_id': user_id, 'amount': amount}
        for user_id, amount in splits.items()
    ]
    
    command_manager = CommandManager()
    add_command = AddExpenseCommand(db, expense_dict, splits_data)
    expense_id = command_manager.execute(add_command)
    
    expense = db.query(Expense).filter(Expense.expense_id == expense_id).first()
    
    notification_service = NotificationService()
    observer = NotificationObserver(db)
    notification_service.attach(observer)
    notification_service.notify({
        'type': 'expense_added',
        'group_members': member_ids,
        'expense_description': expense_data.description,
        'payer_name': current_user.name,
        'amount': expense_data.amount
    })
    
    return expense

@router.get("/group/{group_id}", response_model=List[ExpenseResponse])
def get_group_expenses(
    group_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    group = db.query(Group).filter(Group.group_id == group_id).first()
    
    if not group:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Group not found"
        )
    
    if current_user not in group.members:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You are not a member of this group"
        )
    
    expenses = db.query(Expense).filter(Expense.group_id == group_id).order_by(Expense.date.desc()).all()
    return expenses

@router.delete("/{expense_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_expense(
    expense_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    expense = db.query(Expense).filter(Expense.expense_id == expense_id).first()
    
    if not expense:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Expense not found"
        )
    
    group = db.query(Group).filter(Group.group_id == expense.group_id).first()
    
    if current_user not in group.members:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You are not a member of this group"
        )
    
    command_manager = CommandManager()
    delete_command = DeleteExpenseCommand(db, expense_id)
    command_manager.execute(delete_command)
    
    return None

@router.post("/undo", status_code=status.HTTP_200_OK)
def undo_last_operation(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    command_manager = CommandManager()
    try:
        command_manager.undo()
        return {"message": "Last operation undone successfully"}
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )

@router.post("/redo", status_code=status.HTTP_200_OK)
def redo_last_operation(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    command_manager = CommandManager()
    try:
        command_manager.redo()
        return {"message": "Last operation redone successfully"}
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )

@router.get("/balances/group/{group_id}", response_model=GroupBalanceResponse)
def get_group_balances(
    group_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    group = db.query(Group).filter(Group.group_id == group_id).first()
    
    if not group:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Group not found"
        )
    
    if current_user not in group.members:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You are not a member of this group"
        )
    
    balances = defaultdict(float)
    
    for expense in group.expenses:
        payer_id = expense.paid_by_id
        
        for split in expense.splits:
            if split.user_id != payer_id:
                balances[split.user_id] -= split.amount
                balances[payer_id] += split.amount
    
    balance_list = []
    for member in group.members:
        balance_list.append(BalanceResponse(
            user_id=member.user_id,
            user_name=member.name,
            balance=balances.get(member.user_id, 0.0)
        ))
    
    return GroupBalanceResponse(
        group_id=group.group_id,
        group_name=group.name,
        balances=balance_list
    )
