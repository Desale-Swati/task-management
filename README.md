# Task Management Application

A simple Angular task-management app built as a technical assessment. It demonstrates reactive forms, Angular Signals for state management, a mock API with localStorage persistence, Bootstrap UI, and routing.

## Setup

```bash
npm install
```

## Run

```bash
npm start
```

Open [http://localhost:4200](http://localhost:4200). The app redirects to `/tasks`.

## Live Demo (GitHub Pages)

Live URL: [https://desale-swati.github.io/task-management/](https://desale-swati.github.io/task-management/)

The app is deployed automatically via GitHub Actions whenever code is pushed to `master`.

To enable GitHub Pages (one-time):
1. Open the repo on GitHub → **Settings** → **Pages**
2. Under **Source**, select **GitHub Actions**

## Build

```bash
npm run build
```

Build for GitHub Pages:

```bash
npm run build:pages
```

---

## Architecture

```
src/app/
├── core/
│   ├── models/          # Task interfaces and types
│   ├── services/
│   │   ├── task-api.service.ts    # Mock API (CRUD operations)
│   │   └── task-state.service.ts  # Single source of truth (Signals)
│   └── utils/           # Pure functions (filtering, stats, overdue)
├── features/
│   ├── dashboard/       # Summary stats component
│   ├── tasks/           # Task list and form
│   └── not-found/       # 404 page
└── shared/              # Shared UI helpers
```

**Data flow:** Components → `TaskStateService` (Signals) → `TaskApiService` (mock) → in-memory data.

Components never call `HttpClient` directly. All API access goes through `TaskApiService`, and all state mutations go through `TaskStateService`.

---

## Routes

| Route | Description |
|-------|-------------|
| `/` | Redirects to `/tasks` |
| `/tasks` | Task list with filters and dashboard |
| `/tasks/new` | Create a new task |
| `/tasks/:id/edit` | Edit an existing task |
| `/**` | Not-found page |

---

## Completed Requirements

- [x] Task list with search, status/priority filters, overdue highlighting, empty state
- [x] Reactive form for create/edit with validation messages
- [x] Delete with confirmation dialog
- [x] Dashboard summary (total, completed, in-progress, overdue)
- [x] Routing with default redirect and not-found page
- [x] Angular Signals state management with immutable updates
- [x] Mock API service (CRUD)
- [x] Bootstrap UI for layout and components
- [x] Task data persisted in localStorage (survives page refresh)
- [x] Loading, error, and success feedback
- [x] Standalone components
- [x] Strong TypeScript typing

---

## README Questions

### 1. Why did you choose your state-management approach?

**Angular Signals** were chosen for simplicity and clarity within a small app. Signals provide a single source of truth, reactive derived state (`computed` for filtered tasks and stats), and readable templates without extra boilerplate. For this scope, Signals are lighter than NgRx while still demonstrating immutable updates and separation of concerns.

### 2. How is data passed between the API, state layer, and components?

1. **Components** call methods on `TaskStateService` (e.g. `loadTasks()`, `createTask()`).
2. **TaskStateService** calls `TaskApiService`, which returns RxJS Observables from an in-memory store.
3. On success, the state service updates Signals immutably (`signal.update`, spread operators).
4. **Components** read state via public readonly signals (`state.tasks()`, `state.filteredTasks()`, `state.stats()`).
5. **Derived state** (filters, stats) is computed in the state layer using `computed()`, not in components.

### 3. What technical trade-offs did you make because of the time limit?

- Used an in-memory mock API instead of JSON Server (simpler setup, no extra process).
- Focused on Bootstrap layout and core CRUD flows rather than advanced optional features.
- Inline confirmation dialog instead of a reusable dialog service.
- No debounced search (instant filter on keystroke).
- Navigation after create/update uses a callback rather than a fully reactive router effect.
- Form component loads a single task via API for edit mode instead of reading from state cache.

### 4. What would you improve before deploying to production?

- Replace mock API with a real backend and `HttpClient` with interceptors.
- Add authentication and authorization.
- Implement debounced search, pagination, and virtual scrolling for large lists.
- Extract a reusable confirmation dialog component/service.
- Add global error handling and toast notifications.
- Improve accessibility (ARIA, keyboard navigation, focus management).
- Add automated unit and E2E tests.
- Enable lazy-loaded feature routes.
- Add environment-based configuration.

### 5. How would you support thousands of tasks efficiently?

- **Server-side filtering, sorting, and pagination** — only fetch the current page.
- **Virtual scrolling** (`@angular/cdk/scrolling`) to render visible rows only.
- **Debounced search** to reduce API calls.
- **Memoized derived state** and avoid recomputing filters on unrelated changes.
- **OnPush change detection** on list components.
- For very large datasets, consider moving filter/stats computation to the backend.

---

## Assumptions

- Due dates are stored and compared as `YYYY-MM-DD` strings.
- A task is overdue if its due date is before today and status is not `completed`.
- Description is optional in the model but included in the form.
- Mock API simulates 300ms network delay and persists data to `localStorage`.

---

## Candidate Declaration

No AI coding assistants or code-generation agents were used to build this application. Development was done using personal Angular knowledge, official documentation, and general web search (Google) for reference. I am familiar with AI tools, but they were not used for writing or generating this assessment solution. I can explain and modify any part of the submitted code during a technical discussion.
