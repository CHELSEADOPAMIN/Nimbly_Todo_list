# Nimbly Todo list


A todo-list application built with the [DummyJSON API](https://dummyjson.com/docs/).

link：[https://todo.a2a.ing](https://todo.a2a.ing )

## Getting Started

### Pre requisites

- Node.js >= 18  
- pnpm >= 9  

### Installation & Development

```bash
# Install dependencies
pnpm install

# Start the development server
pnpm dev

# Build for production
pnpm build

# Start the production server
pnpm start

```

Once the server is running, open:

http://localhost:3000

### Demo Account

You can use the following demo account to log in:

| Username | Password    |
|----------|------------|
| `emilys` | `emilyspass` |

## Running Tests

```bash
# Run all tests
pnpm test

# Run tests in watch mode
pnpm test:watch

# Generate a coverage report
pnpm test:coverage
```

## Tech Stack

| Category            | Technology |
|--------------------|------------|
| Framework          | Next.js 16 (App Router) + React 19 |
| Language           | TypeScript (strict mode) |
| Styling            | Tailwind CSS 4 |
| HTTP Client        | Axios (with interceptors and token refresh queue) |
| Server State       | TanStack Query 5 |
| Forms              | React Hook Form + Zod 4 |
| Testing            | Vitest 4 |
| Notifications      | Sonner |
| Icons              | Lucide React |

## Assignment Requirements
### 1. Login Authentication

Users authenticate by entering their username and password on the login page.

**Implementation:**

- Managed form state using React Hook Form, with Zod schema for runtime input validation  
- Called `POST /auth/login` to obtain access and refresh tokens  
- Stored tokens on successful login and updated global authentication state via `AuthProvider`  
- Provided clear error feedback for network failures, 401 responses, and other authentication errors  

**Related Files:**  
`app/login/page.tsx`  `lib/api/auth.ts`  `lib/providers/auth-provider.tsx`


### 2. Logout Functionality

Users can log out by clicking the logout button at the bottom of the sidebar.

**Implementation:**

- Cleared access/refresh tokens from `localStorage`, removed cookie flags, and reset in-memory user state  
- Automatically redirected to the login page after cleanup  
- Ensured all three storage layers including `localStorage`, cookies, and React Context state were cleared to prevent stale session data  

**Related Files:**  
`components/layout/sidebar.tsx`  `lib/token.ts`  `lib/providers/auth-provider.tsx`


### 3. Persistent Login State

Users remain logged in even after closing and reopening the browser (including auth tokens).

**Implementation:**

- Persisted tokens in `localStorage` (versioned key: `nimbly:access-token:v1`) and mirrored them in cookies for middleware access  
- On app initialization, `AuthProvider` checks for existing tokens and validates them via `GET /auth/me`  
- When tokens expire, Axios response interceptors automatically call `POST /auth/refresh` to refresh them transparently  
- Cookies configured with `SameSite=Lax` and `Secure` enabled in HTTPS environments  

**Related Files:**  
`lib/token.ts`  `lib/api/client.ts`  `middleware.ts`


### 4. Todo List & Pagination 

Authenticated users can view their personal todo list with pagination support.

**Implementation:**

- Fetched the full dataset via `GET /todos/user/{userId}?limit=0` (DummyJSON does not support server-side filtering by `completed`)  
- Split data client-side into two views: **Today** (incomplete) and **History** (completed)  
- Applied client-side pagination (10 items per page) on the filtered dataset, memoized with `useMemo` for performance optimization  
- Implemented a smart ellipsis pagination algorithm:  
  - Display all page numbers when ≤ 7 pages  
  - Display `1 ... 4 5 6 ... 10` pattern when > 7 pages  
- Managed data fetching with TanStack Query using a 30-second `staleTime` to reduce unnecessary refetching  

**Related Files:**  
`lib/hooks/use-todos.ts`  `lib/api/todos.ts`  `components/todos/todo-pagination.tsx`

### 5. Route Protection

Unauthenticated users are prevented from accessing protected routes.

**Implementation:**

- Performed authentication checks at the Next.js middleware layer, ensuring no UI flicker before redirects  
- `/` redirects to `/todos` or `/login` based on authentication state  
- `/login` redirects authenticated users to `/todos`  
- `/todos/*` routes are intercepted and redirected to `/login` if the user is not authenticated  
- Middleware reads authentication status from cookies, as the Edge Runtime cannot access `localStorage`  

**Related File:**  
`middleware.ts`


### 6. Error Handling

| Layer        | Responsibility                              | Implementation |
|-------------|----------------------------------------------|---------------|
| HTTP Layer  | Automatic token refresh on expiration, network error handling | Axios response interceptors |
| Page Layer  | Fallback UI for rendering failures           | React Error Boundary (`app/todos/error.tsx`) |
| Query Layer | Display UI when data fetching fails          | TanStack Query `isError` state + error UI |
| Mutation Layer | Rollback failed write operations + user notification | Mutation `onError` cache rollback + toast notifications |

**Related Files:**  
`lib/api/client.ts` · `app/todos/error.tsx` · `lib/hooks/use-todo-mutations.ts`


### 7. Unit Testing

Unit tests were written for critical business logic.

**Implementation:**

- Used Vitest with a jsdom environment and React Testing Library  
- Test coverage includes: token storage logic, notes persistence logic, pure mutation helper functions, and pagination algorithm  
- Covered edge cases such as unavailable `localStorage`, DummyJSON duplicate ID collisions, and empty dataset fallbacks  
- Automatically cleared `localStorage` and cookies after each test to prevent cross-test contamination  

**Related Files:**  
`__tests__/unit/`


## Highlights

As this is a productivity-focused Todo application, I placed strong emphasis on user experience, resilience, and real-world engineering challenges rather than just implementing basic CRUD features. Below are the key enhancements:

### Concurrent Token Refresh Queue

When an access token expires, multiple concurrent requests may receive `401` responses simultaneously.  
The HTTP client resolves this using a global lock + request queue mechanism:

- The first `401` triggers a token refresh  
- Subsequent `401` requests are queued and wait for the refresh to complete  
- On successful refresh, all queued requests are retried with the new token  
- If refresh fails, all queued requests are rejected and the authentication state is cleared  

**Tech:** Axios response interceptors   Promise queue   Global lock pattern  


### Optimistic Updates with Automatic Rollback

All CRUD operations use an optimistic update strategy:

- The UI cache updates immediately when a mutation starts  
- The API request runs in the background  
- On success, the server response is merged into the cache  
- On failure, the cache automatically rolls back to the pre-mutation snapshot and a toast notification is shown  

Core mutation logic is extracted into pure functions (`todo-mutation-helpers.ts`), decoupled from React for easier independent testing.

To handle DummyJSON’s behavior where `POST` always returns `id: 255`, an ID collision detection mechanism was implemented.  
Optimistically created todos use decrementing negative IDs (`-1, -2, -3...`) to avoid conflicts with real server data.

**Tech:** TanStack Query `useMutation`  `onMutate` snapshots  `onError` rollback  Pure function helpers  


### Loading / Empty / Error States

Each asynchronous data region implements a complete three-state UI:

- **Loading:** Skeleton screens matching real content width (10 rows with randomized widths)  
- **Empty:** Context-aware empty state messaging depending on the current view  
- **Error:** Error message with retry option  

During mutations, related buttons display a loading state to prevent duplicate submissions.

**Tech:** Skeleton components  Conditional rendering  `useMutationState` for every item mutation tracking  

### Four-Column Workspace Layout

Implemented a four-column layout consisting of **Sidebar + NavPanel + TodoList + DetailPanel**.  
Users can navigate, browse, select, and edit within a single view without any page transitions.
For mobile responsiveness, the Sidebar and NavPanel collapse into a hamburger menu overlay, while the DetailPanel slides in from the right to optimize screen space.

## Project Structure
```
app/
├── layout.tsx — Root layout: fonts, providers, Toaster
├── globals.css — Global styles: CSS variables, Organic theme, grain texture
├── page.tsx — Root route redirect
├── providers.tsx — Combined AuthProvider + QueryProvider
├── login/
│   └── page.tsx — Login page
└── todos/
    ├── page.tsx — Todo workspace (four-column layout)
    └── error.tsx — Error Boundary

components/
├── layout/
│   ├── sidebar.tsx — Sidebar: avatar, navigation, logout
│   ├── nav-panel.tsx — Navigation panel: Today / History
│   └── detail-panel.tsx — Detail panel: edit, notes, delete
├── todos/
│   ├── todo-list.tsx — Todo list container
│   ├── todo-create.tsx — Create todo input
│   ├── todo-item.tsx — Single todo: checkbox, inline editing
│   ├── todo-pagination.tsx — Pagination with smart ellipsis
│   └── todo-skeleton.tsx — Loading skeleton
└── ui/
    ├── checkbox.tsx — Custom checkbox component
    ├── dialog.tsx — Native <dialog> wrapper
    └── skeleton.tsx — Reusable skeleton component

lib/
├── api/
│   ├── client.ts — Axios instance + token refresh queue
│   ├── auth.ts — Auth API
│   └── todos.ts — Todo CRUD API
├── hooks/
│   ├── use-auth.ts — Auth context (React 19 use() API)
│   ├── use-todos.ts — Todo query + filtering + pagination
│   ├── use-todo-mutations.ts — CRUD mutations + optimistic updates
│   ├── todo-mutation-helpers.ts — Pure mutation helpers
│   └── use-todo-notes.ts — Debounced notes persistence
├── providers/
│   ├── auth-provider.tsx — Authentication state management
│   └── query-provider.tsx — TanStack Query configuration
├── types/
│   ├── auth.ts — Auth-related types
│   └── todo.ts — Todo-related types
├── token.ts — Token storage (localStorage + cookies)
├── notes.ts — Notes storage (localStorage)
└── cn.ts — className utility

middleware.ts — Route protection (Edge middleware)

tests/
├── setup.ts — Test environment setup
└── unit/
    ├── token.test.ts — Token storage tests
    ├── notes.test.ts — Notes storage tests
    ├── todo-mutation-helpers.test.ts — Mutation helper tests
    └── pagination-logic.test.ts — Pagination algorithm tests
```
