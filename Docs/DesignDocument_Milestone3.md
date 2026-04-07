# Design Document - Milestone 3
## SplitZilla - Collaborative Expense Splitting Application

**Team Members:** Gaurav Bakale, Yu-Tzu Li, Rahul Sharma, Karan Srinivas  
**Date:** April 7, 2026

---

## 1. Design Patterns Used

### 1.1 Strategy Pattern
**Problem Solved:** Different expense splitting methods require different calculation algorithms. Hard-coding each method would violate the Open/Closed Principle and make the system inflexible when adding new splitting strategies.

**Solution:** The Strategy pattern allows runtime selection of splitting algorithms (Equal, Percentage, Exact Amount) without modifying the expense calculation logic. New strategies can be added by implementing the `ISplitStrategy` interface.

**Implementation:**
- `ISplitStrategy` interface defines the contract for all splitting strategies
- Concrete implementations: `EqualSplitStrategy`, `PercentageSplitStrategy`, `ExactAmountSplitStrategy`
- `SplitStrategyFactory` provides strategy instances based on split type
- Used in expense creation to calculate individual member shares

**Benefits:**
- Easy to add new splitting strategies
- Each strategy is independently testable
- Follows Single Responsibility Principle

---

### 1.2 Observer Pattern
**Problem Solved:** Group members need real-time notifications when expenses are added, members join groups, or other relevant events occur. Tight coupling between event sources and notification handlers would make the system rigid and difficult to extend.

**Solution:** The Observer pattern decouples event producers from consumers, allowing multiple observers to react to system events independently. New observers can be added without modifying existing code.

**Implementation:**
- `IObserver` interface defines the update contract
- `NotificationObserver` implements the observer to create database notifications
- `NotificationService` singleton manages observer registration and event broadcasting
- Events: expense_added, member_added, group_created

**Benefits:**
- Loose coupling between event sources and handlers
- Multiple observers can respond to the same event
- Easy to add new notification channels (email, SMS, etc.)

---

### 1.3 Factory Pattern
**Problem Solved:** Creating different types of groups (Travel, Roommate, Event, General) with specific configurations requires flexible object creation without exposing instantiation logic to clients.

**Solution:** The Factory pattern encapsulates group creation logic and allows adding new group types without modifying client code. Each factory handles type-specific initialization.

**Implementation:**
- `IGroupFactory` interface defines group creation contract
- Concrete factories: `TravelGroupFactory`, `RoommateGroupFactory`, `EventGroupFactory`, `GeneralGroupFactory`
- `GroupFactory` class provides a unified interface to access all factory types
- Each factory adds type-specific prefixes (emojis) and default descriptions

**Benefits:**
- Centralized group creation logic
- Easy to add new group types
- Consistent group initialization

---

### 1.4 Singleton Pattern
**Problem Solved:** Multiple service instances would cause resource wastage, inconsistent state management, and potential race conditions in shared resources.

**Solution:** The Singleton pattern ensures only one instance of critical resources exists throughout the application lifecycle, providing a global point of access.

**Implementation:**
- `NotificationService` singleton manages observer registration
- `CommandManager` singleton maintains command history for undo/redo operations
- Implemented via Spring Framework's dependency injection (@Service annotation)
- Spring ensures singleton scope by default for all beans

**Benefits:**
- Controlled access to shared resources
- Consistent state across the application
- Memory efficiency

---

### 1.5 Command Pattern
**Problem Solved:** Users need the ability to undo/redo expense operations. Without encapsulation, implementing reversible operations would require complex state management and tight coupling.

**Solution:** The Command pattern encapsulates operations as objects with reversible actions, enabling undo/redo functionality and maintaining operation history.

**Implementation:**
- `ICommand` interface with `execute()` and `undo()` methods
- `AddExpenseCommand` and `DeleteExpenseCommand` concrete implementations
- `CommandManager` singleton maintains command history and redo stack
- Supports full undo/redo of expense operations

**Benefits:**
- Operations can be undone and redone
- Command history provides audit trail
- Easy to add new reversible operations

---

### 1.6 State Pattern (NEW in Milestone 3)
**Problem Solved:** Settlement objects transition through multiple states (Pending → Partial → Completed), and each state has different behavior for payment processing. Using conditional logic would create complex, hard-to-maintain code.

**Solution:** The State pattern encapsulates state-specific behavior in separate classes, allowing the settlement object to change behavior when its state changes. Each state handles payment validation and transitions independently.

**Implementation:**
- `SettlementState` interface defines state behavior contract
- Concrete states: `PendingSettlementState`, `PartialSettlementState`, `CompletedSettlementState`
- `SettlementStateFactory` provides state instances based on current status
- Each state validates payments and determines the next state
- Automatic state transitions based on payment amounts

**Benefits:**
- State-specific logic is isolated and maintainable
- New states can be added without modifying existing states
- State transitions are explicit and traceable
- Eliminates complex conditional logic

**Example Flow:**
1. Settlement created in PENDING state with $100 owed
2. User pays $30 → State transitions to PARTIAL
3. User pays $70 → State transitions to COMPLETED
4. Further payments rejected by COMPLETED state

---

### 1.7 Builder Pattern (NEW in Milestone 3)
**Problem Solved:** Settlement responses contain complex nested data structures (balances, plans, settlements, metrics). Constructing these responses with multiple optional fields leads to telescoping constructors and unclear code.

**Solution:** The Builder pattern provides a fluent interface for constructing complex objects step-by-step, making the construction process clear and flexible.

**Implementation:**
- `SettlementOverviewBuilder` constructs settlement overview responses
- `SettlementResponseBuilder` constructs individual settlement responses
- Fluent API with method chaining
- Optional fields can be added in any order
- Immutable result objects

**Benefits:**
- Clear, readable object construction
- Flexible - can build objects with different combinations of fields
- Separates construction logic from representation
- Easy to add new fields without breaking existing code

**Example Usage:**
```java
Map<String, Object> overview = new SettlementOverviewBuilder()
    .withBalances(balanceList)
    .withRecommendedPlan(suggestions)
    .withActiveSettlements(activeSettlements)
    .withMetrics(metrics)
    .build();
```

---

## 2. System Architecture

### 2.1 High-Level Architecture

The system follows a **three-tier architecture** with clear separation of concerns:

**1. Presentation Layer (Frontend - React)**
- Single-page application built with React 18.2.0
- Communicates with backend via RESTful API over HTTP/HTTPS
- Manages UI state using React Context API
- Handles JWT token storage and authentication
- Responsive design with TailwindCSS

**2. Application Layer (Backend - Spring Boot)**
- RESTful API server built with Spring Boot 3.2.0
- Implements all business logic and design patterns
- Handles authentication and authorization with Spring Security
- Processes requests and returns JSON responses
- Stateless architecture for scalability

**3. Data Layer (Database - H2/PostgreSQL)**
- H2 in-memory database for development
- PostgreSQL for production deployment
- Spring Data JPA with Hibernate for ORM
- Stores users, groups, expenses, splits, settlements, and notifications
- Automatic schema generation and migration

### 2.2 Data Flow

**User Registration/Login:**
```
Frontend → POST /api/auth/register → Backend validates input → 
Hash password with bcrypt → Store in database → Return user data

Frontend → POST /api/auth/login → Backend validates credentials → 
Generate JWT token → Return token → Frontend stores in localStorage
```

**Creating a Group:**
```
Frontend → POST /api/groups/ → Backend authenticates JWT → 
GroupFactory creates group based on type → Save to database → 
NotificationService notifies members → Return group data
```

**Adding an Expense:**
```
Frontend → POST /api/expenses/ → Backend authenticates JWT → 
SplitStrategyFactory selects strategy → Calculate splits → 
CommandManager executes AddExpenseCommand → Save to database → 
NotificationService notifies members → Return expense data
```

**Recording a Settlement Payment:**
```
Frontend → POST /api/settlements/{id}/payments → Backend authenticates → 
SettlementStateFactory gets current state → State validates payment → 
State applies payment and transitions → Save to database → 
Return updated settlement
```

**Filtering Expenses:**
```
Frontend → GET /api/expenses/group/{id}/filter?params → 
Backend authenticates → ExpenseService filters by criteria → 
Return filtered expense list
```

**Exporting to CSV:**
```
Frontend → GET /api/expenses/group/{id}/export/csv → 
Backend authenticates → ExpenseService generates CSV → 
Return CSV file with proper headers
```

### 2.3 Component Interaction

**Component Flow:**
1. **Frontend** calls **Backend API** via HTTP/REST with JWT token
2. **JwtAuthFilter** validates token and extracts user identity
3. **Controllers** receive requests and delegate to **Services**
4. **Services** implement business logic using **Design Patterns**:
   - **GroupFactory** creates groups
   - **SplitStrategyFactory** provides splitting strategies
   - **CommandManager** executes reversible operations
   - **NotificationService** broadcasts events
   - **SettlementStateFactory** manages settlement states
   - **Builders** construct complex responses
5. **Repositories** interact with **Database** via JPA
6. **NotificationObserver** listens to events and creates notifications
7. **Controllers** return JSON responses to **Frontend**

---

## 3. Component/Service Breakdown

### 3.1 Authentication Service
**Purpose:** Manages user registration, login, and JWT token generation.

**Design Patterns Used:**
- None directly, but uses secure password hashing (bcrypt) and JWT tokens

**Key Functions:**
- User registration with email validation
- Password hashing with bcrypt (10 rounds)
- JWT token generation with 24-hour expiration
- Token validation and user extraction
- Protected route middleware

**Security Features:**
- Password strength validation
- Email uniqueness enforcement
- Secure token storage
- CORS configuration

---

### 3.2 Group Service
**Purpose:** Manages group creation, member management, and group queries.

**Design Patterns Used:**
- **Factory Pattern:** Creates different group types with specific configurations
- **Observer Pattern:** Notifies users when groups are created or members are added

**Key Functions:**
- Create groups using GroupFactory (Travel, Roommate, Event, General)
- Add members to groups with email lookup
- Remove members from groups
- List user's groups with member details
- Get group details with full member list

**Business Rules:**
- Group creator automatically becomes a member
- Email must exist in system to add member
- Cannot remove last member from group

---

### 3.3 Expense Service
**Purpose:** Manages expense creation, filtering, balance calculation, and data export.

**Design Patterns Used:**
- **Strategy Pattern:** Selects and applies splitting algorithms
- **Command Pattern:** Enables undo/redo of expense operations
- **Observer Pattern:** Notifies group members when expenses are added

**Key Functions:**
- Create expenses with different split types (equal, percentage, exact)
- Filter expenses by search term, member, date range, and amount range
- Calculate group balances considering all expenses
- Export expenses to CSV format
- Generate group summary statistics
- Delete expenses
- Undo/redo expense operations
- List group expenses sorted by date

**Business Rules:**
- Expense amount must be positive
- Split amounts must sum to total expense amount
- Only group members can create expenses
- Balances calculated as: paid - owed

---

### 3.4 Settlement Service
**Purpose:** Manages settlement plan creation, payment recording, and settlement tracking.

**Design Patterns Used:**
- **State Pattern:** Manages settlement status transitions
- **Builder Pattern:** Constructs complex settlement responses
- **Observer Pattern:** Can notify users of settlement events

**Key Functions:**
- Calculate optimized settlement plan (minimize transactions)
- Create settlement plans from current balances
- Record payments with state transitions
- Track active and completed settlements
- Generate settlement overview with metrics
- Validate payment amounts and prevent overpayment

**Business Rules:**
- Settlement plan uses greedy algorithm to minimize transactions
- Payments must be positive and not exceed outstanding amount
- State transitions: Pending → Partial → Completed
- Completed settlements cannot accept more payments
- Only one active settlement plan allowed at a time

**Algorithm:** Greedy debt minimization
1. Separate members into creditors (owed money) and debtors (owe money)
2. Sort both lists by amount (descending)
3. Match largest debtor with largest creditor
4. Create settlement for minimum of both amounts
5. Update remaining amounts and repeat

---

### 3.5 Notification Service
**Purpose:** Manages real-time notifications for users about group activities.

**Design Patterns Used:**
- **Observer Pattern:** Implements the observer/subject relationship
- **Singleton Pattern:** Ensures single notification service instance

**Key Functions:**
- Attach/detach observers dynamically
- Broadcast events to all registered observers
- Store notifications in database
- Mark notifications as read
- Retrieve user notifications sorted by date

**Event Types:**
- expense_added: New expense created in group
- member_added: New member joined group
- group_created: New group created
- settlement_created: Settlement plan generated

---

### 3.6 User Service (NEW in Milestone 3)
**Purpose:** Manages user profile information and account settings.

**Design Patterns Used:**
- None directly, but follows service layer pattern

**Key Functions:**
- Retrieve user profile information
- Update user name and email
- Change password with current password verification
- Validate email uniqueness
- Enforce password requirements (minimum 6 characters)

**Security Features:**
- Current password verification before changes
- Password strength validation
- Email uniqueness check
- Secure password hashing with bcrypt

---

## 4. Technology Stack

### 4.1 Backend Technologies
- **Framework:** Spring Boot 3.2.0 - Enterprise Java framework for building REST APIs
- **Language:** Java 17 - Long-term support version with modern features
- **Database:** H2 (development) / PostgreSQL (production)
- **ORM:** Spring Data JPA with Hibernate - Object-relational mapping
- **Authentication:** Spring Security with JWT - Stateless authentication
- **Password Hashing:** BCrypt - Industry-standard password hashing
- **Build Tool:** Maven 3.9+ - Dependency management and build automation
- **Server:** Embedded Tomcat - Application server
- **Testing:** JUnit 5 + Mockito + Spring Boot Test
- **Monitoring:** Spring Boot Actuator - Health checks and metrics

### 4.2 Frontend Technologies
- **Framework:** React 18.2.0 - Component-based UI library
- **Build Tool:** Vite 5.0.11 - Fast build tool and dev server
- **Routing:** React Router DOM 6.21.1 - Client-side routing
- **HTTP Client:** Axios 1.6.5 - Promise-based HTTP client
- **Styling:** TailwindCSS 3.4.1 - Utility-first CSS framework
- **Icons:** Lucide React 0.309.0 - Beautiful icon library
- **State Management:** React Context API - Built-in state management

### 4.3 Development Tools
- **Version Control:** Git & GitHub - Source code management
- **Testing:** JUnit 5 + Mockito - Unit and integration testing
- **Build Tool:** Maven - Backend build automation
- **Package Manager:** npm - Frontend dependency management
- **Code Quality:** Spring Boot DevTools - Hot reload during development

---

## 5. Database Schema

### 5.1 Tables

**users**
- user_id (PK, VARCHAR(36), UUID)
- name (VARCHAR(255), NOT NULL)
- email (VARCHAR(255), UNIQUE, NOT NULL, INDEXED)
- password (VARCHAR(255), NOT NULL, BCrypt hashed)
- created_at (TIMESTAMP, DEFAULT CURRENT_TIMESTAMP)

**groups**
- group_id (PK, VARCHAR(36), UUID)
- name (VARCHAR(255), NOT NULL)
- description (TEXT, NULLABLE)
- created_at (TIMESTAMP, DEFAULT CURRENT_TIMESTAMP)

**group_members** (Many-to-Many Join Table)
- user_id (FK → users.user_id, ON DELETE CASCADE)
- group_id (FK → groups.group_id, ON DELETE CASCADE)
- PRIMARY KEY (user_id, group_id)

**expenses**
- expense_id (PK, VARCHAR(36), UUID)
- description (VARCHAR(255), NOT NULL)
- amount (DOUBLE, NOT NULL, CHECK > 0)
- paid_by_id (FK → users.user_id, NOT NULL)
- group_id (FK → groups.group_id, ON DELETE CASCADE)
- split_type (VARCHAR(50), NOT NULL, CHECK IN ('equal', 'percentage', 'exact'))
- date (TIMESTAMP, DEFAULT CURRENT_TIMESTAMP)

**expense_splits**
- split_id (PK, VARCHAR(36), UUID)
- expense_id (FK → expenses.expense_id, ON DELETE CASCADE)
- user_id (FK → users.user_id, NOT NULL)
- amount (DOUBLE, NOT NULL, CHECK >= 0)

**settlements** (NEW in Milestone 3)
- settlement_id (PK, VARCHAR(36), UUID)
- group_id (FK → groups.group_id, ON DELETE CASCADE)
- payer_id (FK → users.user_id, NOT NULL)
- payee_id (FK → users.user_id, NOT NULL)
- amount (DOUBLE, NOT NULL, CHECK > 0)
- paid_amount (DOUBLE, DEFAULT 0, CHECK >= 0)
- status (VARCHAR(20), NOT NULL, CHECK IN ('PENDING', 'PARTIAL', 'COMPLETED'))
- created_at (TIMESTAMP, DEFAULT CURRENT_TIMESTAMP)
- last_payment_at (TIMESTAMP, NULLABLE)
- settled_at (TIMESTAMP, NULLABLE)

**notifications**
- notification_id (PK, VARCHAR(36), UUID)
- user_id (FK → users.user_id, ON DELETE CASCADE)
- message (TEXT, NOT NULL)
- is_read (BOOLEAN, DEFAULT FALSE)
- created_at (TIMESTAMP, DEFAULT CURRENT_TIMESTAMP)

### 5.2 Relationships
- User ↔ Group: Many-to-Many (via group_members)
- User → Expense: One-to-Many (as payer)
- Group → Expense: One-to-Many
- Expense → ExpenseSplit: One-to-Many
- User → ExpenseSplit: One-to-Many
- User → Notification: One-to-Many
- Group → Settlement: One-to-Many (NEW)
- User → Settlement: One-to-Many (as payer) (NEW)
- User → Settlement: One-to-Many (as payee) (NEW)

### 5.3 Indexes
- users.email (UNIQUE INDEX) - Fast user lookup
- expenses.group_id (INDEX) - Fast group expense queries
- settlements.group_id (INDEX) - Fast settlement queries
- settlements.status (INDEX) - Fast status filtering
- notifications.user_id (INDEX) - Fast notification retrieval

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
- `GET /api/expenses/group/{group_id}/filter` - Filter expenses (NEW)
- `GET /api/expenses/group/{group_id}/export/csv` - Export to CSV (NEW)
- `GET /api/expenses/group/{group_id}/summary` - Get group summary (NEW)
- `DELETE /api/expenses/{expense_id}` - Delete expense
- `POST /api/expenses/undo` - Undo last operation
- `POST /api/expenses/redo` - Redo last operation
- `GET /api/expenses/balances/group/{group_id}` - Get group balances

### Settlements
- `GET /api/settlements/group/{group_id}` - Get settlement overview
- `POST /api/settlements/group/{group_id}/plans` - Create settlement plan
- `POST /api/settlements/group/{group_id}/record` - Record direct settlement
- `POST /api/settlements/group/{group_id}/{settlement_id}/payments` - Record payment

### User Profile (NEW)
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update profile information
- `PUT /api/users/profile/password` - Change password

### Notifications
- `GET /api/notifications/` - Get user notifications
- `PUT /api/notifications/{notification_id}/read` - Mark as read

---

## 7. Security Considerations

### 7.1 Authentication & Authorization
- **JWT Tokens:** Stateless authentication with 24-hour expiration
- **Password Security:** BCrypt hashing with 10 rounds and salt
- **Protected Routes:** All API endpoints except auth require valid JWT
- **User Verification:** Group membership verified before operations

### 7.2 Data Protection
- **SQL Injection:** Prevented by JPA/Hibernate parameterized queries
- **XSS Prevention:** React automatically escapes output
- **CORS:** Configured for frontend origin only
- **Input Validation:** Spring Validation annotations on all inputs
- **Password Requirements:** Minimum 6 characters enforced

### 7.3 Business Logic Security
- **Authorization Checks:** Users can only access their own groups
- **Amount Validation:** All monetary amounts validated as positive
- **State Validation:** Settlement states prevent invalid operations
- **Email Uniqueness:** Enforced at database level

---

## 8. Scalability Considerations

### 8.1 Current Architecture
- **Stateless Backend:** JWT-based auth enables horizontal scaling
- **Database Connection Pooling:** HikariCP for efficient connections
- **Lazy Loading:** JPA lazy loading for related entities
- **Pagination Ready:** Repository methods support pagination

### 8.2 Future Enhancements
- **Caching:** Redis for session management and frequent queries
- **Load Balancing:** Multiple backend instances with load balancer
- **Database Replication:** Read replicas for query scaling
- **CDN:** Frontend static assets served via CDN
- **Microservices:** Separate services for expenses, settlements, notifications
- **Message Queue:** RabbitMQ/Kafka for async notification processing

---

## 9. Testing Strategy

### 9.1 Unit Tests
- **Design Pattern Tests:** Each pattern has dedicated test class
- **Strategy Pattern:** Tests all splitting algorithms and edge cases
- **Observer Pattern:** Tests observer lifecycle and event broadcasting
- **Factory Pattern:** Tests all group types and default values
- **State Pattern:** Tests all state transitions and validations
- **Builder Pattern:** Tests builder chaining and object construction

### 9.2 Integration Tests
- **Service Layer Tests:** Tests with mocked repositories
- **ExpenseService:** Tests filtering, export, and summary generation
- **Mock Framework:** Mockito for dependency mocking

### 9.3 Test Coverage
- **30+ Test Cases:** Comprehensive coverage of core functionality
- **Edge Cases:** Tests for invalid inputs and boundary conditions
- **State Transitions:** Tests for all valid and invalid state changes

---

## 10. Performance Optimizations

### 10.1 Database
- **Indexes:** Strategic indexes on frequently queried columns
- **Eager vs Lazy Loading:** Optimized fetch strategies
- **Connection Pooling:** HikariCP with optimized pool size
- **Query Optimization:** Efficient JPA queries with proper joins

### 10.2 Application
- **Singleton Services:** Reduced object creation overhead
- **Immutable Objects:** Thread-safe design patterns
- **Stream API:** Efficient collection processing
- **Builder Pattern:** Reduced object creation complexity

### 10.3 Frontend
- **Code Splitting:** React lazy loading for routes
- **Memoization:** React.memo for expensive components
- **Debouncing:** Search input debouncing
- **Optimistic Updates:** Immediate UI feedback

---

*Document Version: 3.0*  
*Last Updated: April 7, 2026*
