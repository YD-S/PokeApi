#  PokéAPI Creator

**PokéAPI Creator** is a full-stack web application that allows users to generate, view, and manage custom Pokémon using AI image generation.  
It supports **manual prompt-based creation** and **composition mode** (combining animals and abilities).

---

##  Tech Stack

### ️ Frontend
- **Vue 3 + Vite + TypeScript**
- **TailwindCSS**
- **Pinia** for state management
- **Axios** for API communication

### ️ Backend
- **Node.js + Express + TypeScript**
- **Sequelize ORM** (PostgreSQL)
- **JWT Authentication**
- **Passport (Google OAuth2)**
- **Swagger API Docs**

###  Dev Environment
- **Docker Compose** with isolated services:
    - `frontend` – Vue dev server
    - `backend` – Express + TypeScript + Nodemon
    - `db` – PostgreSQL 16

---

##  Project Structure

```
yd-s-pokeapi/
├── backend/             # Express + TypeScript API
├── frontend/            # Vue 3 + Vite app
├── docker-compose.dev.yml
├── env-example
└── .github/workflows/   # GitHub Actions
```

---

## ️ Environment Setup

Copy the example environment file and fill in your own credentials:

```bash
cp env-example .env
```

### Required Variables

| Variable | Description |
|-----------|-------------|
| `PORT` | Backend port (e.g. 3000) |
| `POSTGRES_USER` | PostgreSQL username |
| `POSTGRES_PASSWORD` | PostgreSQL password |
| `POSTGRES_DB` | Database name |
| `GOOGLE_CLIENT_ID` | Google OAuth Client ID |
| `GOOGLE_CLIENT_SECRET` | Google OAuth Client Secret |
| `BACKEND_URL` | Backend base URL (e.g. `http://localhost:3000`) |
| `JWT_SECRET` | JWT secret for access tokens |
| `JWT_REFRESH_SECRET` | JWT secret for refresh tokens |

---

##  Running the Project (Docker)

Make sure **Docker** and **Docker Compose** are installed.

### 1️⃣ Build & start containers

```bash
docker compose -f docker-compose.dev.yml up --build
```

### 2️⃣ Access the services

| Service | URL |
|----------|-----|
| Frontend | [http://localhost:5173](http://localhost:5173) |
| Backend API | [http://localhost:3000](http://localhost:3000) |
| Swagger Docs | [http://localhost:3000/api-docs](http://localhost:3000/api-docs) |
| PostgreSQL | `localhost:5432` |

### 3️⃣ Stop containers
```bash
docker compose -f docker-compose.dev.yml down
```

---

##  Local Development (without Docker)

If you prefer running manually:

### Backend
```bash
cd backend
npm install
npm run dev
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

Make sure PostgreSQL is running locally and `.env` matches your setup.

---

##  Authentication Flow

- **Email/Password Login** — Registers users with hashed credentials.
- **Google OAuth2 Login** — Handled via `/auth/google`.
- Tokens are **rotated** and **revocable**, using `accessToken` and `refreshToken`.

---

##  Pokémon Generation

Two creation modes:
1. **Prompt Mode:** Describe your Pokémon using free text.
2. **Compose Mode:** Combine animals and abilities to create a hybrid.

All images are generated using **Stable Diffusion API** and stored locally in `/uploads`.

---

##  API Documentation

Once the backend is running:
```
http://localhost:3000/api-docs
```
This includes full Swagger-generated documentation for all endpoints.

---

##  Database

- PostgreSQL via Sequelize ORM
- Models:
    - `User`
    - `Pokemon`
    - `Token`
- Relationships:
    - One-to-many: `User` → `Pokemon`

Database schema auto-syncs on server start (via `sequelize.sync()`).

---

##  Useful Commands

| Command | Description |
|----------|-------------|
| `npm run dev` | Run development server (auto-reload) |
| `npm run build` | Compile TypeScript (backend) or build frontend |
| `npm run lint` | Lint source files |
| `docker compose up --build` | Build and start all containers |

---

##  Deployment Notes

To deploy to production:
1. Create production Dockerfiles (`Dockerfile` without `.dev`).
2. Use a reverse proxy (e.g., **Nginx**) to serve both frontend and backend securely.
3. Store secrets via environment variables.
4. Run database migrations manually or through Sequelize CLI/Flyway if desired.

---

##  Author

** YashDev Singh**  
Fullstack Developer | 42 Málaga  
📧 [LinkedIn](https://www.linkedin.com/in/yashdev-singh/) | 🌐 [GitHub](https://github.com/YD-S)

---

## 🧩 License

This project is licensed under the **MIT License**.

---

> “Gotta code ’em all!”
