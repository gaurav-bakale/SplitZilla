# SplitZilla Backend

FastAPI backend for the SplitZilla expense splitting application.

## Setup

1. Create virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. Create `.env` file from example:
```bash
cp .env.example .env
```

4. Run the server:
```bash
uvicorn app.main:app --reload --port 8000
```

## API Documentation

Visit `http://localhost:8000/docs` for interactive Swagger documentation.

## Design Patterns

### Strategy Pattern
Location: `app/patterns/strategy.py`
- Implements different expense splitting algorithms
- Equal, Percentage, and Exact Amount strategies

### Observer Pattern
Location: `app/patterns/observer.py`
- Notification system for group events
- NotificationService singleton manages observers

### Factory Pattern
Location: `app/patterns/factory.py`
- Creates different group types
- Travel, Roommate, Event, and General factories

### Singleton Pattern
Locations:
- `app/database.py` - DatabaseManager
- `app/patterns/observer.py` - NotificationService
- `app/patterns/command.py` - CommandManager

### Command Pattern
Location: `app/patterns/command.py`
- Undo/redo functionality for expenses
- AddExpenseCommand and DeleteExpenseCommand

## Database

The application uses SQLite by default. To use PostgreSQL:

1. Update `.env`:
```
DATABASE_URL=postgresql://user:password@localhost:5432/splitzilla
```

2. Install PostgreSQL driver:
```bash
pip install psycopg2-binary
```

## Testing

Run tests:
```bash
pytest
```

Run with coverage:
```bash
pytest --cov=app
```
