from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import DatabaseManager
from app.routes import auth, groups, expenses, notifications

app = FastAPI(
    title="SplitZilla API",
    description="Collaborative Expense Splitting Application",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

db_manager = DatabaseManager()
db_manager.create_tables()

app.include_router(auth.router)
app.include_router(groups.router)
app.include_router(expenses.router)
app.include_router(notifications.router)

@app.get("/")
def root():
    return {
        "message": "Welcome to SplitZilla API",
        "version": "1.0.0",
        "docs": "/docs"
    }

@app.get("/health")
def health_check():
    return {"status": "healthy"}
