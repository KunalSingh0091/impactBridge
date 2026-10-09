# ImpactBridge — Social Impact Management Platform

A full-stack MERN project designed around education and community programme tracking. ImpactBridge helps demonstrate how an organisation can manage beneficiaries, monitor programmes, and review social-impact metrics through a central dashboard.

## Features

- React dashboard with impact KPIs, programme listings, beneficiaries, and activity feed
- Create and view beneficiaries and programmes
- Update beneficiary details and status
- Delete beneficiaries
- REST API built with Node.js and Express
- MongoDB persistence using Mongoose when `MONGODB_URI` is configured
- In-memory demo fallback when MongoDB is unavailable
- Search beneficiaries by name, district, or programme
- Filter beneficiaries by status
- Export beneficiary records as CSV
- Input validation and API error handling
- Responsive user interface

> **Project disclaimer:** ImpactBridge is an independent portfolio project inspired by the social-impact sector. It is not an official American India Foundation (AIF) product and uses fictional demo data.

## Tech Stack

- **Frontend:** React, Vite, JavaScript, HTML5, CSS3
- **Backend:** Node.js, Express.js
- **Database:** MongoDB, Mongoose
- **API:** REST API with JSON responses
- **Development tools:** npm, Git, GitHub, VS Code

## Run Locally

### Requirements

- Node.js 18 or later
- npm
- MongoDB connection string (optional; demo mode works without it)

### 1. Start the Backend

Open a terminal in the project root and run:

```bash
cd server
npm install
```

Create your local environment file by copying the example:

```bash
cp .env.example .env
```

On Windows PowerShell, you can also use:

```powershell
Copy-Item .env.example .env
```

If you want database persistence, configure `MONGODB_URI` in `server/.env` with your MongoDB connection string.

Start the backend:

```bash
npm run dev
```

The API runs at `http://localhost:5000`.

If MongoDB is unavailable or no connection string is configured, the backend uses in-memory demo data for the current server session. Changes made in demo mode are not preserved after a server restart.

### 2. Start the Frontend

Open a second terminal in the project root and run:

```bash
cd client
npm install
npm run dev
```

Open the Vite development URL shown in the terminal, usually `http://localhost:5173`.

## Main API Routes

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/api/health` | Check API and database status |
| GET | `/api/stats` | Retrieve dashboard impact statistics |
| GET | `/api/programs` | List programmes |
| POST | `/api/programs` | Create a programme |
| GET | `/api/beneficiaries` | List beneficiaries, with optional search and status filters |
| POST | `/api/beneficiaries` | Create a beneficiary |
| PATCH | `/api/beneficiaries/:id` | Update a beneficiary's status |
| PUT | `/api/beneficiaries/:id` | Update beneficiary details |
| DELETE | `/api/beneficiaries/:id` | Delete a beneficiary |
| GET | `/api/reports/beneficiaries.csv` | Export beneficiary records as CSV |

## Suggested Interview Walkthrough

1. Start at the dashboard and explain the problem ImpactBridge is designed to address.
2. Open Beneficiaries, search for a learner, and add a fictional beneficiary.
3. Update the beneficiary's details or status, then demonstrate deletion if appropriate.
4. Open Programmes and create a fictional programme.
5. Export a CSV report.
6. Explain the request flow: React component → API request → Express route → Mongoose model or in-memory demo store → JSON response.
7. Discuss potential improvements, such as authentication, role-based access control, audit logs, pagination, automated tests, and cloud deployment.

## Security and Privacy Considerations

This project is a portfolio demonstration and should not be used to store real beneficiary information in its current form.

A production social-impact management system would require:

- Authentication and role-based access control
- Appropriate consent and privacy controls
- Data minimisation and secure handling of sensitive information
- Audit logging and access monitoring
- Secure configuration of environment variables and database credentials
- Database backups, testing, and deployment monitoring

Use only fictional data when demonstrating this project.

## Future Improvements

- Authentication and role-based dashboards
- Programme editing and deletion
- Automated testing for API endpoints and React components
- Pagination for large beneficiary datasets
- Improved reporting and visual analytics
- Cloud deployment with secure environment configuration