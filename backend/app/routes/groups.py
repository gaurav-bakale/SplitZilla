from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.models import User, Group
from app.schemas import GroupCreate, GroupResponse, UserResponse
from app.auth import get_current_user
from app.patterns.factory import GroupFactory
from app.patterns.observer import NotificationService, NotificationObserver

router = APIRouter(prefix="/api/groups", tags=["Groups"])

@router.post("/", response_model=GroupResponse, status_code=status.HTTP_201_CREATED)
def create_group(
    group_data: GroupCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    new_group = GroupFactory.create_group(
        group_type=group_data.group_type,
        name=group_data.name,
        description=group_data.description
    )
    
    new_group.members.append(current_user)
    
    db.add(new_group)
    db.commit()
    db.refresh(new_group)
    
    notification_service = NotificationService()
    observer = NotificationObserver(db)
    notification_service.attach(observer)
    notification_service.notify({
        'type': 'group_created',
        'creator_id': current_user.user_id,
        'group_name': new_group.name
    })
    
    return new_group

@router.get("/", response_model=List[GroupResponse])
def get_user_groups(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return current_user.groups

@router.get("/{group_id}", response_model=GroupResponse)
def get_group(
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
    
    return group

@router.post("/{group_id}/members/{user_email}", response_model=GroupResponse)
def add_member(
    group_id: str,
    user_email: str,
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
    
    user_to_add = db.query(User).filter(User.email == user_email).first()
    
    if not user_to_add:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    if user_to_add in group.members:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User is already a member"
        )
    
    group.members.append(user_to_add)
    db.commit()
    db.refresh(group)
    
    notification_service = NotificationService()
    observer = NotificationObserver(db)
    notification_service.attach(observer)
    notification_service.notify({
        'type': 'member_added',
        'user_id': user_to_add.user_id,
        'group_name': group.name
    })
    
    return group

@router.delete("/{group_id}/members/{user_id}", response_model=GroupResponse)
def remove_member(
    group_id: str,
    user_id: str,
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
    
    user_to_remove = db.query(User).filter(User.user_id == user_id).first()
    
    if not user_to_remove or user_to_remove not in group.members:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User is not a member of this group"
        )
    
    group.members.remove(user_to_remove)
    db.commit()
    db.refresh(group)
    
    return group
