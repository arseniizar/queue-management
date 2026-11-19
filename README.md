# Queue and Appointment Management System

Full-stack queue and appointment scheduling platform built with **NestJS**, **React 19**, **TypeScript**, **MongoDB (Mongoose)**, and **Redis (Bull)**. Supports multi-role workflows across employers, staff (`places`), and clients with timetable validation, role-based access control, and automated background email reminders.

## Demo

- [Video Walkthrough 1 - Queue and Appointment Flow](https://www.youtube.com/watch?v=yefKQ_GZhiQ)
- [Video Walkthrough 2 - Staff Timetable and Admin Controls](https://www.youtube.com/watch?v=zStZsJkpKt4)

---

## Core Architecture and Features

- **Authentication and Authorization (`server/src/auth`, `server/src/roles`):**
  - Dual-token **JWT authentication** (`AccessTokenStrategy`, `RefreshTokenStrategy`, `LocalStrategy`) using Passport and `bcrypt` password hashing.
  - Route-level **Role-Based Access Control (RBAC)** enforced via custom `@Roles()` decorators and `RolesGuard` (`Employer`, `Employee/Place`, `Client`), plus token-verified password reset flows (`ResetToken` schema).
- **Queue and Timetable Engine (`server/src/queues`, `server/src/timetables`):**
  - Manages service queues, assigned staff stations (`places`), client positions, approval/cancellation states, and conflict-checked appointment slots.
  - Request payloads validated and normalized via custom NestJS pipes (`ScheduleValidationPipe`, `DataTransformationPipe`) and `class-validator` DTOs.
- **Asynchronous Job Processing (`server/src/schedule`, `server/src/processors`):**
  - Uses **Bull** backed by **Redis (`ioredis`)** to enqueue delayed appointment reminder jobs (`send-appointment-reminder`) and process transactional HTML emails asynchronously via **Nodemailer** and **Handlebars** templates (`confirmation.hbs`, `passreset.hbs`).
- **API Protection and Testing:**
  - Global rate limiting via `@nestjs/throttler` to protect endpoints against brute-force and abuse.
  - Unit and integration test suites built with **Jest** (`*.spec.ts`) and **Supertest** (`app.e2e-spec.ts`).

---

## Tech Stack

- **Backend:** NestJS 10, TypeScript 5.7, Mongoose 8 (MongoDB), Bull and ioredis (Redis), Passport JWT, Nodemailer and Handlebars, Day.js, `@nestjs/throttler`
- **Frontend:** React 19, TypeScript, React Router 7, Ant Design (Antd 5), Axios, SASS/SCSS, Parcel 2
- **Testing and Tooling:** Jest, Supertest (E2E), ESLint 9, Prettier, Concurrently

---

## Project Structure

### Backend (`server/src/`)
- `auth/`: JWT access and refresh strategies, Passport guards
- `database/`: MongoDB connection service
- `dto/`: Request validation DTOs
- `mail/`: Nodemailer service and Handlebars email templates
- `pipes/`: Custom schedule validation and data transformation pipes
- `processors/`: Bull worker processor for background email jobs
- `queues/`: Queue CRUD, client progression, and staff assignment
- `roles/`: Role management and RBAC guards
- `schedule/`: Redis and Bull delayed notification scheduler
- `schemas/`: Mongoose schemas (`User`, `Queue`, `Timetable`, `Role`, `ResetToken`)
- `timetables/`: Staff availability and slot booking engine
- `users/`: User account management

### Frontend (`client/src/`)
- `api/`: Axios HTTP client and request interceptors
- `components/`: Modals, forms, data tables, layout, and debounced controls
- `context/`: Authentication and application state context
- `interfaces/`: Shared TypeScript domain interfaces
- `pages/`: Queues, QueueDetails, Schedule, Profile, and authentication pages
- `router/`: Protected and role-gated route definitions

---

## Local Setup and Installation

### 1. Prerequisites
- **Node.js** `>= 18.x`
- **MongoDB** (local instance on port `27017` or MongoDB Atlas URI)
- **Redis** (local instance on port `6379`, Docker, or WSL on Windows)
- **SMTP or Gmail App Password** (for Nodemailer transactional emails)

### 2. Clone and Install Dependencies

```bash
git clone https://github.com/arseniizar/queue-management.git
cd queue-management
npm install
npm install --prefix server
npm install --prefix client
```

### 3. Environment Configuration

Create `server/.env` with the following variables:

```env
MONGO_URI=mongodb://localhost:27017/queues-management
JWT_ACCESS_SECRET=your_access_secret_key
JWT_REFRESH_SECRET=your_refresh_secret_key
HOST_URL=http://localhost:1234
MAIL_FROM=noreply@example.com
MAIL_USER=your_email@gmail.com
MAIL_PASSWORD=your_16_char_google_app_password
```

### 4. Run the Application

To launch Redis, the NestJS backend (`http://localhost:3000`), and the React frontend (`http://localhost:1234`) concurrently from the root directory:

```bash
npm start
```

To run each service individually, start Redis (`redis-server --daemonize yes`), run the NestJS backend in watch mode on port 3000 (`npm run start:server`), and run the React frontend via Parcel on port 1234 (`npm run start:client`).

### 5. Run Tests

Run unit tests and end-to-end tests from the root directory:

```bash
npm test --prefix server
npm run test:e2e --prefix server
```
