# attendence-app
# Smart Employee Attendance Management System

A full-stack employee attendance management system designed to automate workforce attendance tracking through secure Wi-Fi-based check-in and check-out, attendance validation, and working-hour calculations.

The platform provides both web and mobile interfaces, allowing employees to manage their attendance while enabling organizations to monitor daily attendance, working hours, and attendance history.

**My Contribution:** Backend Development and Web Application Development.

The backend and web application were developed by me, while the mobile application was developed by another team member.

---

## Overview

The Smart Employee Attendance Management System replaces manual attendance processes with an automated, centralized attendance management platform.

Employees can check in and check out through the web application or mobile application, subject to company Wi-Fi restrictions and attendance validation rules.

The system records attendance sessions, calculates total working hours, determines attendance status, and provides daily and weekly attendance summaries.

---

## Key Features

### Employee Features

- Secure employee authentication.
- Login using JWT authentication and OAuth.
- Web-based attendance check-in and check-out.
- Mobile application support.
- Wi-Fi-based attendance validation to restrict attendance operations to the authorized office network.
- Multiple check-in and check-out sessions.
- Automatic attendance tracking.
- Daily and weekly attendance summaries.
- Working-hour calculations.
- Attendance history.
- Attendance status tracking.

### Attendance Management

- Time-based check-in validation.
- Secure check-in and check-out operations.
- Calculation of total working duration across multiple sessions.
- Automatic attendance status calculation based on working hours.
- Holiday-aware attendance handling.
- Automatic checkout handling for missed check-outs.

### Attendance Dashboard

- Daily attendance overview.
- Weekly attendance summaries.
- Total working hours.
- Check-in and check-out timelines.
- Attendance history.
- Working-duration reports.

---

## System Architecture

The application consists of a backend API, web frontend, mobile application, and supporting infrastructure.

```text
              Web Application
                React.js
                    |
                    |
                    v
              Backend API
             Node.js / Express
                    |
          +---------+---------+
          |         |         |
          v         v         v
       MySQL      Redis    Authentication
      Database    Cache      JWT / OAuth
          |
          |
          v
    Attendance Management
          |
          |
    +-----+------+
    |            |
    v            v
 Web Client   Mobile App
              (Teammate)
```

### Main Components

| Component | Responsibility |
|---|---|
| Web Application | Employee attendance operations and attendance dashboards. |
| Mobile Application | Mobile-based employee attendance operations. |
| Backend API | Attendance processing, validation, authentication, and business logic. |
| MySQL | Persistent storage of employee and attendance records. |
| Redis | Caching to improve application performance. |
| Docker | Application containerization. |
| Nginx | Reverse proxy and application traffic management. |

---

## Technology Stack

### Frontend
- React.js
- Tailwind CSS
- JavaScript

### Backend
- Node.js
- Express.js
- RESTful APIs
- JWT Authentication
- OAuth

### Database and Caching
- MySQL
- Redis

### DevOps and Deployment
- Docker
- Nginx
- GitHub Actions
- CI/CD

### Mobile Application
- Developed by another team member.

---

## Attendance Workflow

### 1. Employee Authentication

1. Employee logs into the system.
2. The backend validates the authentication credentials.
3. JWT-based authentication is used to secure protected API endpoints.
4. OAuth is integrated for supported authentication flows.

### 2. Employee Check-In

1. Employee accesses the attendance application.
2. The system validates the attendance request.
3. Wi-Fi-based restrictions ensure attendance operations are performed through the authorized office network.
4. The backend validates the check-in time.
5. The check-in record is stored in MySQL.

### 3. Employee Check-Out

1. Employee submits a check-out request.
2. The backend validates the request.
3. The corresponding attendance session is updated.
4. Working duration is calculated.

### 4. Attendance Calculation

The system calculates the total working duration by considering the employee's attendance sessions.

Attendance status is determined according to the configured attendance rules.

### 5. Attendance Dashboard

Employees can view:

- Daily attendance records.
- Weekly attendance summaries.
- Total working hours.
- Check-in and check-out history.
- Attendance status.

---

## Backend Architecture and Engineering

The backend was developed using Node.js and Express.js with a REST API-based architecture.

Key implementation areas include:

- Designing RESTful APIs for attendance operations.
- Implementing authentication and authorization.
- Building check-in and check-out business logic.
- Implementing Wi-Fi-based attendance validation.
- Managing employee and attendance records using MySQL.
- Integrating Redis for caching and performance optimization.
- Implementing attendance calculations and status validation.
- Preparing the application for containerized deployment.

---

## Database and Performance

### MySQL

MySQL is used as the primary relational database for managing employee information, authentication-related records, and attendance data.

### Redis

Redis is integrated as a caching layer to reduce repeated database operations and improve application response performance.

---

## Deployment and CI/CD

The application uses Docker and Nginx for deployment and infrastructure management.

- Docker for application containerization.
- Nginx for reverse proxy configuration and traffic management.
- GitHub Actions for CI/CD automation.
- Environment-based configuration for application settings.

---

## Getting Started

### Prerequisites

Install the following tools:

- Node.js
- npm
- MySQL
- Redis
- Docker
- Git

### 1. Clone the Repository

```bash
git clone <YOUR_GITHUB_REPOSITORY_URL>

cd smart-attendance-management-system
```

### 2. Install Dependencies

Navigate to the backend and frontend directories and install their dependencies.

Backend:

```bash
cd backend
npm install
```

Frontend:

```bash
cd frontend
npm install
```

Adjust the directory names according to the actual repository structure.

### 3. Configure Environment Variables

Create the required `.env` file in the backend directory.

Example:

```env
PORT=4000

DB_HOST=localhost
DB_PORT=3306
DB_USER=your_mysql_username
DB_PASSWORD=your_mysql_password
DB_NAME=attendance_db

REDIS_HOST=localhost
REDIS_PORT=6379

JWT_SECRET=your_jwt_secret
```

Add other environment variables required by your OAuth provider and application configuration.

### 4. Start MySQL and Redis

Ensure that MySQL and Redis are running and the required database and tables have been configured.

### 5. Start Backend

```bash
npm run dev
```

### 6. Start Frontend

Open another terminal:

```bash
npm run dev
```

Use the local URL displayed by the frontend development server to access the application.

**Note:** Update the setup commands and environment variable names to match the actual scripts and configuration in the repository.

---

## Project Contributions

### My Responsibilities

- Designed and developed the backend using Node.js and Express.js.
- Developed RESTful APIs for employee attendance management.
- Implemented authentication using JWT and OAuth.
- Developed Wi-Fi-based check-in and check-out validation.
- Implemented attendance calculations and business rules.
- Integrated MySQL for persistent data management.
- Integrated Redis for caching and performance optimization.
- Developed the React.js web application.
- Worked on Docker, Nginx, and CI/CD deployment.

### Team Contribution

- Mobile application development was handled by another team member.
- Backend APIs were developed to support the application's attendance workflows.

---

## Future Enhancements

- Advanced workforce analytics and reporting.
- Organization-wide attendance management.
- Department-wise attendance dashboards.
- Advanced employee leave management.
- Improved attendance anomaly detection.
- Enhanced monitoring and observability.

---

## Author

**Furqan Ahmad Ganai**

Full Stack Developer | Backend Engineering

- GitHub: [Your GitHub Profile](YOUR_GITHUB_PROFILE_URL)
- LinkedIn: [Your LinkedIn Profile](YOUR_LINKEDIN_PROFILE_URL)

---

## License

This project was developed as part of a collaborative software development initiative.
