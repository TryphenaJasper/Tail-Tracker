# Animal Rescue & Adoption Platform — Project Scaffold

This is a starting skeleton, not a finished app. One feature (Animals — the
adoption listings) is built end-to-end as a working example. Everything
else is stubbed with comments telling you what to build and where.

## Structure

```
animal-rescue-app/
├── server/                  # Express + MongoDB API
│   ├── config/db.js         # MongoDB Atlas connection
│   ├── models/Animal.js     # Worked example — copy this pattern for Vet, Report
│   ├── controllers/         # Business logic (CRUD functions)
│   ├── routes/               # Maps URLs -> controller functions
│   ├── middleware/           # Empty — add auth-checking middleware here later
│   ├── .env.example
│   └── server.js             # Entry point
│
└── client/                  # React (Vite) frontend
    ├── src/
    │   ├── components/       # Reusable pieces (AnimalCard.jsx is the example)
    │   ├── pages/             # Full pages (Home, AnimalList are built)
    │   ├── services/          # API calls live here, not in components
    │   ├── context/           # Empty — good place for an AuthContext later
    │   └── App.jsx            # Routes — commented-out routes show what's next
    └── .env.example
```

## How the "Animals" feature works (your reference pattern)

1. `models/Animal.js` — defines the MongoDB schema (includes GeoJSON location
   for later "nearby" queries)
2. `controllers/animalController.js` — the actual logic (get, create, update, delete)
3. `routes/animalRoutes.js` — wires HTTP verbs + URLs to controller functions
4. `services/animalService.js` (client) — fetch() calls to your API, same
   pattern as your OpenWeatherMap app
5. `pages/AnimalList.jsx` — calls the service, manages loading/error state,
   renders `AnimalCard.jsx` for each animal

Build **Vet** and **Report** features by copying this exact five-step chain.

## Getting it running

**Server:**
```bash
cd server
npm install
cp .env.example .env   # fill in your real Mongo URI, keys, etc.
npm run dev
```

**Client (separate terminal):**
```bash
cd client
npm install
cp .env.example .env
npm run dev
```

Vite's dev server proxies `/api/*` requests to your Express server on port
5000 (see `vite.config.js`), so you don't have to deal with CORS in dev.

## Suggested build order (matches your one-feature-a-week rhythm)

1. ✅ Animal listings (scaffolded — style the cards, add a "create listing" form)
2. Supabase auth (signup/login, protect the "create listing" form)
3. Cloudinary image upload (wire into the create-listing form)
4. Vet model + nearby-vet geo query (copy Animal's `2dsphere` index pattern)
5. Mapbox map showing vets + strays
6. Abuse report form + TN helpline integration

## Things intentionally left for you

- No CSS yet — bring in your pink design system (`--pink-hot`, `--blush`, etc.)
- No auth middleware — you'll add a `middleware/authMiddleware.js` that
  checks the Supabase session before allowing create/update/delete
- No image upload logic yet — Cloudinary widget or signed upload, your call
- No deployment config — Vercel for client, Vercel/Render for server
