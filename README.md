# Queue & Appointment Management System

Full-stack queue and appointment scheduling platform built with **NestJS**, **React 19**, **TypeScript**, **MongoDB (Mongoose)**, and **Redis (Bull)**. Supports multi-role workflows across employers, staff (`places`), and clients with timetable validation, role-based access control, and automated background email reminders.

## Demo

- [Video Walkthrough 1 - Queue & Appointment Flow](https://www.youtube.com/watch?v=yefKQ_GZhiQ)
- [Video Walkthrough 2 - Staff Timetable & Admin Controls](https://www.youtube.com/watch?v=zStZsJkpKt4)

---

## Core Architecture & Features

- **Authentication & Authorization (`server/src/auth`, `server/src/roles`):**
  - Dual-token **JWT authentication** (`AccessTokenStrategy`, `RefreshTokenStrategy`, `LocalStrategy`) using Passport and `bcrypt` password hashing.
  - Route-level **Role-Based Access Control (RBAC)** enforced via custom `@Roles()` decorators and `RolesGuard` (`Employer`, `Employee/Place`, `Client`), plus token-verified password reset flows (`ResetToken` schema).
- **Queue & Timetable Engine (`server/src/queues`, `server/src/timetables`):**
  - Manages service queues, assigned staff stations (`places`), client positions, approval/cancellation states, and conflict-checked appointment slots.
  - Request payloads validated and normalized via custom NestJS pipes (`ScheduleValidationPipe`, `DataTransformationPipe`) and `class-validator` DTOs.
- **Asynchronous Job Processing (`server/src/schedule`, `server/src/processors`):**
  - Uses **Bull** backed by **Redis (`ioredis`)** to enqueue delayed appointment reminder jobs (`send-appointment-reminder`) and process transactional HTML emails asynchronously via **Nodemailer** and **Handlebars** templates (`confirmation.hbs`, `passreset.hbs`).
- **API Protection & Testing:**
  - Global rate limiting via `@nestjs/throttler` to protect endpoints against brute-force and abuse.
  - Unit and integration test suites built with **Jest** (`*.spec.ts`) and **Supertest** (`app.e2e-spec.ts`).

---

## Tech Stack

| Layer | Technologies |
| :--- | :--- |
| **Backend** | NestJS 10, TypeScript 5.7, Mongoose 8 (MongoDB), Bull / ioredis (Redis), Passport JWT, Nodemailer + Handlebars, Day.js, `@nestjs/throttler` |
| **Frontend** | React 19, TypeScript, React Router 7, Ant Design (Antd 5), Axios, SASS/SCSS, Parcel 2 |
| **Testing & Tooling** | Jest, Supertest (E2E), ESLint 9, Prettier, Concurrently |

---

## Project Structure

```text
queue-management/
├── client/                     # React 19 + TypeScript SPA (Parcel)
│   └── src/
│       ├── api/                # Axios HTTP client & interceptors
│       ├── components/         # Modals, forms, data tables, layout, debounced controls
│       ├── context/            # Auth & application state context
│       ├── interfaces/         # Shared TypeScript domain interfaces
│       ├── pages/              # Queues, QueueDetails, Schedule, Profile, Auth pages
│       └── router/             # Protected & role-gated route definitions
└── server/                     # NestJS 10 REST API
    ├── src/
    │   ├── auth/               # JWT access/refresh strategies & Passport guards
    │   ├── database/           # MongoDB connection service
    │   ├── dto/                # Request validation DTOs
    │   ├── mail/               # Nodemailer service & Handlebars email templates
    │   ├── pipes/              # Custom schedule validation & transformation pipes
    │   ├── processors/         # Bull worker processor for background email jobs
    │   ├── queues/             # Queue CRUD, client progression & staff assignment
    │   ├── roles/              # Role management & RBAC guards
    │   ├── schedule/           # Redis/Bull delayed notification scheduler
    │   ├── schemas/            # Mongoose schemas (User, Queue, Timetable, Role, ResetToken)
    │   ├── timetables/         # Staff availability & slot booking engine
    │   └── users/              # User account management
    └── test/                   # Supertest E2E suite
```

---

## Local Setup & Installation

### 1. Prerequisites
- **Node.js** `>= 18.x`
- **MongoDB** (local instance on port `27017` or MongoDB Atlas URI)
- **Redis** (local instance on port `6379`, Docker, or WSL on Windows)
- **SMTP / Gmail App Password** (for Nodemailer transactional emails)

### 2. Clone & Install Dependencies

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

Or run each service individually:

```bash
# Start Redis (macOS / Linux)
redis-server --daemonize yes

# Start NestJS backend in watch mode (port 3000)
npm run start:server

# Start React frontend via Parcel (port 1234)
npm run start:client
```

### 5. Run Tests

```bash
# Unit tests
npm test --prefix server

# End-to-end tests
npm run test:e2e --prefix server
```
