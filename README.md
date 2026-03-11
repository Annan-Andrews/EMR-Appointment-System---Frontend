# MERN EMR Appointment System — Frontend

Frontend for a role-based EMR appointment scheduling system.

- **Backend/API repo**: [EMR-Appointment-System---Backend](https://github.com/Annan-Andrews/EMR-Appointment-System---Backend)

## Roles & features
- **Super Admin**: manage doctors/receptionists, configure doctor schedules
- **Receptionist**: view slots, book appointments, manage patients/appointments
- **Doctor**: view only their own appointments

## Tech stack
React + Vite, Redux Toolkit, React Router, Axios, TailwindCSS

---

## Local setup

### 1) Install dependencies
```bash
npm install

  2) Configure environment variables
Create a .env file in the project root:

VITE_API_URL=http://localhost:5000/api
3) Run dev server
npm run dev
App runs on the Vite URL printed in the terminal (commonly http://localhost:5173).

Authentication notes (important)
Access token is stored client-side and sent as Authorization: Bearer <token>.
Refresh token is httpOnly cookie set by the backend.
Axios interceptor auto-calls POST /auth/refresh on 401 and retries the failed request.
