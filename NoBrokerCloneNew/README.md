\# NoBroker Clone



A property listing platform with separate property-owner and buyer/tenant roles.



\## Technology



\### Backend

\- Python

\- Django

\- Django REST Framework

\- PostgreSQL

\- Django Channels and Daphne for WebSockets

\- Redis channel layer



\### Frontend

\- React

\- Vite



\## Project Structure



\- `apps/users/` — user and authentication functionality

\- `apps/properties/` — property listings and interest requests

\- `apps/chat/` — conversations and messaging

\- `apps/deals/` — deal records and status

\- `config/` — Django settings, URLs, and ASGI configuration



\## Local Setup



\### 1. Backend



Open PowerShell and navigate to the backend:



&#x20;   cd D:\\djongproject\\NoBrokerCloneNew



Create and activate a virtual environment if needed:



&#x20;   python -m venv .venv

&#x20;   .\\.venv\\Scripts\\Activate.ps1



Install dependencies:



&#x20;   pip install -r requirements.txt



Create a local `.env` file using `.env.example` as a template.

Set your own secret key and PostgreSQL connection details.



Apply migrations:



&#x20;   python manage.py migrate



Start Django:



&#x20;   python manage.py runserver



\### 2. Frontend



Open another PowerShell terminal:



&#x20;   cd D:\\djongproject\\nobroker-frontend



Install dependencies:



&#x20;   npm install



Start the development server:



&#x20;   npm run dev



\## Environment Variables



See `.env.example` for the variable names and placeholder values.



Never commit real passwords, secret keys, or other credentials.



\## Features



Implemented features should be verified against the current application before release.

