# Queues Management App

A queues management system built using **NestJS** for the backend, **React** with TypeScript for the frontend, **Redis** for scheduling, and **MongoDB** for data storage. This app supports managing clients, appointments, places (employees), and their schedules.

---

## Features

- **Client Management**: Add, update, and view clients.
- **Appointments**: Schedule, manage, and track appointments.
- **Places (Employees)**: Assign and manage employees for specific tasks or appointments.
- **Queue Scheduling**: Efficient queue scheduling and management powered by Redis.
- **Date Handling**: Time manipulation using `dayjs`.
- **API Integration**: Simplified and consistent API calls with `axios`.
- **Scalable Architecture**: Modular and scalable design using NestJS and React.
- **Authentication and Authorization**:
  - Role-based access control for different user roles.
  - Guards to protect routes and ensure secure access.
- **Throttling**: Rate limiting to prevent abuse and ensure application stability.

---

## Technologies Used

### Backend
- **NestJS**: Modular and scalable framework for building server-side applications.
- **Redis**: Used for scheduling and queue management.
- **MongoDB**: Database for storing app data (clients, appointments, places).
- **Bull**: Queue management library for Redis.

### Frontend
- **React**: UI library for building the user interface.
- **TypeScript**: For static type checking and improved developer experience.
- **React Query**: Efficient state and server data management.
- **Day.js**: Lightweight library for parsing, validating, manipulating, and formatting dates.
- **Axios**: Promise-based HTTP client for API requests.
- **Ant Design (Antd)**: UI framework with ready-to-use components for building responsive interfaces.

---

## Installation

### Prerequisites
Ensure you have the following installed or done:
- Node.js (>=14.x)
- Redis
- MongoDB account and connection
- Google App password for Nodemailer
  
## Connecting to MongoDB

To set up and connect to a MongoDB database, refer to the official MongoDB installation and connection guide: [MongoDB Installation Guide](https://www.mongodb.com/docs/manual/installation/), [NestJS documentation](https://docs.nestjs.com/techniques/mongodb).

Update the `MONGO_URI` in your `.env` file with your MongoDB connection string. For example:
```env
MONGO_URI=mongodb://localhost:27017/queues-management
```

---

## Setting up Redis

To install and configure Redis, refer to the official Redis documentation: [Redis Quick Start Guide](https://redis.io/docs/getting-started/).

If you're using Redis on WSL, ensure it is properly installed and configured. You can start Redis using the following command:
```bash
wsl -d Ubuntu redis-server --daemonize yes
```

---


## Creating a Google App Password for Nodemailer

To use **Nodemailer** with your Gmail account, you need to create a Google App Password. Follow these steps:

1. **Enable 2-Step Verification**:
   - Log in to your Google account.
   - Go to [Google Account Security](https://myaccount.google.com/security).
   - Under "Signing in to Google," enable 2-Step Verification.

2. **Generate an App Password**:
   - After enabling 2-Step Verification, return to the [Google Account Security page](https://myaccount.google.com/security).
   - Under "Signing in to Google," select "App Passwords."
   - Choose "Mail" as the app and "Other" as the device (enter a custom name if you prefer).
   - Google will generate a 16-character app password.

3. **Use the App Password in Nodemailer**:
   - Replace `MAIL_PASSWORD` in your `.env` file with the generated app password:
     ```env
     MAIL_PASSWORD=yourGeneratedAppPassword
     ```

For more details, refer to the official Google documentation: [Sign in using app passwords](https://support.google.com/accounts/answer/185833?hl=en).

### Steps
1. Clone the repository:
   ```bash
   git clone https://github.com/your-repo/queues-management-app.git
   cd queues-management-app
   ```

2. Since the client and server are separate projects, install dependencies for each part of the application. Run the following commands:

   - **Install dependencies in the main folder**:
     ```bash
     npm install
     ```

   - **Navigate to the server folder and install dependencies**:
     ```bash
     cd server
     npm install
     ```

   - **Navigate to the client folder and install dependencies**:
     ```bash
     cd ../client
     npm install
     ```

3. Configure environment variables:
   - Create a `.env` file in the `server` folder with the following template:
     ```env
     JWT_ACCESS_SECRET=yourAccessSecretKeyHere
     JWT_REFRESH_SECRET=yourRefreshSecretKeyHere
     MONGO_URI=yourMongoDBConnectionString
     MAIL_FROM=nodeMailerMailFromWho
     HOST_URL=yourAppBaseURL
     MAIL_USER=mailForNodeMailer
     MAIL_PASSWORD=servicePasswordForNodeMailer
     ```

4. Start the application using the main folder's script (leveraging `concurrently`):
   ```bash
   npm start
   ```

   This command will:
   - Start the Redis server (using WSL if on Windows).
   - Start the backend (NestJS server).
   - Start the frontend (React app).
  
    Here’s how the scripts section of your package.json could look, keeping in mind that Redis runs on Ubuntu WSL and can be customized:
     ```bash
     "scripts": {
        "start": "concurrently \"npm run start:redis\" \"npm run start:client\" \"npm run start:server\"",
        "start:redis": "wsl -d Ubuntu redis-server --daemonize yes || echo 'Ensure Redis is installed and properly configured on WSL'",
        "start:client": "npm run start --prefix client",
        "start:server": "npm run start:dev --prefix server"
      },
     ```

6. Open the application in your browser:
   ```bash
   http://localhost:1234
   ```

---

## Project Structure

### Backend (`server/`)
- `auth/`: Authentication and authorization logic (JWT, roles, guards).
- `constants/`: Application-wide constants.
- `database/`: Database connection and related utilities.
- `dayjs/`: Utilities for date and time manipulation.
- `decorators/`: Custom decorators used across the application.
- `dto/`: Data transfer objects for validation and transformation.
- `enums/`: Enumerations used in the application (mainly roles).
- `mail/`: Email-related logic and utilities.
- `pipes/`: Custom pipes for request data validation and transformation.
- `processors/`: Background job processors.
- `queues/`: Queue management and scheduling logic using Bull.
- `roles/`: Role-based access control logic.
- `schedule/`: Schedule-related utilities and services.
- `schemas/`: MongoDB schemas.
- `timetables/`: Logic for managing timetables and schedules.
- `types/`: Type definitions.
- `users/`: User management logic.
- `utils/`: General utility functions.
- `app.controller.ts`: Main application controller.
- `app.service.ts`: Main application service.
- `main.ts`: Entry point of the application.

### Frontend (`client/`)
- `api/`: API integration logic.
- `components/`: UI components (using Antd).
- `context/`: Context providers for global state management.
- `interfaces/`: TypeScript interfaces for props and API responses.
- `pages/`: Application pages (e.g., queues, login).
- `router/`: Routing logic and route definitions.
- `styles/`: Global and component-specific styles.
- `App.tsx`: Main application component.
- `index.tsx`: Entry point of the React application.

## Showcase

Here are some demonstrations of the application in action:

- [Video Showcase 1](https://www.youtube.com/watch?v=yefKQ_GZhiQ)
- [Video Showcase 2](https://www.youtube.com/watch?v=zStZsJkpKt4)

---
