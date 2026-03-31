# Milestone 2 Update Document
## SplitZilla - Collaborative Expense Splitting Application

---

## Project Group Information
**Group Members:**
- Gaurav Bakale
- Yu-Tzu Li
- Rahul Sharma
- Karan Srinivas

---

## Project Topic/Name
**SplitZilla - Collaborative Expense Splitting Application**

---

## Tech Stack

### Backend
- **Framework:** Python + FastAPI
- **Database:** SQLite (development) / PostgreSQL (production-ready)
- **ORM:** SQLAlchemy
- **Authentication:** JWT (JSON Web Tokens) with bcrypt password hashing
- **API Style:** RESTful API with automatic OpenAPI documentation

### Frontend
- **Framework:** React.js with Vite
- **UI Library:** TailwindCSS for styling
- **State Management:** React Context API
- **HTTP Client:** Axios
- **Icons:** Lucide React

### Additional Tools
- **Version Control:** Git & GitHub
- **API Documentation:** Swagger/OpenAPI (built-in with FastAPI)
- **Testing:** Pytest (backend), Jest (frontend) - planned for Milestone 3

---

## Functionalities Implemented for Milestone 2

### 1. User Management System ✅
- User registration with email validation
- User login with JWT authentication
- Secure password hashing using bcrypt
- Protected routes with JWT token verification

### 2. Group Management ✅
- Create new groups with name, description, and type (Travel, Roommate, Event, General)
- Add members to groups by email
- Remove members from groups
- View all groups a user belongs to
- View group details with member list
- **Factory Pattern** used for creating different group types

### 3. Expense Management ✅
- Add expenses with description, amount, and payer information
- Implemented 3 splitting strategies using **Strategy Pattern**:
  - **Equal Split:** Divide equally among all members
  - **Percentage Split:** Custom percentage for each member
  - **Exact Amount Split:** Specify exact amount per member
- View all expenses within a group
- Delete expenses with **Command Pattern** for undo/redo
- Undo/redo functionality for expense operations

### 4. Balance Calculation Engine ✅
- Calculate individual balances (who owes whom)
- Display net balance for each member in a group
- Real-time balance updates when expenses are added/removed

### 5. Notification System ✅
- **Observer Pattern** implementation for real-time notifications
- Notifications when:
  - User is added to a group
  - New expense is created in user's group
  - Group is created
- View all notifications
- Mark notifications as read

### 6. Transaction History ✅
- View chronological list of all expenses in a group
- Expenses sorted by date (most recent first)
- Display expense details including payer, amount, and split type

---

## Design Patterns Implemented (with Code Snippets)

### 1. Strategy Pattern

**Purpose:** Implement different expense splitting algorithms

**Code Snippet:**
```python
# Interface
class ISplitStrategy(ABC):
    @abstractmethod
    def split(self, amount: float, members: List[str], **kwargs) -> Dict[str, float]:
        pass

# Concrete Strategy - Equal Split
class EqualSplitStrategy(ISplitStrategy):
    def split(self, amount: float, members: List[str], **kwargs) -> Dict[str, float]:
        if not members:
            return {}
        per_person = amount / len(members)
        return {member: per_person for member in members}

# Concrete Strategy - Percentage Split
class PercentageSplitStrategy(ISplitStrategy):
    def split(self, amount: float, members: List[str], **kwargs) -> Dict[str, float]:
        percentages = kwargs.get('percentages', {})
        if abs(sum(percentages.values()) - 100.0) > 0.01:
            raise ValueError(f"Percentages must sum to 100")
        return {member: (amount * percentages.get(member, 0) / 100.0) for member in members}

# Factory for Strategy Selection
class SplitStrategyFactory:
    _strategies = {
        'equal': EqualSplitStrategy(),
        'percentage': PercentageSplitStrategy(),
        'exact': ExactAmountSplitStrategy()
    }
    
    @classmethod
    def get_strategy(cls, split_type: str) -> ISplitStrategy:
        return cls._strategies.get(split_type.lower())
```

**Usage in Expense Creation:**
```python
strategy = SplitStrategyFactory.get_strategy(expense_data.split_type)
splits = strategy.split(expense_data.amount, member_ids, **kwargs)
```

---

### 2. Observer Pattern

**Purpose:** Notify group members of events in real-time

**Code Snippet:**
```python
# Observer Interface
class IObserver(ABC):
    @abstractmethod
    def update(self, event: Dict[str, Any]):
        pass

# Concrete Observer
class NotificationObserver(IObserver):
    def __init__(self, db: Session):
        self.db = db
    
    def update(self, event: Dict[str, Any]):
        event_type = event.get('type')
        if event_type == 'expense_added':
            self._handle_expense_added(event)
        elif event_type == 'member_added':
            self._handle_member_added(event)
    
    def _handle_expense_added(self, event: Dict[str, Any]):
        group_members = event.get('group_members', [])
        for member_id in group_members:
            notification = Notification(
                user_id=member_id,
                message=f"{event['payer_name']} added expense '{event['expense_description']}'"
            )
            self.db.add(notification)
        self.db.commit()

# Subject (Singleton)
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
    
    def notify(self, event: Dict[str, Any]):
        for observer in self.observers:
            observer.update(event)
```

**Usage:**
```python
notification_service = NotificationService()
observer = NotificationObserver(db)
notification_service.attach(observer)
notification_service.notify({
    'type': 'expense_added',
    'group_members': member_ids,
    'payer_name': current_user.name,
    'amount': expense_data.amount
})
```

---

### 3. Factory Pattern

**Purpose:** Create different types of groups dynamically

**Code Snippet:**
```python
# Factory Interface
class IGroupFactory(ABC):
    @abstractmethod
    def create_group(self, name: str, description: str) -> Group:
        pass

# Concrete Factories
class TravelGroupFactory(IGroupFactory):
    def create_group(self, name: str, description: str) -> Group:
        return Group(
            name=f"🌍 {name}",
            description=description or "Travel expense group"
        )

class RoommateGroupFactory(IGroupFactory):
    def create_group(self, name: str, description: str) -> Group:
        return Group(
            name=f"🏠 {name}",
            description=description or "Roommate expense group"
        )

# Main Factory
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
```

**Usage:**
```python
new_group = GroupFactory.create_group(
    group_type="travel",
    name="Europe Trip 2026",
    description="Summer vacation expenses"
)
```

---

### 4. Singleton Pattern

**Purpose:** Ensure single instance of critical resources

**Code Snippet:**
```python
# Database Manager Singleton
class DatabaseManager:
    _instance = None
    _engine = None
    _session_local = None
    
    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(DatabaseManager, cls).__new__(cls)
            cls._engine = create_engine(settings.database_url)
            cls._session_local = sessionmaker(bind=cls._engine)
        return cls._instance
    
    def get_session(self) -> Session:
        return self._session_local()

# Notification Service Singleton (shown in Observer Pattern)
# Command Manager Singleton (shown in Command Pattern)
```

**Usage:**
```python
db_manager = DatabaseManager()  # Always returns same instance
db = db_manager.get_session()
```

---

### 5. Command Pattern

**Purpose:** Enable undo/redo functionality for expense operations

**Code Snippet:**
```python
# Command Interface
class ICommand(ABC):
    @abstractmethod
    def execute(self):
        pass
    
    @abstractmethod
    def undo(self):
        pass

# Concrete Command - Add Expense
class AddExpenseCommand(ICommand):
    def __init__(self, db: Session, expense_data: dict, splits_data: List[dict]):
        self.db = db
        self.expense_data = expense_data
        self.splits_data = splits_data
        self.expense_id: Optional[str] = None
    
    def execute(self):
        expense = Expense(**self.expense_data)
        self.db.add(expense)
        self.db.flush()
        self.expense_id = expense.expense_id
        
        for split_data in self.splits_data:
            split = ExpenseSplit(expense_id=self.expense_id, **split_data)
            self.db.add(split)
        
        self.db.commit()
        return self.expense_id
    
    def undo(self):
        if self.expense_id:
            expense = self.db.query(Expense).filter(
                Expense.expense_id == self.expense_id
            ).first()
            if expense:
                self.db.delete(expense)
                self.db.commit()

# Command Manager (Singleton)
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
```

**Usage:**
```python
command_manager = CommandManager()
add_command = AddExpenseCommand(db, expense_dict, splits_data)
expense_id = command_manager.execute(add_command)

# Later, undo the operation
command_manager.undo()

# Redo if needed
command_manager.redo()
```

---

## Functionalities Planned for Milestone 3

1. **Advanced Balance Settlement**
   - Simplified debt calculation (minimize number of transactions)
   - Payment recording and settlement tracking
   - Payment history

2. **Expense Filtering and Search**
   - Filter expenses by date range
   - Filter by member
   - Filter by amount range
   - Search expenses by description

3. **Data Export**
   - Export expense history to CSV
   - Export group summary reports
   - PDF report generation

4. **Enhanced Notifications**
   - Email notifications (optional)
   - Notification preferences
   - Bulk notification management

5. **Testing Suite**
   - Unit tests for all design patterns
   - Integration tests for API endpoints
   - Frontend component tests
   - End-to-end testing

6. **Performance Optimization**
   - Database query optimization
   - Caching implementation
   - Frontend lazy loading

7. **User Profile Management**
   - Update profile information
   - Change password
   - Profile picture upload

---

## Team Contributions

| Team Member        | Contribution                                                                                              |
|--------------------|-----------------------------------------------------------------------------------------------------------|
| **Gaurav Bakale**  | Backend API development, Strategy pattern implementation, Expense splitting logic, API documentation      |
| **Yu-Tzu Li**      | Frontend React components, UI/UX design with TailwindCSS, Dashboard and Groups pages, Authentication UI  |
| **Rahul Sharma**   | Database schema design, Observer pattern implementation, Factory pattern, Notification system             |
| **Karan Srinivas** | Authentication system with JWT, Command pattern implementation, Singleton patterns, Undo/Redo functionality |

---

## GitHub Repository

**Repository URL:** [To be added - Private repository]

**Collaborators Added:**
- vaibhavsingh97
- saishreyakondagari

---

## Project Timeline

- **Milestone 1:** Project specification and initial setup ✅
- **Milestone 2:** Core functionalities implementation with all 5 design patterns ✅
- **Milestone 3:** Advanced features, testing, optimization, and final documentation (In Progress)

---

*Document Version: 2.0*  
*Last Updated: March 31, 2026*
