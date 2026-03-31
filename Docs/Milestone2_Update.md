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
- **Framework:** Java 17 + Spring Boot 3.2.0
- **Database:** H2 (development) / PostgreSQL (production-ready)
- **ORM:** Spring Data JPA with Hibernate
- **Authentication:** Spring Security with JWT (JSON Web Tokens)
- **API Style:** RESTful API with Spring MVC
- **Build Tool:** Maven

### Frontend
- **Framework:** React.js with Vite
- **UI Library:** TailwindCSS for styling
- **State Management:** React Context API
- **HTTP Client:** Axios
- **Icons:** Lucide React

### Additional Tools
- **Version Control:** Git & GitHub
- **API Documentation:** Spring REST Docs / Swagger (planned)
- **Testing:** JUnit 5 + Spring Boot Test (backend), Jest (frontend) - planned for Milestone 3

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
        if (members == null || members.isEmpty()) {
            return new HashMap<>();
        }
        double perPerson = amount / members.size();
        return members.stream()
            .collect(Collectors.toMap(member -> member, member -> perPerson));
    }
}

// Concrete Strategy - Percentage Split
@Component
public class PercentageSplitStrategy implements ISplitStrategy {
    @Override
    public Map<String, Double> split(Double amount, List<String> members, Map<String, Object> params) {
        Map<String, Double> percentages = (Map<String, Double>) params.get("percentages");
        double total = percentages.values().stream().mapToDouble(Double::doubleValue).sum();
        if (Math.abs(total - 100.0) > 0.01) {
            throw new IllegalArgumentException("Percentages must sum to 100");
        }
        return members.stream()
            .collect(Collectors.toMap(member -> member, 
                member -> amount * percentages.getOrDefault(member, 0.0) / 100.0));
    }
}

// Factory for Strategy Selection
@Service
public class SplitStrategyFactory {
    private final Map<String, ISplitStrategy> strategies;
    
    @Autowired
    public SplitStrategyFactory(EqualSplitStrategy equalStrategy,
                               PercentageSplitStrategy percentageStrategy,
                               ExactAmountSplitStrategy exactStrategy) {
        this.strategies = new HashMap<>();
        strategies.put("equal", equalStrategy);
        strategies.put("percentage", percentageStrategy);
        strategies.put("exact", exactStrategy);
    }
    
    public ISplitStrategy getStrategy(String splitType) {
        return strategies.get(splitType.toLowerCase());
    }
}
```

**Usage in Expense Creation:**
```java
ISplitStrategy strategy = splitStrategyFactory.getStrategy(expenseData.getSplitType());
Map<String, Double> splits = strategy.split(expenseData.getAmount(), memberIds, params);
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
    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;
    
    @Autowired
    public NotificationObserver(NotificationRepository notificationRepository,
                               UserRepository userRepository) {
        this.notificationRepository = notificationRepository;
        this.userRepository = userRepository;
    }
    
    @Override
    public void update(Map<String, Object> event) {
        String eventType = (String) event.get("type");
        if ("expense_added".equals(eventType)) {
            handleExpenseAdded(event);
        } else if ("member_added".equals(eventType)) {
            handleMemberAdded(event);
        }
    }
    
    private void handleExpenseAdded(Map<String, Object> event) {
        List<String> groupMembers = (List<String>) event.get("group_members");
        for (String memberId : groupMembers) {
            User user = userRepository.findById(memberId).orElse(null);
            if (user != null) {
                Notification notification = new Notification();
                notification.setUser(user);
                notification.setMessage(event.get("payer_name") + " added expense '" 
                    + event.get("expense_description") + "'");
                notification.setIsRead(false);
                notificationRepository.save(notification);
            }
        }
    }
}

// Subject (Singleton via Spring @Service)
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

**Usage:**
```java
@Autowired
private NotificationService notificationService;

@Autowired
private NotificationObserver observer;

// In service method
notificationService.attach(observer);
Map<String, Object> event = new HashMap<>();
event.put("type", "expense_added");
event.put("group_members", memberIds);
event.put("payer_name", currentUser.getName());
event.put("amount", expenseData.getAmount());
notificationService.notifyObservers(event);
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

// Main Factory with Inner Classes
@Service
public class GroupFactory {
    
    // Inner Factory Classes
    private static class TravelGroupFactory implements IGroupFactory {
        @Override
        public Group createGroup(String name, String description) {
            Group group = new Group();
            group.setName("🌍 " + name);
            group.setDescription(description != null ? description : "Travel expense group");
            return group;
        }
    }
    
    private static class RoommateGroupFactory implements IGroupFactory {
        @Override
        public Group createGroup(String name, String description) {
            Group group = new Group();
            group.setName("🏠 " + name);
            group.setDescription(description != null ? description : "Roommate expense group");
            return group;
        }
    }
    
    private final Map<String, IGroupFactory> factories;
    
    public GroupFactory() {
        this.factories = new HashMap<>();
        factories.put("travel", new TravelGroupFactory());
        factories.put("roommate", new RoommateGroupFactory());
        factories.put("event", new EventGroupFactory());
        factories.put("general", new GeneralGroupFactory());
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

**Usage:**
```java
@Autowired
private GroupFactory groupFactory;

Group newGroup = groupFactory.createGroup(
    "travel",
    "Europe Trip 2026",
    "Summer vacation expenses"
);
```

---

### 4. Singleton Pattern

**Purpose:** Ensure single instance of critical resources

**Code Snippet:**
```java
// Singleton via Spring Framework
// Spring's @Service, @Component, and @Repository annotations
// create singleton beans by default

// NotificationService Singleton
@Service
public class NotificationService {
    // Spring ensures only one instance exists
    private final List<IObserver> observers = new ArrayList<>();
    
    public void attach(IObserver observer) {
        if (!observers.contains(observer)) {
            observers.add(observer);
        }
    }
}

// CommandManager Singleton
@Service
public class CommandManager {
    // Spring ensures only one instance exists
    private final Stack<ICommand> history = new Stack<>();
    private final Stack<ICommand> redoStack = new Stack<>();
    
    public void execute(ICommand command) {
        command.execute();
        history.push(command);
        redoStack.clear();
    }
}
```

**Usage:**
```java
@Autowired
private NotificationService notificationService;  // Spring injects singleton

@Autowired
private CommandManager commandManager;  // Spring injects singleton
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

// Concrete Command - Add Expense (simplified example)
public class AddExpenseCommand implements ICommand {
    private final ExpenseRepository expenseRepository;
    private final Expense expense;
    private String expenseId;
    
    public AddExpenseCommand(ExpenseRepository repository, Expense expense) {
        this.expenseRepository = repository;
        this.expense = expense;
    }
    
    @Override
    public void execute() {
        Expense savedExpense = expenseRepository.save(expense);
        this.expenseId = savedExpense.getExpenseId();
    }
    
    @Override
    public void undo() {
        if (expenseId != null) {
            expenseRepository.deleteById(expenseId);
        }
    }
}

// Command Manager (Singleton via Spring)
@Service
public class CommandManager {
    private final Stack<ICommand> history = new Stack<>();
    private final Stack<ICommand> redoStack = new Stack<>();
    
    public void execute(ICommand command) {
        command.execute();
        history.push(command);
        redoStack.clear();
    }
    
    public void undo() {
        if (history.isEmpty()) {
            throw new IllegalStateException("No commands to undo");
        }
        ICommand command = history.pop();
        command.undo();
        redoStack.push(command);
    }
    
    public void redo() {
        if (redoStack.isEmpty()) {
            throw new IllegalStateException("No commands to redo");
        }
        ICommand command = redoStack.pop();
        command.execute();
        history.push(command);
    }
}
```

**Usage:**
```java
@Autowired
private CommandManager commandManager;

@Autowired
private ExpenseRepository expenseRepository;

// Create and execute command
ICommand addCommand = new AddExpenseCommand(expenseRepository, expense);
commandManager.execute(addCommand);

// Later, undo the operation
commandManager.undo();

// Redo if needed
commandManager.redo();
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
| **Gaurav Bakale**  | Java Spring Boot backend development, Strategy pattern implementation, Expense splitting logic, REST API design |
| **Yu-Tzu Li**      | Frontend React components, UI/UX design with TailwindCSS, Dashboard and Groups pages, Authentication UI  |
| **Rahul Sharma**   | JPA entity design, Observer pattern implementation, Factory pattern, Notification system             |
| **Karan Srinivas** | Spring Security with JWT, Command pattern implementation, Singleton patterns, Undo/Redo functionality |

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
