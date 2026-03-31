# SplitZilla Frontend

React frontend for the SplitZilla expense splitting application.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Run development server:
```bash
npm run dev
```

3. Build for production:
```bash
npm run build
```

## Features

- User authentication (login/register)
- Dashboard with groups and notifications
- Group management (create, view, add members)
- Expense management (create, view, delete)
- Balance calculation and display
- Responsive design with TailwindCSS

## Tech Stack

- **React 18** - UI library
- **Vite** - Build tool
- **React Router** - Routing
- **Axios** - HTTP client
- **TailwindCSS** - Styling
- **Lucide React** - Icons

## Project Structure

```
src/
├── api/              # API client configuration
├── components/       # Reusable components
├── context/          # React context (Auth)
├── pages/            # Page components
│   ├── Login.jsx
│   ├── Register.jsx
│   ├── Dashboard.jsx
│   ├── Groups.jsx
│   └── GroupDetail.jsx
├── App.jsx           # Main app component
└── main.jsx          # Entry point
```

## Environment

The frontend expects the backend API to be running at `http://localhost:8000`.

To change this, update the baseURL in `src/api/axios.js`.

## Authentication

The app uses JWT tokens stored in localStorage. Tokens are automatically included in API requests via Axios interceptors.
