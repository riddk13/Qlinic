# Qlinic

**Skip the line. Not the doctor.**

Qlinic is a clinic token and live queue system. Patients take a token from their phone, watch the queue move in real time and walk in right when it is their turn. Doctors manage the whole queue from one dashboard.

## Features

**Patients**
- Take a token online or by scanning the clinic QR code
- Live queue with people ahead and estimated wait time
- Notifications when the turn is near
- Active and history tabs for tokens, profile stats

**Doctors / clinic staff**
- Dashboard with daily stats and progress bar
- Call next, skip, or mark a patient as urgent
- Pause the queue for a break with a message and resume time
- Downloadable QR code for the clinic door
- Manage clinics (create, edit, delete) and patient history by date

**General**
- JWT authentication with patient and staff roles
- Real-time updates using Socket.io
- Dark mode, responsive colorful UI

## Tech stack

| Layer | Technology |
|---|---|
| Frontend | React (Vite), React Router, Tailwind CSS, Axios, Lucide icons |
| Backend | Node.js, Express.js |
| Database | MongoDB Atlas (Mongoose) |
| Real-time | Socket.io |
| Auth | JWT, bcrypt |

## Run locally

**1. Clone**
```bash
git clone https://github.com/riddk13/Qlinic.git
cd Qlinic
```

**2. Backend**
```bash
cd server
npm install
```
Create `server/.env` (see `.env.example`):
```
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=any_long_random_secret
```
```bash
npm run dev
```

**3. Frontend**
```bash
cd client
npm install
npm run dev
```
Open the URL shown in the terminal (usually http://localhost:5173).

## Project structure

```
Qlinic/
├── client/   React frontend
└── server/   Express API, Mongoose models, Socket.io
```

## Roadmap

- Auto-adjusting average consultation time
- Weekly report with charts
- WhatsApp / SMS alerts
- Online payment for consultation fee