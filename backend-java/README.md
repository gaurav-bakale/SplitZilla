# SplitZilla Backend - Java Spring Boot

Complete Java implementation of the SplitZilla expense splitting application with all 5 design patterns.

## Tech Stack

- **Java 17**
- **Spring Boot 3.2.0**
- **Spring Data JPA**
- **Spring Security with JWT**
- **H2 Database** (Development)
- **PostgreSQL** (Production-ready)
- **Maven**
- **Lombok**

## Design Patterns Implemented

### 1. Strategy Pattern
**Location:** `com.splitzilla.pattern.strategy`
- `ISplitStrategy` - Strategy interface
- `EqualSplitStrategy` - Equal split implementation
- `PercentageSplitStrategy` - Percentage-based split
- `ExactAmountSplitStrategy` - Exact amount split
- `SplitStrategyFactory` - Factory for strategy selection

### 2. Observer Pattern
**Location:** `com.splitzilla.pattern.observer`
- `IObserver` - Observer interface
- `NotificationObserver` - Concrete observer for notifications
- `NotificationService` - Subject (Singleton via Spring @Service)

### 3. Factory Pattern
**Location:** `com.splitzilla.pattern.factory`
- `IGroupFactory` - Factory interface
- `GroupFactory` - Main factory with inner classes for different group types
  - TravelGroupFactory
  - RoommateGroupFactory
  - EventGroupFactory
  - GeneralGroupFactory

### 4. Singleton Pattern
**Implementation:** Spring Framework's `@Service` and `@Component` annotations ensure singleton behavior
- `NotificationService` - Singleton service
- `CommandManager` - Singleton command manager

### 5. Command Pattern
**Location:** `com.splitzilla.pattern.command`
- `ICommand` - Command interface
- `CommandManager` - Manages command execution, undo, and redo

## Project Structure

```
backend-java/
├── src/main/java/com/splitzilla/
│   ├── SplitZillaApplication.java
│   ├── model/                    # JPA Entities
│   │   ├── User.java
│   │   ├── Group.java
│   │   ├── Expense.java
│   │   ├── ExpenseSplit.java
│   │   └── Notification.java
│   ├── pattern/                  # Design Patterns
│   │   ├── strategy/
│   │   ├── observer/
│   │   ├── factory/
│   │   └── command/
│   ├── repository/               # Spring Data JPA Repositories
│   ├── service/                  # Business Logic
│   ├── controller/               # REST Controllers
│   ├── dto/                      # Data Transfer Objects
│   ├── security/                 # JWT Security Configuration
│   └── config/                   # Application Configuration
└── src/main/resources/
    └── application.properties
```

## Setup Instructions

### Prerequisites
- Java 17 or higher
- Maven 3.6+

### Build and Run

1. **Navigate to backend-java directory:**
```bash
cd backend-java
```

2. **Build the project:**
```bash
mvn clean install
```

3. **Run the application:**
```bash
mvn spring-boot:run
```

The application will start on `http://localhost:8080`

### H2 Console
Access the H2 database console at: `http://localhost:8080/h2-console`
- JDBC URL: `jdbc:h2:mem:splitzilla`
- Username: `sa`
- Password: (leave empty)

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login and get JWT token

### Groups
- `GET /api/groups` - Get all user's groups
- `POST /api/groups` - Create new group
- `GET /api/groups/{id}` - Get group details
- `POST /api/groups/{id}/members` - Add member to group
- `DELETE /api/groups/{id}/members/{userId}` - Remove member

### Expenses
- `POST /api/expenses` - Create expense
- `GET /api/expenses/group/{groupId}` - Get group expenses
- `DELETE /api/expenses/{id}` - Delete expense
- `POST /api/expenses/undo` - Undo last operation
- `POST /api/expenses/redo` - Redo last operation
- `GET /api/expenses/balances/{groupId}` - Get group balances

### Notifications
- `GET /api/notifications` - Get user notifications
- `PUT /api/notifications/{id}/read` - Mark notification as read

## Configuration

Edit `src/main/resources/application.properties` to configure:
- Database connection
- JWT secret key
- Server port
- CORS settings
- Logging levels

## Testing

Run tests with:
```bash
mvn test
```

## Production Deployment

For production, update `application.properties`:
```properties
spring.datasource.url=jdbc:postgresql://localhost:5432/splitzilla
spring.datasource.username=your_username
spring.datasource.password=your_password
spring.jpa.hibernate.ddl-auto=validate
```

---

**Author:** Gaurav Bakale  
**Branch:** gaurav/feature  
**Date:** March 31, 2026
