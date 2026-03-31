from abc import ABC, abstractmethod
from app.models import Group
from datetime import datetime
import uuid

class IGroupFactory(ABC):
    @abstractmethod
    def create_group(self, name: str, description: str) -> Group:
        pass

class TravelGroupFactory(IGroupFactory):
    def create_group(self, name: str, description: str) -> Group:
        return Group(
            group_id=str(uuid.uuid4()),
            name=f"🌍 {name}",
            description=description or "Travel expense group",
            created_at=datetime.utcnow()
        )

class RoommateGroupFactory(IGroupFactory):
    def create_group(self, name: str, description: str) -> Group:
        return Group(
            group_id=str(uuid.uuid4()),
            name=f"🏠 {name}",
            description=description or "Roommate expense group",
            created_at=datetime.utcnow()
        )

class EventGroupFactory(IGroupFactory):
    def create_group(self, name: str, description: str) -> Group:
        return Group(
            group_id=str(uuid.uuid4()),
            name=f"🎉 {name}",
            description=description or "Event expense group",
            created_at=datetime.utcnow()
        )

class GeneralGroupFactory(IGroupFactory):
    def create_group(self, name: str, description: str) -> Group:
        return Group(
            group_id=str(uuid.uuid4()),
            name=name,
            description=description or "General expense group",
            created_at=datetime.utcnow()
        )

class GroupFactory:
    _factories = {
        'travel': TravelGroupFactory(),
        'roommate': RoommateGroupFactory(),
        'event': EventGroupFactory(),
        'general': GeneralGroupFactory()
    }
    
    @classmethod
    def create_group(cls, group_type: str, name: str, description: str = "") -> Group:
        factory = cls._factories.get(group_type.lower(), cls._factories['general'])
        return factory.create_group(name, description)
