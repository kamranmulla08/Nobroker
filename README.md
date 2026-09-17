
# NoBroker Clone

A full-stack property rental and sale platform inspired by NoBroker. Property owners can list and manage properties, while buyers and tenants can browse listings, express interest, and communicate with owners.

## Table of Contents

- [About the Project](#about-the-project)
- [Technologies Used](#technologies-used)
- [Project Structure](#project-structure)
- [Features](#features)
- [Prerequisites](#prerequisites)
- [Local Development Setup](#local-development-setup)
- [Environment Configuration](#environment-configuration)
- [Application URLs](#application-urls)
- [GitHub Repository](#github-repository)

## About the Project

NoBroker Clone is a property platform designed to connect property owners with people looking to buy or rent properties.

The application supports role-based access for property owners and buyers/tenants, property management, interest requests, and communication between users.

## Technologies Used

### Backend

- Python
- Django
- Django REST Framework
- Django Channels
- Daphne

### Frontend

- React
- Vite
- JavaScript

### Database and Real-Time Communication

- PostgreSQL
- Redis
- WebSockets

## Project Structure

The repository contains the backend and frontend in separate folders.

```text
Nobroker/
├── NoBrokerCloneNew/
│   ├── apps/
│   │   ├── users/
│   │   ├── properties/
│   │   ├── chat/
│   │   └── deals/
│   ├── config/
│   └── manage.py
├── nobroker-frontend/
└── README.md
```

## Features

### User Authentication

- User registration and login
- Owner and Buyer/Tenant roles
- User profile management

### Property Management

- Create property listings
- Edit and delete listings
- Upload property images
- Browse property listings
- View property details
- Manage property availability

### Interest Requests

- Buyers and tenants can express interest in properties
- Owners can accept or reject interest requests
- Users can view interest request status

### Dashboards

- Owner dashboard
- Buyer/Tenant dashboard
- Property and interest management

### Real-Time Chat

- Communication between buyers/tenants and property owners
- WebSocket-based real-time messaging
- Chat history

### Deal Management

- Deal creation and management
- Deal status tracking

## Prerequisites

Install the following software before running the project:

- Python
- Node.js and npm
- PostgreSQL
- Redis

Git is required to clone the repository.

## Local Development Setup

### 1. Clone the Repository

```bash
git clone https://github.com/kamranmulla08/Nobroker.git
cd Nobroker
```

### 2. Set Up the Backend

Open a terminal and navigate to the backend:

```powershell
cd NoBrokerCloneNew
```

Create and activate a Python virtual environment:

```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
```

Install the backend dependencies:

```powershell
pip install -r requirements.txt
```

Configure the backend environment variables as described in the Environment Configuration section.

Apply database migrations:

```powershell
python manage.py migrate
```

Start the Django development server:

```powershell
python manage.py runserver
```

The backend should be available at:

http://127.0.0.1:8000/

### 3. Set Up the Frontend

Open another terminal and navigate to the frontend:

```powershell
cd nobroker-frontend
```

Install the frontend dependencies:

```powershell
npm install
```

Start the Vite development server:

```powershell
npm run dev
```

Open the local frontend URL displayed in the terminal. The development server commonly uses:

http://localhost:5173/

### 4. Configure PostgreSQL and Redis

Make sure PostgreSQL is running and the database credentials match the backend environment configuration.

Make sure Redis is running and its connection settings match the Channels configuration.

Use your own local environment values. Do not commit passwords, tokens, or other secrets to GitHub.

## Environment Configuration

The backend requires environment configuration for settings such as:

- Django secret key
- Debug mode
- Allowed hosts
- Database connection
- Redis connection

Use the project's environment example file, if available, as a template.

Keep your actual `.env` file private and out of version control.

## Application URLs

| Service | Local URL |
|---|---|
| Frontend | http://localhost:5173/ |
| Backend | http://127.0.0.1:8000/ |
| Django Admin | http://127.0.0.1:8000/admin/ |

The API endpoints are defined in the backend application's URL configuration.

## Development Notes

- Keep backend and frontend dependencies installed in their respective project folders.
- Run the backend and frontend development servers in separate terminals.
- Configure PostgreSQL and Redis before testing features that depend on them.
- Do not commit local databases, uploaded media, environment secrets, or dependency folders.

## Future Improvements

Potential areas for further development include:

- Automated backend and frontend tests
- Improved API and deployment documentation
- Favorites and saved properties
- Maps and location-based property discovery
- Notifications
- Production deployment

## GitHub Repository

[https://github.com/kamranmulla08/Nobroker](https://github.com/kamranmulla08/Nobroker)

## Author

**Kamran Mulla**
