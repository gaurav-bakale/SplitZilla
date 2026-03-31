# SplitZilla - Collaborative Expense Splitting Application

A modern, full-stack expense splitting application built with Java Spring Boot and React, implementing 5 core design patterns.

## 🎯 Project Overview

SplitZilla simplifies shared expense management among friends, roommates, or travel groups. It provides a centralized platform to create groups, add expenses, and automatically calculate balances using various splitting methods.

## 👥 Team Members

- Gaurav Bakale
- Yu-Tzu Li
- Rahul Sharma
- Karan Srinivas

## 🏗️ Architecture

### Design Patterns Implemented

1. **Strategy Pattern** - Multiple expense splitting algorithms (Equal, Percentage, Exact)
2. **Observer Pattern** - Real-time notifications for group activities
3. **Factory Pattern** - Dynamic group type creation (Travel, Roommate, Event, General)
4. **Singleton Pattern** - Database connection and notification service management
5. **Command Pattern** - Undo/redo functionality for expense operations

### Tech Stack

**Backend:**
- Java 17
- Spring Boot 3.2.0
- Spring Data JPA with Hibernate
- H2 Database (development) / PostgreSQL (production)
- Spring Security with JWT Authentication
- Maven

**Frontend:**
- React.js
- Vite
- TailwindCSS
- Axios
- React Router

## 🚀 Getting Started

### Prerequisites

- Java 17 or higher
- Maven 3.6+
- Node.js 16+
- npm or yarn

### Backend Setup

1. Navigate to backend-java directory:
```bash
cd backend-java
```

2. Build the project:
```bash
mvn clean install
```

3. Run the server:
```bash
mvn spring-boot:run
```

The API will be available at `http://localhost:8000`  
H2 Console: `http://localhost:8000/h2-console`

### Frontend Setup

1. Navigate to frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Run development server:
```bash
npm run dev
```

The application will be available at `http://localhost:3000`

## 📚 API Documentation

Once the backend is running, visit `http://localhost:8000/docs` for interactive API documentation powered by Swagger/OpenAPI.

### Key Endpoints

**Authentication:**
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login and get JWT token

**Groups:**
- `GET /api/groups/` - Get all user's groups
- `POST /api/groups/` - Create new group
- `GET /api/groups/{group_id}` - Get group details
- `POST /api/groups/{group_id}/members/{user_email}` - Add member

**Expenses:**
- `POST /api/expenses/` - Create expense
- `GET /api/expenses/group/{group_id}` - Get group expenses
- `DELETE /api/expenses/{expense_id}` - Delete expense
- `POST /api/expenses/undo` - Undo last operation
- `GET /api/expenses/balances/group/{group_id}` - Get balances

**Notifications:**
- `GET /api/notifications/` - Get user notifications
- `PUT /api/notifications/{notification_id}/read` - Mark as read

## 🎨 Features

### Implemented (Milestone 2)

✅ User registration and authentication  
✅ JWT-based secure authentication  
✅ Create and manage groups  
✅ Add/remove group members  
✅ Create expenses with 3 splitting methods  
✅ Real-time notifications  
✅ Balance calculation  
✅ Undo/redo expense operations  
✅ Transaction history  
✅ Responsive UI with TailwindCSS  

### Planned (Milestone 3)

🔲 Advanced balance settlement  
🔲 Expense filtering and search  
🔲 CSV/PDF export  
🔲 Email notifications  
🔲 Comprehensive testing suite  
🔲 Performance optimization  
🔲 User profile management  

## 📁 Project Structure

```
project/
├── backend/
│   ├── app/
│   │   ├── patterns/          # Design pattern implementations
│   │   │   ├── strategy.py    # Strategy pattern
│   │   │   ├── observer.py    # Observer pattern
│   │   │   ├── factory.py     # Factory pattern
│   │   │   └── command.py     # Command pattern
│   │   ├── routes/            # API endpoints
│   │   ├── models.py          # Database models
│   │   ├── schemas.py         # Pydantic schemas
│   │   ├── database.py        # Database manager (Singleton)
│   │   ├── auth.py            # Authentication logic
│   │   └── main.py            # FastAPI application
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── components/        # React components
│   │   ├── pages/             # Page components
│   │   ├── context/           # React context
│   │   ├── api/               # API client
│   │   └── App.jsx
│   └── package.json
└── Docs/
    ├── Project_Specification.md
    ├── DesignDocument_Milestone2.md
    └── Milestone2_Update.md
```

## 🧪 Testing

### Backend Tests
```bash
cd backend
pytest
```

### Frontend Tests
```bash
cd frontend
npm test
```

## 📖 Documentation

- [Project Specification](Docs/Project_Specification.md)
- [Design Document](Docs/DesignDocument_Milestone2.md)
- [Milestone 2 Update](Docs/Milestone2_Update.md)

## 🔒 Security

- Passwords hashed with bcrypt
- JWT tokens for authentication
- Protected API routes
- SQL injection prevention via ORM
- Input validation with Pydantic
- CORS configuration

## 📝 License

This project is created for educational purposes as part of a Design Patterns course.

## 🤝 Contributing

This is an academic project. Team members should follow the contribution guidelines:

1. Create feature branches
2. Make meaningful commits
3. Test before pushing
4. Create pull requests for review

## 📧 Contact

For questions or issues, please contact any team member or create an issue in the repository.

---

**Last Updated:** March 31, 2026  
**Version:** 1.0.0
