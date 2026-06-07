# PrepAI — AI Interview Coach

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

**PrepAI** is a full-stack web application that lets you practice real-time voice interviews with an AI-powered interviewer. It adapts questions to your resume, supports live coding for technical roles, and delivers detailed analytics and feedback to accelerate your interview preparation — all **100% free**, right in your browser.

---

## Features

- **Voice-Powered Interviews** — Real-time speech-to-text and text-to-speech via the Web Speech API for immersive conversational practice.
- **Resume-Aware Questions** — Upload your resume (PDF). The AI extracts your skills, experience, and projects, then tailors every question to your profile.
- **Live Code Editor** — Built-in Monaco editor (VS Code engine) for Data Structures & Algorithms mode. Run and submit code in 7 languages with AI-powered evaluation.
- **10 Interview Modes** — Frontend, Backend, MERN Stack, Full Stack, Java, Python, DSA, HR, System Design, and Custom.
- **Adaptive Difficulty** — Questions automatically adjust (Easy → Medium → Hard) based on your performance.
- **Smart Evaluation** — Each answer is scored across 6 dimensions (Technical Accuracy, Communication, Confidence, Problem Solving, Completeness, Depth of Understanding).
- **Comprehensive Feedback** — End-of-interview reports with aggregated scores, recommendation (Strong Hire → Needs Improvement), named strengths/weaknesses with evidence, and a 3-phase improvement roadmap.
- **Analytics Dashboard** — Track your progress with score gauges, trend charts, per-mode performance breakdowns, and interview history.
- **Google OAuth** — Sign in securely with your Google account.
- **Dark Theme UI** — Polished glassmorphism design with smooth animations built on Tailwind CSS and Framer Motion.

---

## Tech Stack

### Frontend

| Technology | Purpose |
|---|---|
| [React 18](https://react.dev) | UI framework |
| [Vite 5](https://vitejs.dev) | Build tool & dev server |
| [Tailwind CSS 3](https://tailwindcss.com) | Utility-first CSS |
| [Framer Motion 11](https://www.framer.com/motion) | Animations & transitions |
| [Monaco Editor](https://microsoft.github.io/monaco-editor) | Code editor (VS Code engine) |
| [Firebase](https://firebase.google.com) | Google OAuth authentication |
| [React Router DOM 6](https://reactrouter.com) | Client-side routing |

### Backend

| Technology | Purpose |
|---|---|
| [Node.js](https://nodejs.org) (≥18) | Runtime |
| [Express 4](https://expressjs.com) | Web framework |
| [MongoDB](https://www.mongodb.com) + [Mongoose 8](https://mongoosejs.com) | Database & ODM |
| [JSON Web Tokens](https://jwt.io) | Stateless authentication |
| [Groq Cloud](https://groq.com) | LLM inference for questions, evaluation & feedback |
| [ImageKit](https://imagekit.io) | Resume PDF storage |
| [Wandbox](https://wandbox.org) | Remote code execution |

---

## Getting Started

### Prerequisites

- Node.js ≥ 18
- MongoDB instance (local or Atlas)
- A [Groq Cloud](https://groq.com) API key
- An [ImageKit](https://imagekit.io) account
- A [Firebase](https://firebase.google.com) project with Google Auth enabled

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/JoelMoirangthem/ai-interview.git
   cd ai-interview
   ```

2. **Set up the backend**

   ```bash
   cd backend
   cp .env.example .env    # or create .env based on the template
   npm install
   ```

   Configure the following environment variables in `backend/.env`:

   | Variable | Description |
   |---|---|
   | `MONGO_URI` | MongoDB connection string |
   | `JWT_SECRET` | Secret key for signing JWT tokens |
   | `GROQ_API_KEY` | Groq Cloud API key |
   | `IMAGEKIT_PRIVATE_KEY` | ImageKit private key |
   | `IMAGEKIT_PUBLIC_KEY` | ImageKit public key |
   | `IMAGEKIT_URL_ENDPOINT` | ImageKit URL endpoint |
   | `FIREBASE_PROJECT_ID` | Firebase project ID |
   | `RESEND_API_KEY` | (Optional) Resend email API key |

3. **Set up the frontend**

   ```bash
   cd ../frontend
   cp .env.example .env
   npm install
   ```

   Configure `frontend/.env`:

   | Variable | Description |
   |---|---|
   | `VITE_API_URL` | Backend API URL (default `http://localhost:3000/api`) |
   | `VITE_FIREBASE_API_KEY` | Firebase Web API key |
   | `VITE_FIREBASE_AUTH_DOMAIN` | Firebase auth domain |
   | `VITE_FIREBASE_PROJECT_ID` | Firebase project ID |

4. **Run the app**

   Start the backend (from `backend/`):
   ```bash
   npm run dev
   ```

   In a separate terminal, start the frontend (from `frontend/`):
   ```bash
   npm run dev
   ```

   The app will be available at `http://localhost:5173`.

---

## Project Structure

```
ai-interview/
├── backend/                  # Express API server
│   ├── config/               # Database configuration
│   ├── controllers/          # Route handlers (auth, interview, resume, code, analytics)
│   ├── middleware/            # Auth, rate limiting, error handling, file upload
│   ├── models/               # Mongoose schemas (User, Resume, Interview)
│   ├── routes/               # API route definitions
│   ├── services/             # Business logic (AI, PDF, ImageKit, interview state)
│   ├── utils/                # Helpers, validators
│   └── server.js             # Entry point
│
├── frontend/                 # React SPA
│   ├── public/               # Static assets
│   ├── src/
│   │   ├── components/       # Reusable UI components
│   │   ├── context/          # Auth context provider
│   │   ├── hooks/            # Custom hooks (voice, service status, AI status)
│   │   ├── pages/            # Route pages (Home, Auth, Dashboard, InterviewRoom, Results, etc.)
│   │   ├── services/         # API client (Axios)
│   │   └── App.jsx           # Root component
│   └── index.html            # HTML entry
│
├── render.yaml               # Render deployment config
└── README.md
```

---

## Deployment

The app is configured for deployment on [Render](https://render.com) via `render.yaml`. Two services are defined:

1. **Backend API** — Node.js web service (free tier)
2. **Frontend** — Static site built from `frontend/`

To deploy:

1. Push your repository to GitHub.
2. Connect your repository to Render.
3. Render will automatically provision both services using the `render.yaml` blueprint.

The live instance is available at [https://free-ai-interview-backend.onrender.com](https://free-ai-interview-backend.onrender.com).

---

## Security

- **Helmet** — Security headers (CSP, XSS, etc.)
- **Rate Limiting** — 100 requests per 15 minutes (general), 10 per hour (resume uploads)
- **Input Validation** — All API inputs validated via `express-validator`
- **NoSQL Injection Protection** — `express-mongo-sanitize` middleware
- **JWT Authentication** — HTTP-only cookies with Authorization header fallback
- **File Restrictions** — PDF-only uploads, max 5MB

---

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

---

<p align="center">Built with ❤️ for job seekers everywhere.</p>
