# MERN EMR Appointment System

Role-based appointment scheduling system with:
- **Super Admin**: manage doctors/receptionists, configure doctor schedules
- **Receptionist**: view slots, book appointments, manage patients/appointments
- **Doctor**: view only own appointments

## Tech stack
- **Client**: React + Vite, Redux Toolkit, React Router, Axios, Tailwind
- **Server**: Node.js + Express, MongoDB + Mongoose, JWT (access + refresh), express-validator

---

## Architecture (high level)

### Backend (`/server`)
- **Entry**: `server/src/server.js` → `server/src/app.js`
- **Routes**: `server/src/routes/*`
- **Controllers**: `server/src/controllers/*`
- **Models**: `server/src/models/*` (User, Patient, Appointment, DoctorSchedule, AuditLog)
- **Middleware**:
  - `authMiddleware` verifies access token (Bearer)
  - `rbacMiddleware` enforces roles
  - `errorMiddleware` consistent API errors + 404 handler
- **Auth design**
  - Access token: short-lived (default **15m**)
  - Refresh token: long-lived (default **7d**), stored in **httpOnly cookie**
  - Refresh rotates and is stored per-user in DB (`User.refreshToken`)
- **Concurrency**
  - Double-booking prevented by DB unique index on `(doctorId, slotDate, slotStart)` for non-cancelled appointments

### Frontend (`/client`)
- **Routing**: `client/src/App.jsx` + `client/src/routes/ProtectedRoute.jsx`
- **Auth state**: `client/src/store/authSlice.js`
- **API client**: `client/src/api/axios.js`
  - Sends Bearer access token
  - On 401, automatically calls `/auth/refresh` and retries

---

## Environment variables

### Server (`/server/.env`)
Use `server/.env.example` as a template:

- `PORT=5000`
- `NODE_ENV=development`
- `MONGO_URI=...`
- `JWT_ACCESS_SECRET=...`
- `JWT_REFRESH_SECRET=...`
- `JWT_ACCESS_EXPIRES_IN=15m`
- `JWT_REFRESH_EXPIRES_IN=7d`
- `CLIENT_URL=http://localhost:5173`

### Client (`/client/.env`)
Create:

- `VITE_API_URL=http://localhost:5000/api`

---

## Local setup (from clean clone)

### 1) Install dependencies
```bash
cd server
npm install
cd ../client
npm install
