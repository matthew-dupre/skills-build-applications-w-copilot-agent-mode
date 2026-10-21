# OctoFit Tracker architecture

OctoFit Tracker is a three-tier application for a school fitness program. The starter code includes API contracts and intentionally incomplete implementation points so you can use GitHub Copilot agent mode in a test-driven loop.

![Three-tier OctoFit architecture](../.github/images/octofit-architecture.svg)

## Tier boundaries

- **Presentation tier**: React 19, Vite, React Router, Bootstrap, and a shared API client in `octofit-tracker/frontend/src`.
- **Logic tier**: Express and TypeScript routes/services in `octofit-tracker/backend/src` expose `/api/*` behavior on port `8000`.
- **Data tier**: Mongoose models and seed data in `octofit-tracker/backend/src/models` and `src/scripts/seed.ts` persist to MongoDB on port `27017`.

## Ports and environment rules

- MongoDB: `27017`
- Express API: `8000`
- Vite frontend: `5173`
- The browser calls relative `/api` paths. Vite proxies them to `http://localhost:8000`, so the unauthenticated API port stays private in Codespaces. `VITE_API_BASE_URL` can override the base URL.

## API contract

| Capability | Method and path | Expected behavior |
| --- | --- | --- |
| Activity tracking | `GET /api/activities`, `POST /api/activities` | List and create valid activity records. POST accepts `userId`, `teamId`, `type`, and `minutes`; `userId` and `teamId` must be well-formed IDs for an existing user and team; otherwise respond with a deliberate 4xx (never a 500 from a cast error). A created activity stores the submitted `user`, `team`, `type`, and `minutes` plus computed `points` and `occurredAt`. |
| Teams | `GET /api/teams`, `POST /api/teams` | List and create teams with members. Created and listed teams keep the submitted `name` and `mascot`. Reject a team without a name with `400`. |
| Leaderboard | `GET /api/leaderboard` | Return teams ordered by the sum of their activity points, highest first. Each entry has `teamName`, `totalPoints`, and a 1-based `rank`. |
| Workout suggestions | `GET /api/workouts/suggestions/:userEmail` | Recommend workouts from recent activity patterns for the matching seeded user's email address. The first suggestion's `focus` matches that user's goal or recent activity, with a `reason` explaining why. An email with no matching user returns a deliberate 4xx (for example, `404`). |

## Implementation decisions

Record your plan here before editing code.

- Presentation tier decision: Keep route-level React components focused on rendering and user interaction; use the shared API client for relative `/api` requests and provide loading, empty, and accessible error states.
- Logic tier decision: Keep HTTP parsing, status codes, and response envelopes in Express routes, with capability behavior and input validation in explicit service functions.
- Data tier decision: Enforce required fields and sensible defaults in Mongoose schemas; use referenced ObjectIds for relationships and preserve unrelated records when seeding.
- Activity tracking approach: Validate activity fields and ID formats, verify the referenced user and team exist, then persist the submitted references and activity details with computed points and an occurrence timestamp. Return deliberate 4xx responses for invalid input or missing references.
- Team management approach: List and create teams through the service layer, preserve the submitted name and mascot, maintain member references, and reject a missing name with `400`.
- Leaderboard approach: Aggregate activity points by team, sort totals descending, and assign 1-based ranks in the API response.
- Workout suggestions approach: Find the user by email, use the user's goal and recent activities to rank available workouts, and include a short rationale with each recommendation. Return a deliberate 4xx response when the user is unknown.

## Test plan

Run focused contracts first, then both builds. A contract failure identifies behavior missing from that tier; a build failure identifies a TypeScript or bundling issue that must be fixed before completion.

- Data-tier command: `npm run test:data --prefix octofit-tracker/backend` - a failure means model requirements, relationships, or safe/idempotent seed behavior do not meet the data contract.
- API command: `npm run test:api --prefix octofit-tracker/backend` - a failure means an endpoint's validation, status code, response data, sorting, or recommendation behavior violates the API contract.
- Frontend command: `npm test --prefix octofit-tracker/frontend` - a failure means a route does not render API data or provide the expected loading, empty, error, or user-specific request behavior.
- Backend build command: `npm run build --prefix octofit-tracker/backend` - a failure means backend TypeScript does not type-check.
- Frontend build command: `npm run build --prefix octofit-tracker/frontend` - a failure means the frontend does not type-check or produce a Vite production build.
