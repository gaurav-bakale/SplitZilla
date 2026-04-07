# Milestone 3 Update Document
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
- **Framework:** Java 17 + Spring Boot 3.2.0
- **Database:** H2 (development) / PostgreSQL (production-ready)
- **ORM:** Spring Data JPA with Hibernate
- **Authentication:** Spring Security with JWT (JSON Web Tokens)
- **API Style:** RESTful API with Spring MVC
- **Build Tool:** Maven
- **Testing:** JUnit 5 + Mockito + Spring Boot Test

### Frontend
- **Framework:** React.js 18.2.0 with Vite
- **UI Library:** TailwindCSS for styling
- **State Management:** React Context API
- **HTTP Client:** Axios
- **Icons:** Lucide React
- **Routing:** React Router DOM

### Additional Tools
- **Version Control:** Git & GitHub
- **Testing:** JUnit 5 + Spring Boot Test (backend)
- **Performance:** Spring Boot Actuator for monitoring

---

## Functionalities Implemented for Milestone 3

### 1. Advanced Balance Settlement System ✅
- **Settlement Plan Creation:** Optimized debt minimization algorithm that reduces the number of transactions needed
- **Payment Recording:** Track partial and full payments with state transitions
- **Settlement State Management:** Automatic state transitions (Pending → Partial → Completed)
- **Settlement Overview:** Comprehensive dashboard showing active settlements, completed settlements, and metrics
- **Settlement History:** View all past settlements with timestamps

### 2. Expense Filtering and Search ✅
- **Text Search:** Search expenses by description with case-insensitive matching
- **Member Filter:** Filter expenses by specific group members (payer or participant)
- **Date Range Filter:** Filter expenses between start and end dates
- **Amount Range Filter:** Filter by minimum and maximum expense amounts
- **Combined Filters:** Apply multiple filters simultaneously for precise results
- **Filter UI:** Intuitive filter panel with real-time search capabilities

### 3. Data Export ✅
- **CSV Export:** Export complete expense history to CSV format
- **Formatted Data:** Includes date, description, amount, payer, split type, and member breakdowns
- **Group Summary:** Generate comprehensive group statistics including:
  - Total expenses count
  - Total amount spent
  - Expenses by member
  - Expenses by split type
  - Member count
- **Download Functionality:** One-click download from frontend

### 4. User Profile Management ✅
- **View Profile:** Display user information (name, email, join date)
- **Update Profile:** Edit name and email address
- **Change Password:** Secure password change with current password verification
- **Email Validation:** Prevent duplicate email addresses
- **Password Requirements:** Minimum 6 characters with bcrypt hashing
- **Profile UI:** Clean, modern interface for profile management

### 5. Comprehensive Testing Suite ✅
- **Strategy Pattern Tests:** Unit tests for all three splitting strategies (Equal, Percentage, Exact)
- **Observer Pattern Tests:** Tests for observer attachment, detachment, and notification broadcasting
- **Factory Pattern Tests:** Tests for all group types (Travel, Roommate, Event, General)
- **State Pattern Tests:** Tests for settlement state transitions and payment validation
- **Builder Pattern Tests:** Tests for settlement response and overview builders
- **Service Layer Tests:** Integration tests for ExpenseService with mocked dependencies
- **Test Coverage:** 6 comprehensive test classes with 30+ test cases

### 6. Enhanced Notification System (From Milestone 2) ✅
- Real-time notifications for group activities
- Notification read/unread status tracking
- Notification history view

### 7. Transaction History (From Milestone 2) ✅
- Chronological expense listing
- Detailed expense information display
- Sorted by most recent first

---

## Design Patterns Implemented (with Code Snippets)

### 1. Strategy Pattern
**Purpose:** Implement different expense splitting algorithms

**Code Snippet:**
```java
// Interface
public interface ISplitStrategy {
    Map<String, Double> split(Double amount, List<String> members, Map<String, Object> params);
}

// Concrete Strategy - Equal Split
@Component
public class EqualSplitStrategy implements ISplitStrategy {
    @Override
    public Map<String, Double> split(Double amount, List<String> members, Map<String, Object> params) {
        double perPerson = amount / members.size();
        return members.stream()
            .collect(Collectors.toMap(member -> member, member -> perPerson));
    }
}

// Factory for Strategy Selection
@Service
public class SplitStrategyFactory {
    private final Map<String, ISplitStrategy> strategies;
    
    public ISplitStrategy getStrategy(String splitType) {
        return strategies.get(splitType.toLowerCase());
    }
}
```

---

### 2. Observer Pattern
**Purpose:** Notify group members of events in real-time

**Code Snippet:**
```java
// Observer Interface
public interface IObserver {
    void update(Map<String, Object> event);
}

// Concrete Observer
@Component
public class NotificationObserver implements IObserver {
    @Override
    public void update(Map<String, Object> event) {
        String eventType = (String) event.get("type");
        if ("expense_added".equals(eventType)) {
            handleExpenseAdded(event);
        }
    }
}

// Subject (Singleton via Spring)
@Service
public class NotificationService {
    private final List<IObserver> observers = new ArrayList<>();
    
    public void attach(IObserver observer) {
        if (!observers.contains(observer)) {
            observers.add(observer);
        }
    }
    
    public void notifyObservers(Map<String, Object> event) {
        for (IObserver observer : observers) {
            observer.update(event);
        }
    }
}
```

---

### 3. Factory Pattern
**Purpose:** Create different types of groups dynamically

**Code Snippet:**
```java
// Factory Interface
public interface IGroupFactory {
    Group createGroup(String name, String description);
}

// Main Factory
@Service
public class GroupFactory {
    private static class TravelGroupFactory implements IGroupFactory {
        @Override
        public Group createGroup(String name, String description) {
            Group group = new Group();
            group.setName("🌍 " + name);
            group.setDescription(description != null ? description : "Travel expense group");
            return group;
        }
    }
    
    public Group createGroup(String groupType, String name, String description) {
        IGroupFactory factory = factories.getOrDefault(
            groupType.toLowerCase(), 
            factories.get("general")
        );
        return factory.createGroup(name, description);
    }
}
```

---

### 4. Singleton Pattern
**Purpose:** Ensure single instance of critical resources

**Code Snippet:**
```java
// Singleton via Spring Framework
@Service
public class NotificationService {
    // Spring ensures only one instance exists
    private final List<IObserver> observers = new ArrayList<>();
}

@Service
public class CommandManager {
    // Spring ensures only one instance exists
    private final Stack<ICommand> history = new Stack<>();
    private final Stack<ICommand> redoStack = new Stack<>();
}
```

---

### 5. Command Pattern
**Purpose:** Enable undo/redo functionality for expense operations

**Code Snippet:**
```java
// Command Interface
public interface ICommand {
    void execute();
    void undo();
}

// Concrete Command
public class AddExpenseCommand implements ICommand {
    private final ExpenseRepository expenseRepository;
    private final Expense expense;
    
    @Override
    public void execute() {
        expenseRepository.save(expense);
    }
    
    @Override
    public void undo() {
        expenseRepository.deleteById(expense.getExpenseId());
    }
}

// Command Manager
@Service
public class CommandManager {
    private final Stack<ICommand> history = new Stack<>();
    
    public void execute(ICommand command) {
        command.execute();
        history.push(command);
    }
    
    public void undo() {
        if (!history.isEmpty()) {
            ICommand command = history.pop();
            command.undo();
        }
    }
}
```

---

### 6. State Pattern (NEW in Milestone 3)
**Purpose:** Manage settlement status transitions and payment processing

**Code Snippet:**
```java
// State Interface
public interface SettlementState {
    SettlementStatus getStatus();
    void applyPayment(Settlement settlement, double paymentAmount);
}

// Concrete State - Pending
public class PendingSettlementState extends AbstractActiveSettlementState {
    @Override
    public SettlementStatus getStatus() {
        return SettlementStatus.PENDING;
    }
    
    @Override
    protected void updateStatus(Settlement settlement) {
        double newPaid = settlement.getPaidAmount();
        if (newPaid >= settlement.getAmount() - 0.009) {
            settlement.setStatus(SettlementStatus.COMPLETED);
            settlement.setSettledAt(LocalDateTime.now());
        } else if (newPaid > 0.009) {
            settlement.setStatus(SettlementStatus.PARTIAL);
        }
    }
}

// State Factory
@Service
public class SettlementStateFactory {
    private final Map<SettlementStatus, SettlementState> states;
    
    public SettlementState getState(SettlementStatus status) {
        return states.get(status);
    }
}
```

**Usage:**
```java
Settlement settlement = settlementRepository.findById(settlementId);
SettlementState state = stateFactory.getState(settlement.getStatus());
state.applyPayment(settlement, paymentAmount);
settlementRepository.save(settlement);
```

---

### 7. Builder Pattern (NEW in Milestone 3)
**Purpose:** Construct complex settlement response objects with fluent API

**Code Snippet:**
```java
// Builder for Settlement Overview
public class SettlementOverviewBuilder {
    private final Map<String, Object> response = new LinkedHashMap<>();
    
    public SettlementOverviewBuilder withBalances(List<Map<String, Object>> balances) {
        response.put("balances", balances);
        return this;
    }
    
    public SettlementOverviewBuilder withRecommendedPlan(List<Map<String, Object>> plan) {
        response.put("recommended_plan", plan);
        return this;
    }
    
    public SettlementOverviewBuilder withMetrics(Map<String, Object> metrics) {
        response.put("metrics", metrics);
        return this;
    }
    
    public Map<String, Object> build() {
        return response;
    }
}
```

**Usage:**
```java
Map<String, Object> overview = new SettlementOverviewBuilder()
    .withBalances(balanceList)
    .withRecommendedPlan(suggestions)
    .withActiveSettlements(activeSettlements)
    .withCompletedSettlements(completedSettlements)
    .withMetrics(metrics)
    .build();
```

---

## Functionalities Planned for Final Submission

1. **Enhanced UI/UX Improvements**
   - Animations and transitions
   - Improved mobile responsiveness
   - Dark/light theme toggle

2. **Advanced Analytics**
   - Spending trends visualization
   - Category-based expense tracking
   - Monthly/yearly reports

3. **Email Notifications**
   - Email alerts for new expenses
   - Settlement reminders
   - Weekly summary emails

4. **Performance Optimization**
   - Database query optimization
   - Redis caching implementation
   - Frontend lazy loading

5. **Additional Export Formats**
   - PDF report generation
   - Excel export
   - Customizable report templates

---

## Team Contributions

| Team Member        | Contribution                                                                                              |
|--------------------|-----------------------------------------------------------------------------------------------------------|
| **Gaurav Bakale**  | State pattern implementation, Settlement service logic, Expense filtering backend, Testing suite setup |
| **Yu-Tzu Li**      | Frontend expense filtering UI, Profile page implementation, ExpenseFilter component, UI/UX enhancements  |
| **Rahul Sharma**   | Builder pattern implementation, CSV export functionality, Group summary reports, Observer pattern tests |
| **Karan Srinivas** | User profile management backend, Password change security, Factory pattern tests, State pattern tests |

---

## GitHub Repository

**Repository URL:** https://github.com/gaurav-bakale/SplitZilla

**Collaborators Added:**
- vaibhavsingh97 ✅
- saishreyakondagari ✅

**Repository Structure:**
```
SplitZilla/
├── backend-java/          # Spring Boot backend
│   ├── src/
│   │   ├── main/
│   │   │   └── java/com/splitzilla/
│   │   │       ├── controller/      # REST API controllers
│   │   │       ├── service/         # Business logic
│   │   │       ├── model/           # JPA entities
│   │   │       ├── repository/      # Data access
│   │   │       └── pattern/         # Design patterns
│   │   └── test/                    # Test suite
│   └── pom.xml
├── frontend/              # React frontend
│   ├── src/
│   │   ├── components/    # Reusable components
│   │   ├── pages/         # Page components
│   │   ├── api/           # API client
│   │   └── context/       # React context
│   └── package.json
└── Docs/                  # Documentation
    ├── Milestone3_Update.md
    └── DesignDocument_Milestone3.md
```

---

## API Endpoints Summary

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login and get JWT token

### Groups
- `GET /api/groups/` - Get all user's groups
- `POST /api/groups/` - Create new group
- `GET /api/groups/{group_id}` - Get group details
- `POST /api/groups/{group_id}/members/{user_email}` - Add member

### Expenses
- `POST /api/expenses/` - Create expense
- `GET /api/expenses/group/{group_id}` - Get group expenses
- `GET /api/expenses/group/{group_id}/filter` - Filter expenses (NEW)
- `GET /api/expenses/group/{group_id}/export/csv` - Export to CSV (NEW)
- `GET /api/expenses/group/{group_id}/summary` - Get group summary (NEW)
- `GET /api/expenses/balances/group/{group_id}` - Get balances

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

## Testing Coverage

### Unit Tests
- **Strategy Pattern:** 5 test cases covering all split strategies
- **Observer Pattern:** 3 test cases for observer lifecycle
- **Factory Pattern:** 6 test cases for all group types
- **State Pattern:** 7 test cases for state transitions
- **Builder Pattern:** 3 test cases for builder chaining

### Integration Tests
- **ExpenseService:** 5 test cases with mocked dependencies
- Tests cover filtering, searching, CSV export, and summary generation

### Total Test Cases: 30+

---

## Project Timeline

- **Milestone 1:** Project specification and initial setup ✅
- **Milestone 2:** Core functionalities with 5 design patterns ✅
- **Milestone 3:** Advanced features, 2 new patterns, testing suite, and enhanced functionality ✅
- **Final Submission:** Polish, optimization, and additional features (In Progress)

---

## Key Achievements in Milestone 3

1. ✅ Implemented 2 new design patterns (State and Builder)
2. ✅ Added comprehensive testing suite with 30+ test cases
3. ✅ Implemented expense filtering and search functionality
4. ✅ Added CSV export and group summary reports
5. ✅ Built user profile management system
6. ✅ Enhanced settlement system with state management
7. ✅ Improved code quality and maintainability
8. ✅ Added extensive API documentation

---

*Document Version: 3.0*  
*Last Updated: April 7, 2026*
