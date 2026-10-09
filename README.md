# ImpactBridge — Social Impact Management Platform

A full-stack MERN starter project designed around education and community programme tracking.

## Features
- React dashboard with impact KPIs, programme list, beneficiaries and activity feed
- Add beneficiaries and programmes from the UI
- REST API with Express
- MongoDB persistence when `MONGODB_URI` is configured
- Demo fallback data when MongoDB is unavailable
- CSV export of beneficiary records
- Search and filter beneficiaries
- Responsive layout

> This is an independent portfolio project inspired by the social-impact space. It is not an official American India Foundation product and uses fictional demo data.

## Run locally

Requirements: Node.js 18+ and npm.

### 1. Start backend
```bash
cd server
npm install
cp .env.example .env
npm run dev
```
Server runs at `http://localhost:5000`.

If MongoDB is configured, set `MONGODB_URI` in `.env`. Without it, the API uses in-memory demo data for the current server session.

### 2. Start frontend (new terminal)
```bash
cd client
npm install
npm run dev
```
Open the Vite URL shown in terminal (usually `http://localhost:5173`).

## Main API routes
- `GET /api/health`
- `GET /api/stats`
- `GET /api/programs`
- `POST /api/programs`
- `GET /api/beneficiaries`
- `POST /api/beneficiaries`
- `PATCH /api/beneficiaries/:id`
- `GET /api/reports/beneficiaries.csv`

## Suggested interview walkthrough
1. Start at the impact dashboard and explain the social problem.
2. Open Beneficiaries, search a learner and add a fictional record.
3. Open Programmes and add/update a programme.
4. Export a CSV report.
5. Explain the request flow: React component → fetch → Express route → Mongoose model / demo store → JSON response.
6. Explain next steps: authentication + role-based access, audit logs, consent, data minimisation, pagination, tests, and cloud deployment.

## Important
Use only fictional data in the demo. A production NGO system would require authentication, role permissions, privacy controls, audit logs, backups and secure handling of sensitive beneficiary information.
