# Lead-Management-System


## Overview
The Lead Management System is a web application designed to help businesses manage their leads, interactions, call planning, and performance tracking. It offers features to categorize and organize leads, log interactions, plan and schedule calls, and monitor the performance of sales teams. The system provides role-based access control, ensuring that users with different roles (admin, sales, viewer) have access to specific features based on their permissions.

The application is built using Next.js for the frontend, with a modern, responsive design powered by Tailwind CSS. The backend is built using FastAPI and integrates with MongoDB Atlas and Amazon RDS Postgres to manage and store user data, leads, interactions  and other necessary business records. Authentication is implemented using cookies for session management.


## Features
- **User Authentication**: Secure login and logout system with session handling using cookies.
- **Role Based Access Control**:The system supports different user roles:
- - Admin: Full access to all sections and user management.
- - Sales: Access to leads, interactions, call planning, and performance tracking.
- - Viewer: Read-only access to most sections.
- **Lead Management**: Create and Manage leads efficiently with detailed records.
- **Point of COntact**: Create and manage multiple Point of contacts for leads.
- **Interaction Tracking**: Creat and manage interactions with leads, including calls, emails, and meetings, orders placed.
- **Call Planning**: Plan and schedule calls with leads, ensuring no follow-ups are missed.
- **Performance Tracking**: Admins can monitor the performance of the sales team with detailed analytics like well performing and under performing leads and monitoring ordering frequency.
- **API Documentation**: Interactive API documentation is provided via Swagger UI and Redoc.

---

## Table of Contents
- [System Requirements](#system-requirements)
- [Installation](#installation)
- [Running Instructions](#running-instructions)
- [Environment Variables](#environment-variables)
- [API Endpoints](#api-endpoints)
- [Technologies Used](#technologies-used)
- [Future Scopes](#future-scopes)
---

## System Requirements
Before you begin, ensure you have the following installed:
- **Python 3.8+**
- **Node.js 14+**
- **MongoDB (Mongo Compass or atlas)** 
- **PostgreSQL (pgAdmin)**


## Installation

## Setting BACKEND
### 1. Clone the Repository and create a virtual environment
```bash
git clone https://github.com/your-username/lead-management-system.git
cd backend
python -m venv venv
venv\Scripts\activate

```
### 2. Install Dependencies
```bash
pip install -r requirements.txt
```

## Running Instructions

### 1. Create a .env file in the backend/app directory with the following content

#### Add the Postgres PgAdmin variables for local deployment.
Note: I have two variables in my code, one is POSTGRES_URL (which is for local pgAdmin) and the other one USED in MY CODE is POSTGRES_URL_RDS (which is cloud Postgres. Ensure you pass the right variable as per your need to the Postgres engine in app/configs/database/postgres_db)
```bash
POSTGRES_USER
POSTGRES_PASSWORD
POSTGRES_DB
POSTGRES_HOST
POSTGRES_PORT
POSTGRES_URL
```

#### Add the MongoCompass variables for local deployment.
Note: I have two variables in my code, one is CONNECTION_STRING (which is for local compass) and the other one USED in MY CODE is CONNECTION_STRING_ATLAS (which is mongodb atlas). Ensure you pass the right variable as per your need to the AsyncIo client in app/configs/database/mongo_db
```bash
CONNECTION_STRING
INTERACTION_AND_PERFORMANCE_DB
INTERACTION_COLLECTION
```

#### Add the values for JWT Authentication.
```bash
SECRET_KEY
ALGORITHM
ACCESS_TOKEN_EXPIRE_MINUTES
```

#### Run Database Migrations in backend directory
```bash
alembic init alembic
alembic revision --autogenerate -m "New configuration"
alembic upgrade head
```

### 2. Start the Backend Server
```bash
cd backend
uvicorn app.main:app --reload
```
### The Swagger UI docs will be accessible at http://127.0.0.1:8000/docs for testing.


### Setting FRONTEND

### 1. Move to frontend/lead-management-app
```bash
cd ..
cd frontend
cd lead-management-app
 ```

### 2. Install dependencies
```bash
npm install
```

### 3. Run the Frontend
```bash
npm run dev
```

## Note: The Project is live on [Lead Management App](https://lead-management-system-mu.vercel.app/login).
- ### Test Credentials:
- - #### Username: Thomas
- - #### Password: 12345Thomas

## API Endpoints

### User Operations (Authentication)
- Register a new user: `POST /api/user/register`
- Authenticate a user and get a token: `POST /api/user/token`
- Fetch logged in user data: `GET /api/user/auth/me`

### Lead Operations
- Create a new Lead: `POST /api/lead`
- Get all the leads: `GET /api/lead`
- Get a specific leads: `GET /api/lead/{lead_id}`
- Update a lead: `PUT /api/lead`
- Delete a lead: `DELETE /api/lead`

### Point of Contact(POC) Operations
- Add POC to a lead: `POST /api/lead/{lead_id}/poc`
- Get all the POCs: `GET /api/lead/poc/all`
- Get POCs of a specific lead: `GET /api/lead/{lead_id}/pocs`
- Delete a POC: `DELETE /api/lead/{lead_id}/poc/{poc_id}`

### Call Tracking Operations
- Plan a call with a specific lead: `POST /api/lead/{lead_id}/call`
- Update a calls frequency: `PUT /api/lead/{lead_id}/call/{call_id}/frequency`
- Update call log(call made): `PUT /api/lead/{lead_id}/call/{call_id}/log`
- Get all calls: `GET /api/calls`
- Get calls for today: `Get/api/calls/today`
- Delete a call: `DELETE /api/lead/{lead_id}/call/{call_id}`

### Interaction tracking Operations
- Get all interactions: `GET /api/interactions`
- Get interactions with a particular lead: `GET /api/interactions/{lead_id}`
- Add a new interaction: `POST /api/interactions/{lead_id}`
- Update an interaction: `PUT /api/interactions/{lead_id}/{interaction_id}`
- Delete an interaction: `DELETE /api/interactions/{interaction_id}`

### Performance Tracking Operations
- Get performance data: `GET /api/performance`
- Get well-performing leads: `GET /api/performance/well-performing`
- Get under-performing leads: `GET /api/performance/under-performing`


## Technologies Used
- **FastAPI**: Python web framework for building APIs.
- **NextJs**: Fronntend framework to integrate with the backend.
- **MongoDB**: NoSQL database used for storing unstructured data (interactions).
- **PostgreSQL**: PostgreSQL database for storing and querying structured data(users, calls, point of contacs, leads).
- **Pydantic**: Input Data validation.
- **Swagger UI**: Interactive API documentation.


## Future Scopes
- Add a Super Admin feature who can manage the registration of admins, sales and viewers account so the Admin transition can be handled.
- Add a Dropdown in Add Lead Page to select the Time zone.
- Add Caching and Rate limiting for fast retrieval of data.
- Enable option to view the list or orders placed by each lead in the bottom part of Performance Tab within the Orders Placed by each Lead list.
- Show option to Edit Point of Contact details on Frontend as the backend logic is already written.
- Add more status option in the Dropdown of Lead Maanagement ( Add Lead Page)
- Adding a Category dropdown feature to select from before placing the order.
- On the basis of category render a Pie Chart in Performance Section depicting most number of orders placed w.r.t Category.