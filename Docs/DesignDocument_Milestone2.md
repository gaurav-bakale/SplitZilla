# Design Document - Milestone 2
## SplitZilla - Collaborative Expense Splitting Application

**Team Members:** Gaurav Bakale, Yu-Tzu Li, Rahul Sharma, Karan Srinivas  
**Date:** March 31, 2026

---

## 1. Design Patterns Used

### 1.1 Strategy Pattern
**Problem Solved:** Different expense splitting methods require different calculation algorithms. Hard-coding each method would violate the Open/Closed Principle and make the system inflexible.

**Solution:** The Strategy pattern allows runtime selection of splitting algorithms (Equal, Percentage, Exact Amount) without modifying the expense calculation logic.

**Implementation:**
- `ISplitStrategy` interface defines the contract for all splitting strategies
- Concrete implementations: `EqualSplitStrategy`, `PercentageSplitStrategy`, `ExactAmountSplitStrategy`
- `SplitStrategyFactory` provides strategy instances based on split type
- Used in expense creation to calculate individual member shares

### 1.2 Observer Pattern
**Problem Solved:** Group members need real-time notifications when expenses are added, members join groups, or other relevant events occur. Tight coupling between event sources and notification handlers would make the system rigid.

**Solution:** The Observer pattern decouples event producers from consumers, allowing multiple observers to react to system events independently.

**Implementation:**
- `IObserver` interface defines the update contract
- `NotificationObserver` implements the observer to create database notifications
- `NotificationService` singleton manages observer registration and event broadcasting
- Events: expense_added, member_added, group_created

### 1.3 Factory Pattern
**Problem Solved:** Creating different types of groups (Travel, Roommate, Event, General) with specific configurations requires flexible object creation without exposing instantiation logic.

**Solution:** The Factory pattern encapsulates group creation logic and allows adding new group types without modifying client code.

**Implementation:**
- `IGroupFactory` interface defines group creation contract
- Concrete factories: `TravelGroupFactory`, `RoommateGroupFactory`, `EventGroupFactory`, `GeneralGroupFactory`
- `GroupFactory` class provides a unified interface to access all factory types
- Each factory adds type-specific prefixes and default descriptions

### 1.4 Singleton Pattern
**Problem Solved:** Multiple service instances would cause resource wastage and inconsistent state management.

**Solution:** The Singleton pattern ensures only one instance of critical resources exists throughout the application lifecycle.

**Implementation:**
- `NotificationService` singleton manages observer registration
- `CommandManager` singleton maintains command history for undo/redo operations
- Implemented via Spring Framework's dependency injection (@Service annotation)
- Spring ensures singleton scope by default for all beans

### 1.5 Command Pattern
**Problem Solved:** Users need the ability to undo/redo expense operations, requiring encapsulation of operations as objects with reversible actions.

**Solution:** The Command pattern encapsulates operations as objects, enabling undo/redo functionality and maintaining operation history.

**Implementation:**
- `ICommand` interface with `execute()` and `undo()` methods
- `AddExpenseCommand` and `DeleteExpenseCommand` concrete implementations
- `CommandManager` singleton maintains command history and redo stack
- Supports full undo/redo of expense operations

---

## 2. System Architecture

### 2.1 High-Level Architecture

The system follows a **three-tier architecture**:

1. **Presentation Layer (Frontend)**
   - React.js single-page application
   - Communicates with backend via REST API
   - Manages UI state using React Context API
   - Handles user authentication tokens

2. **Application Layer (Backend)**
   - Spring Boot REST API server
   - Implements business logic and design patterns
   - Handles authentication and authorization with Spring Security
   - Processes requests and returns JSON responses

3. **Data Layer (Database)**
   - H2 database (development) / PostgreSQL (production)
   - Spring Data JPA with Hibernate for database operations
   - Stores users, groups, expenses, splits, and notifications

### 2.2 Data Flow

**User Registration/Login:**
```
Frontend → POST /api/auth/register → Backend validates → Hash password → Store in DB → Return user data
Frontend → POST /api/auth/login → Backend validates → Generate JWT token → Return token → Frontend stores token
```

**Creating a Group:**
```
Frontend → POST /api/groups/ → Backend authenticates user → GroupFactory creates group → Save to DB → NotificationService notifies → Return group data
```

**Adding an Expense:**
```
Frontend → POST /api/expenses/ → Backend authenticates → SplitStrategyFactory selects strategy → Calculate splits → CommandManager executes AddExpenseCommand → Save to DB → NotificationService notifies members → Return expense data
```

**Viewing Balances:**
```
Frontend → GET /api/expenses/balances/group/{id} → Backend authenticates → Query all expenses → Calculate net balances → Return balance summary
```

### 2.3 Component Interaction

- **Frontend** calls **Backend API** via HTTP/REST
- **Backend** uses **DatabaseManager** (Singleton) to get database sessions
- **Backend** uses **GroupFactory** to create groups
- **Backend** uses **SplitStrategyFactory** to get splitting strategies
- **Backend** uses **CommandManager** to execute reversible operations
- **Backend** uses **NotificationService** to broadcast events
- **NotificationObserver** listens to events and creates notifications in DB
- **Database** persists all application data

---

## 3. Component/Service Breakdown

### 3.1 Authentication Service
**Purpose:** Manages user registration, login, and JWT token generation.

**Design Patterns Used:**
- None directly, but uses secure password hashing (bcrypt) and JWT tokens

**Key Functions:**
- User registration with email validation
- Password hashing and verification
- JWT token generation and validation
- Protected route middleware

### 3.2 Group Service
**Purpose:** Manages group creation, member management, and group queries.

**Design Patterns Used:**
- **Factory Pattern:** Creates different group types (Travel, Roommate, Event, General)
- **Observer Pattern:** Notifies users when groups are created or members are added

**Key Functions:**
- Create groups using GroupFactory
- Add/remove members
- List user's groups
- Get group details

### 3.3 Expense Service
**Purpose:** Manages expense creation, deletion, balance calculation, and undo/redo operations.

**Design Patterns Used:**
- **Strategy Pattern:** Selects and applies splitting algorithms
- **Command Pattern:** Enables undo/redo of expense operations
- **Observer Pattern:** Notifies group members when expenses are added

**Key Functions:**
- Create expenses with different split types
- Delete expenses
- Calculate group balances
- Undo/redo expense operations
- List group expenses

### 3.4 Notification Service
**Purpose:** Manages real-time notifications for users about group activities.

**Design Patterns Used:**
- **Observer Pattern:** Implements the observer/subject relationship
- **Singleton Pattern:** Ensures single notification service instance

**Key Functions:**
- Attach/detach observers
- Broadcast events to observers
- Store notifications in database
- Mark notifications as read

### 3.5 Database Service
**Purpose:** Manages database connections and session lifecycle.

**Design Patterns Used:**
- **Singleton Pattern:** Ensures single database connection manager

**Key Functions:**
- Create and manage database engine
- Provide database sessions
- Initialize database tables

---

## 4. Technology Stack

### 4.1 Backend Technologies
- **Framework:** FastAPI 0.109.0 - Modern, fast web framework for building APIs
- **Database:** SQLite (development) / PostgreSQL (production)
- **ORM:** SQLAlchemy 2.0.25 - SQL toolkit and ORM
- **Authentication:** 
  - python-jose 3.3.0 - JWT token generation
  - passlib 1.7.4 - Password hashing with bcrypt
- **Server:** Uvicorn 0.27.0 - ASGI server
- **Validation:** Pydantic 2.5.3 - Data validation using Python type hints

### 4.2 Frontend Technologies
- **Framework:** React 18.2.0 - Component-based UI library
- **Build Tool:** Vite 5.0.11 - Fast build tool and dev server
- **Routing:** React Router DOM 6.21.1 - Client-side routing
- **HTTP Client:** Axios 1.6.5 - Promise-based HTTP client
- **Styling:** TailwindCSS 3.4.1 - Utility-first CSS framework
- **Icons:** Lucide React 0.309.0 - Beautiful icon library

### 4.3 Development Tools
- **Version Control:** Git & GitHub
- **API Documentation:** FastAPI automatic OpenAPI/Swagger documentation
- **Testing:** Pytest (backend), Jest (frontend) - planned for Milestone 3
- **Environment Management:** Python dotenv, Node.js package.json

---

## 5. Database Schema

### 5.1 Tables

**users**
- user_id (PK, String, UUID)
- name (String)
- email (String, Unique, Indexed)
- password (String, Hashed)
- created_at (DateTime)

**groups**
- group_id (PK, String, UUID)
- name (String)
- description (String, Optional)
- created_at (DateTime)

**group_members** (Many-to-Many Association)
- user_id (FK → users.user_id)
- group_id (FK → groups.group_id)

**expenses**
- expense_id (PK, String, UUID)
- description (String)
- amount (Float)
- paid_by_id (FK → users.user_id)
- group_id (FK → groups.group_id)
- split_type (String: equal/percentage/exact)
- date (DateTime)

**expense_splits**
- split_id (PK, String, UUID)
- expense_id (FK → expenses.expense_id)
- user_id (FK → users.user_id)
- amount (Float)

**notifications**
- notification_id (PK, String, UUID)
- user_id (FK → users.user_id)
- message (String)
- is_read (Integer: 0/1)
- created_at (DateTime)

### 5.2 Relationships
- User ↔ Group: Many-to-Many (via group_members)
- User → Expense: One-to-Many (as payer)
- Group → Expense: One-to-Many
- Expense → ExpenseSplit: One-to-Many
- User → Notification: One-to-Many

---

## 6. API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login and get JWT token

### Groups
- `GET /api/groups/` - Get all user's groups
- `POST /api/groups/` - Create new group
- `GET /api/groups/{group_id}` - Get group details
- `POST /api/groups/{group_id}/members/{user_email}` - Add member
- `DELETE /api/groups/{group_id}/members/{user_id}` - Remove member

### Expenses
- `POST /api/expenses/` - Create expense
- `GET /api/expenses/group/{group_id}` - Get group expenses
- `DELETE /api/expenses/{expense_id}` - Delete expense
- `POST /api/expenses/undo` - Undo last operation
- `POST /api/expenses/redo` - Redo last operation
- `GET /api/expenses/balances/group/{group_id}` - Get group balances

### Notifications
- `GET /api/notifications/` - Get user notifications
- `PUT /api/notifications/{notification_id}/read` - Mark as read

---

## 7. Security Considerations

- **Password Security:** Bcrypt hashing with salt
- **Authentication:** JWT tokens with expiration
- **Authorization:** Protected routes verify user membership
- **CORS:** Configured for frontend origin
- **SQL Injection:** Prevented by SQLAlchemy ORM
- **Input Validation:** Pydantic schemas validate all inputs

---

## 8. Scalability Considerations

- **Database:** Can migrate from SQLite to PostgreSQL for production
- **Caching:** Redis can be added for session management
- **Load Balancing:** FastAPI supports multiple worker processes
- **Microservices:** Services can be separated if needed
- **CDN:** Frontend static assets can be served via CDN

---

*Document Version: 1.0*  
*Last Updated: March 31, 2026*
