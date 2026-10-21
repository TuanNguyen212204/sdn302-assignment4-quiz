# Assignment 4 - Full-stack Quiz Application

## What the assignment contains

This project follows the supplied Assignment 4 requirements:

- Express and MongoDB backend.
- React frontend.
- Redux Toolkit for authentication, quizzes, answers and score state.
- React Router for login, dashboard, quiz and admin pages.
- Bootstrap 5 for forms, buttons and layout.
- Public signup creates a regular user. The seeded Mary account is the admin demo account.
- A regular user must log in before quizzes are fetched.
- A regular user can take a quiz and submit answers.
- An admin can create, read, update and delete questions and quizzes.
- Article and Manage Articles remain as simple static pages because the assignment screenshots include those menu items but the requirements do not request Article CRUD.

## Structure

```text
Assignment 4/
├── backend/                 # Express Generator 4.16.1 API
│   ├── app.js
│   ├── bin/www
│   ├── authenticate.js
│   ├── config/database.js
│   ├── models/
│   │   ├── user.js
│   │   ├── question.js
│   │   └── quiz.js
│   ├── routes/
│   │   ├── index.js
│   │   ├── users.js
│   │   ├── questions.js
│   │   └── quizzes.js
│   └── seed.js
├── frontend/                # Vite React frontend
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   └── store/
│   └── vercel.json
└── render.yaml              # Optional Render backend configuration
```

The backend was scaffolded with:

```powershell
npx express-generator@4.16.1 --no-view backend
```

The frontend was scaffolded with:

```powershell
npm create vite@latest frontend -- --template react --no-interactive
```

## Run locally

Terminal 1:

```powershell
cd "D:\SDN302\Assignment 4\backend"
npm install
Copy-Item .env.example .env
# Set a JWT_SECRET of at least 32 characters in .env
npm run seed
npm start
```

Terminal 2:

```powershell
cd "D:\SDN302\Assignment 4\frontend"
npm install
Copy-Item .env.example .env
npm run dev
```

Open http://localhost:5174.
The backend runs at http://localhost:3004.
The frontend calls VITE_API_URL, which defaults to http://localhost:3004.

The seed creates these demo accounts when they do not already exist:

- Admin: `Mary` / `MaryPass123!`
- Regular user: `John` / `JohnPass123!`

It also creates the five questions shown in the supplied screenshots and the
`General Knowledge` quiz. Existing records are kept.

## Demo flow

1. Open `/login` and log in as John.
2. Open Quiz and choose General Knowledge.
3. Select an option for each question.
4. Submit the final answer to see the score.
5. Log out and log in as Mary.
6. Open Manage Questions to add, edit and delete a question.
7. Open Manage Quizzes to add, edit and delete a quiz and attach questions.
8. Article is a static page matching the navigation in the screenshots.

The server calculates the score from the correct answer stored in MongoDB. The
frontend never receives `correctAnswerIndex` for regular users before submission.
Admin responses include the answer index for management.

## Checks completed

- `npm run build` in frontend passes.
- `npm run lint` in frontend passes.
- Backend authentication, validation, role checks, question/quiz CRUD, score
  calculation and question deletion reference cleanup pass the isolated API check.
- Local browser check passes login, dashboard, quiz navigation, answer submission,
  score display, admin question CRUD and admin quiz CRUD.

## Deployment plan

### Frontend on Vercel

Import the Git repository into Vercel with:

- Root Directory: `Assignment 4/frontend` (or `frontend` if the repository root is Assignment 4).
- Framework: Vite.
- Build Command: `npm run build`.
- Output Directory: `dist`.
- Environment variable: `VITE_API_URL=https://YOUR-BACKEND-URL`.

`frontend/vercel.json` rewrites client-side routes to `index.html` so refresh works
on `/login`, `/dashboard`, `/admin` and quiz routes.

### Backend

The backend cannot use the local MongoDB memory server in production. Deploy it
on Render/Railway/another Node host with MongoDB Atlas:

- Root Directory: `Assignment 4/backend` (or `backend` if repository root is Assignment 4).
- Build Command: `npm ci`.
- Start Command: `npm start`.
- Environment variables: `NODE_ENV=production`, `MONGODB_URI`, `JWT_SECRET`,
  `FRONTEND_URL=https://YOUR-VERCEL-DOMAIN`.

Do not put `MONGODB_URI` or `JWT_SECRET` in Git. After deployment, run the seed
against the production database only if the demo data is required. The current
`render.yaml` documents this backend setup; it does not create an external MongoDB
instance automatically.

### GitHub

The repo name chosen for this assignment is `sdn302-assignment4-quiz`.
GitHub login was required before creating it. If the browser session is already
logged in, create the empty repository and push this folder with:

```powershell
git add .
git commit -m "Build Assignment 4 full-stack quiz application"
git remote add origin https://github.com/YOUR_USERNAME/sdn302-assignment4-quiz.git
git push -u origin main
```
