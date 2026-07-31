# API Reference

Base URL: `http://localhost:4000/api/v1`

Health endpoints are at the root: `http://localhost:4000/health`, `/health/live`, `/health/ready`

## Health

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/health` | Full health check (DB + Redis) | Public |
| GET | `/health/live` | Liveness probe (Kubernetes) | Public |
| GET | `/health/ready` | Readiness probe (Kubernetes) | Public |

### GET /health

```json
{
  "status": "ok",
  "timestamp": "2026-07-29T12:00:00.000Z",
  "uptime": "12345",
  "database": "connected",
  "redis": "connected"
}
```

**503 (degraded):**
```json
{
  "status": "degraded",
  "timestamp": "2026-07-29T12:00:00.000Z",
  "uptime": "12345",
  "database": "disconnected",
  "redis": "connected"
}
```

### GET /health/live
```json
{ "status": "alive", "timestamp": "2026-07-29T12:00:00.000Z" }
```

### GET /health/ready
```json
{ "status": "ready", "timestamp": "2026-07-29T12:00:00.000Z", "database": "connected", "redis": "connected" }
```

## Authentication

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/auth/nonce` | Get authentication nonce | Public |
| POST | `/auth/verify` | Verify wallet signature | Public |
| POST | `/auth/refresh` | Refresh JWT token | Public |
| POST | `/auth/logout` | Logout (invalidate token) | Authenticated |

### POST /auth/nonce
**Request:**
```json
{ "address": "0x1234..." }
```
**Response:**
```json
{ "nonce": "0xabcd...", "expiresAt": "2026-07-29T12:05:00.000Z" }
```

### POST /auth/verify
**Request:**
```json
{ "address": "0x1234...", "signature": "0x...", "nonce": "0xabcd..." }
```
**Response:**
```json
{
  "accessToken": "eyJhbG...",
  "refreshToken": "eyJhbG...",
  "user": { "id": "uuid", "walletAddress": "0x1234..." }
}
```

### POST /auth/refresh
**Request:**
```json
{ "refreshToken": "eyJhbG..." }
```
**Response:**
```json
{ "accessToken": "eyJhbG...", "refreshToken": "eyJhbG..." }
```

## Users

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/users/me` | Get current user profile | Authenticated |
| PATCH | `/users/me` | Update user profile | Authenticated |
| GET | `/users/:id` | Get user by ID | Authenticated |

### GET /users/me
**Response:**
```json
{
  "id": "uuid",
  "walletAddress": "0x1234...",
  "username": "alice",
  "reputation": 4.5,
  "completedTasks": 12,
  "createdAt": "2026-01-01T00:00:00.000Z"
}
```

### PATCH /users/me
**Request:**
```json
{ "username": "alice_updated", "bio": "Full-stack developer" }
```

## Tasks (Bounties)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/tasks` | Create a bounty | Authenticated |
| GET | `/tasks` | List bounties (paginated) | Authenticated |
| GET | `/tasks/:id` | Get bounty by ID | Authenticated |
| PATCH | `/tasks/:id` | Update a bounty | Owner |
| DELETE | `/tasks/:id` | Delete a bounty | Owner |
| POST | `/tasks/:id/join` | Join a task as worker | Authenticated |
| POST | `/tasks/:id/leave` | Leave a task | Authenticated |

### POST /tasks
**Request:**
```json
{
  "title": "Build a landing page",
  "description": "Create a responsive landing page",
  "reward": "100",
  "deadline": "2026-08-15T00:00:00.000Z",
  "tags": ["frontend", "react"]
}
```

### GET /tasks
**Query params:** `page`, `limit`, `status`, `tag`

## Marketplace

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/marketplace` | List available bounties | Authenticated |
| GET | `/marketplace/search` | Search bounties | Authenticated |

### GET /marketplace/search
**Query params:** `q` (search query), `tags`, `minReward`, `maxReward`, `page`, `limit`

## Submissions & Verification

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/submissions` | Submit work for a task | Authenticated |
| POST | `/submissions/:id/verify/ai` | AI verification | Authenticated |
| POST | `/submissions/:id/verify/manual` | Manual verification | Authenticated |
| GET | `/submissions/:id/verification` | Get verification result | Authenticated |

## Payments

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/payments/escrow/create` | Create escrow | Authenticated |
| POST | `/payments/escrow/release` | Release escrow | Authenticated |
| POST | `/payments/escrow/refund` | Refund escrow | Authenticated |
| GET | `/payments/transactions` | List transactions | Authenticated |

## AI

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/ai/generate-task` | Generate task with AI | Authenticated |
| POST | `/ai/verify-task` | AI verify task description | Authenticated |

### POST /ai/generate-task
**Request:**
```json
{
  "prompt": "I need a React developer to build a dashboard",
  "category": "frontend"
}
```

## Notifications

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/notifications` | List user notifications | Authenticated |
| PATCH | `/notifications/:id/read` | Mark notification as read | Authenticated |
| PATCH | `/notifications/read-all` | Mark all as read | Authenticated |

## WebSocket Events

**Connection:** `ws://localhost:4000` with `auth.token` in handshake

| Client → Server | Description |
|-----------------|-------------|
| `subscribe:user` | Join room for user-specific events |
| `unsubscribe:user` | Leave user room |
| `subscribe:task` | Join room for task-specific events |
| `unsubscribe:task` | Leave task room |

| Server → Client | Room | Description |
|-----------------|------|-------------|
| `task.created` | `task:{taskId}` | New task created |
| `task.updated` | `task:{taskId}` | Task updated |
| `task.published` | `task:{taskId}` | Task published |
| `task.cancelled` | `task:{taskId}` | Task cancelled |
| `task.joined` | `task:{taskId}` | Worker joined |
| `task.left` | `task:{taskId}` | Worker left |
| `submission.created` | `task:{taskId}` | Submission received |
| `submission.approved` | `task:{taskId}` | Submission approved |
| `submission.rejected` | `task:{taskId}` | Submission rejected |
| `verification.completed` | `task:{taskId}` | Verification completed |
| `escrow.locked` | `task:{taskId}` + `user:{userId}` | Escrow locked |
| `escrow.released` | `task:{taskId}` + `user:{userId}` | Escrow released |
| `escrow.refunded` | `task:{taskId}` + `user:{userId}` | Escrow refunded |
| `notification.created` | `user:{userId}` | New notification |

## Standard Response Format

**Success:**
```json
{
  "statusCode": 200,
  "message": "Success",
  "data": {},
  "timestamp": "2026-07-29T12:00:00.000Z",
  "path": "/api/v1/resource"
}
```

**Error:**
```json
{
  "statusCode": 400,
  "message": "Validation failed",
  "error": "Bad Request",
  "timestamp": "2026-07-29T12:00:00.000Z",
  "path": "/api/v1/resource"
}
```

## Error Codes

| Code | Description |
|------|-------------|
| 400 | Bad Request - Validation error |
| 401 | Unauthorized - Invalid or missing JWT |
| 403 | Forbidden - Insufficient permissions |
| 404 | Not Found - Resource not found |
| 409 | Conflict - Resource already exists |
| 429 | Too Many Requests - Rate limit exceeded |
| 500 | Internal Server Error |
