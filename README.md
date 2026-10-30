# AI Mystery Room 🕵️

An AI-powered detective mystery game where players create and solve procedurally generated cases using Google's Gemini API.

## Features

- **AI-Generated Mysteries** — Create unique cases from your own premise
- **Three Difficulty Levels** — Easy (3 suspects), Medium (4 suspects), Hard (5 suspects)
- **Interactive Investigation** — Discover clues, request hints, and build your case
- **Secure Scoring** — Server-side score calculation prevents cheating
- **Secret Protection** — Solution is never exposed until accusation is submitted

## Tech Stack

| Layer      | Technology                          |
| ---------- | ----------------------------------- |
| Frontend   | React + Vite + TypeScript + Tailwind CSS |
| Backend    | Node.js + Express + TypeScript      |
| Database   | MongoDB + Mongoose                  |
| AI         | Google Gemini API (server-side)     |
| Validation | Zod                                 |

## Getting Started

### Prerequisites

- Node.js 18+
- MongoDB (local or Atlas)
- Gemini API key from [Google AI Studio](https://aistudio.google.com/)

### Setup

1. **Clone and install dependencies:**
   ```bash
   # Server
   cd server
   npm install

   # Client
   cd ../client
   npm install
   ```

2. **Configure environment variables:**
   ```bash
   # Copy the example and fill in your values
   cp .env.example server/.env
   ```
   Edit `server/.env` with your actual `GEMINI_API_KEY` and `MONGODB_URI`.

3. **Start the development servers:**
   ```bash
   # Terminal 1 — Server (port 4000)
   cd server
   npm run dev

   # Terminal 2 — Client (port 5173)
   cd client
   npm run dev
   ```

4. **Open** `http://localhost:5173` in your browser.

## API Endpoints

| Method | Endpoint                          | Description               |
| ------ | --------------------------------- | ------------------------- |
| POST   | `/api/cases`                      | Generate a new mystery    |
| GET    | `/api/cases/:id`                  | Get current case state    |
| POST   | `/api/cases/:id/clues/:clueId/discover` | Discover a clue    |
| POST   | `/api/cases/:id/hints`            | Request next hint         |
| POST   | `/api/cases/:id/accuse`           | Submit final accusation   |
| GET    | `/api/cases/:id/result`           | Get result after completion |
| GET    | `/health`                         | Health check              |

## Scoring

```
finalScore = max(0, basePoints + discoveredClues × 5 − hintsUsed × 10)
```

- **Easy:** 100 base · **Medium:** 150 base · **Hard:** 200 base
- Base points = 0 if accusation is wrong
- Score is always calculated server-side

## Project Structure

```
ai-mystery-room/
├── client/                 # React + Vite frontend
│   ├── src/
│   │   ├── api/            # API client layer
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/          # Route pages
│   │   └── types/          # TypeScript type definitions
│   └── package.json
├── server/                 # Express backend
│   ├── src/
│   │   ├── config/         # App configuration
│   │   ├── controllers/    # Route handlers
│   │   ├── middleware/      # Session, error handling
│   │   ├── models/          # Mongoose models
│   │   ├── routes/          # Express routes
│   │   ├── schemas/         # Zod validation schemas
│   │   ├── services/        # Business logic (scoring, AI generation)
│   │   └── utils/           # Serializers and helpers
│   └── package.json
├── .env.example
├── .gitignore
├── README.md
└── SPEC.md
```

## Security Notes

- Gemini API key is server-side only
- Solution/culprit data is withheld from all API responses until case completion
- Undiscovered clue content is never sent to the client
- Session tokens are stored in HTTP-only cookies
- Rate limiting is applied to case generation
- All scores are server-computed from persisted state

## License

MIT
