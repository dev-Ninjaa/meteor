# Meteor Backend API Documentation

**Base URL:** `http://localhost:4000/api/v1` (dev) | `https://api.meteor.xyz/api/v1` (prod)
**WebSocket:** `ws://localhost:4000` (dev) | `wss://api.meteor.xyz` (prod)

---

## Health Checks

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/health` | Public | Full health check (DB + Redis) |
| `GET` | `/health/live` | Public | Liveness probe (K8s) |
| `GET` | `/health/ready` | Public | Readiness probe (K8s) |

---

## Authentication

All endpoints except public ones require **JWT Bearer token** in header:
```
Authorization: Bearer <access_token>
```

### SIWE Authentication Flow

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/auth/nonce` | Public | Request nonce for wallet signing |
| `POST` | `/auth/verify` | Public | Verify signature, returns JWT tokens |
| `POST` | `/auth/refresh` | Public | Refresh access token using refresh token |
| `POST` | `/auth/logout` | Bearer | Invalidate current token |

#### Request/Response Examples

**POST `/auth/nonce`**
```json
// Request
{ "walletAddress": "0x71C7656EC7b8c5b5e4b7d9Ae2E5dD0e0c1a2b3c4d" }

// Response (200)
{ 
  "nonce": "a1b2c3d4e5f6...", 
  "walletAddress": "0x71C7656EC7b8c5b5e4b7d9Ae2E5dD0e0c1a2b3c4d" 
}
```

**POST `/auth/verify`**
```json
// Request
{ 
  "walletAddress": "0x71C7656EC7b8c5b5e4b7d9Ae2E5dD0e0c1a2b3c4d",
  "signature": "0x1234...abcd" 
}

// Response (200)
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "dGhpcyBpcyBhIHJlZnJlc2ggdG9rZW4...",
  "user": {
    "id": "user-uuid",
    "username": "dev_akshad",
    "walletAddress": "0x71C7656EC7b8c5b5e4b7d9Ae2E5dD0e0c1a2b3c4d",
    "reputation": 1250
  }
}
```

---

## Users

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/users/me` | Bearer | Get current user profile |
| `PATCH` | `/users/me` | Bearer | Update profile (username, avatar, bio) |
| `GET` | `/users/:walletAddress` | Public | Get user by wallet address |

---

## Tasks

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/tasks` | Bearer | Create new task |
| `GET` | `/tasks` | Public | List tasks with pagination/filtering |
| `GET` | `/tasks/:id` | Public | Get task by ID |
| `PATCH` | `/tasks/:id` | Bearer | Update task (creator only) |
| `DELETE` | `/tasks/:id` | Bearer | Soft delete task (creator only) |
| `POST` | `/tasks/:id/publish` | Bearer | Publish draft task (creator only) |
| `POST` | `/tasks/:id/cancel` | Bearer | Cancel task (creator only) |
| `POST` | `/tasks/:id/join` | Bearer | Join open task as worker |
| `POST` | `/tasks/:id/leave` | Bearer | Leave task before submitting |

### Query Parameters (`GET /tasks` & `/tasks/:id`)

| Param | Type | Description |
|-------|------|-------------|
| `page` | number | Page number (default: 1) |
| `limit` | number | Items per page (default: 20) |
| `search` | string | Search in title/description |
| `status` | enum | `DRAFT\|OPEN\|IN_PROGRESS\|COMPLETED\|CANCELLED\|DISPUTED` |
| `createdBy` | string | Filter by creator wallet address |
| `tag` | string | Filter by tag |

### Create Task Body (`POST /tasks`)

```json
{
  "title": "Audit Smart Contract for Reentrancy",
  "description": "Review Solidity contract for reentrancy vulnerabilities in the withdraw function",
  "reward": "50.0",
  "tags": ["solidity", "security", "audit"],
  "workersRequired": 3,
  "maxWorkers": 5,
  "verificationMode": "AI",
  "allowAiVerification": true,
  "manualVerificationRequired": false,
  "tokenAddress": "0x0000000000000000000000000000000000000000"
}
```

---

## Marketplace (Public)

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/marketplace` | List open tasks with pagination |
| `GET` | `/marketplace/search` | Full-text search open tasks |
| `GET` | `/marketplace/tags` | Get all unique tags |

### Query Parameters

| Param | Type | Description |
|-------|------|-------------|
| `page` | number | Page number (default: 1) |
| `limit` | number | Items per page (default: 20) |
| `search` | string | Search query (for `/search`) |
| `category` | string | Filter by category |
| `minReward` | number | Minimum reward |
| `maxReward` | number | Maximum reward |
| `difficulty` | enum | `EASY\|MEDIUM\|HARD` |
| `tags` | string[] | Filter by tags |

---

## Submissions

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/tasks/:taskId/submissions` | Bearer | Submit work for a task |
| `GET` | `/tasks/:taskId/submissions` | Bearer | List submissions for a task (creator/worker) |
| `GET` | `/submissions/:id` | Bearer | Get single submission |
| `POST` | `/submissions/:id/verify/ai` | Bearer | AI verification (creator or admin) |
| `POST` | `/submissions/:id/verify/manual` | Bearer | Manual verification (creator or admin) |

### Create Submission Body

```json
{
  "content": "Fixed the reentrancy vulnerability by adding ReentrancyGuard from OpenZeppelin and using checks-effects-interactions pattern",
  "proof": "https://github.com/user/repo/pull/42/files"
}
```

### Manual Verification Body

```json
{
  "status": "APPROVED",
  "manualNotes": "Excellent fix, properly implemented checks-effects-interactions pattern"
}
```

---

## Payments (Escrow)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/payments/escrow/create` | Bearer | Lock escrow for task (creator only) |
| `POST` | `/payments/escrow/release` | Bearer | Release payment to worker (creator only) |
| `POST` | `/payments/escrow/refund` | Bearer | Refund escrow (creator only, cancelled/rejected) |
| `GET` | `/payments/transactions` | Bearer | List transactions with filters |
| `GET` | `/payments/transactions/:id` | Bearer | Get transaction by ID |

### Create Escrow Body

```json
{
  "taskId": "task-uuid",
  "rewardPerWorker": "50.0",
  "maxWorkers": 3
}
```

### Release Escrow Body

```json
{
  "taskId": "task-uuid",
  "submissionId": "submission-uuid",
  "workerAddress": "0xWorkerAddress..."
}
```

### Refund Escrow Body

```json
{
  "taskId": "task-uuid"
}
```

---

## Notifications

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/notifications` | Bearer | List notifications (paginated) |
| `GET` | `/notifications/unread-count` | Bearer | Get unread count |
| `PATCH` | `/notifications/:id/read` | Bearer | Mark as read |
| `PATCH` | `/notifications/read-all` | Bearer | Mark all as read |
| `DELETE` | `/notifications/:id` | Bearer | Delete notification |

---

## WebSocket Events

Connect: `ws://localhost:4000` with auth token:
```javascript
const socket = io('http://localhost:4000', {
  auth: { token: 'Bearer <access_token>' }
});
```

### Server → Client Events

| Event | Payload | Description |
|-------|---------|-------------|
| `task.created` | `{ taskId, title, description, reward, status, createdById, tags }` | New task published |
| `task.updated` | `{ taskId, ...updates }` | Task updated |
| `task.published` | `{ taskId, title, createdById, status }` | Task published |
| `task.cancelled` | `{ taskId, title, createdById, status }` | Task cancelled |
| `task.joined` | `{ taskId, userId, workerId }` | Worker joined |
| `task.left` | `{ taskId, userId, workerId }` | Worker left |
| `submission.created` | `{ taskId, submissionId, workerId }` | New submission |
| `submission.approved` | `{ taskId, submissionId, workerId, status }` | Submission approved |
| `submission.rejected` | `{ taskId, submissionId, workerId, status }` | Submission rejected |
| `verification.completed` | `{ taskId, submissionId, workerId, status, mode }` | AI/Manual verification done |
| `escrow.locked` | `{ taskId, userId, amount, txHash }` | Escrow locked on-chain |
| `escrow.released` | `{ taskId, userId, submissionId, txHash }` | Payment released |
| `escrow.refunded` | `{ taskId, userId, txHash, reason }` | Escrow refunded |
| `notification.created` | `{ userId, notification }` | New notification |

### Client → Server Events

| Event | Payload | Description |
|-------|---------|-------------|
| `subscribe:user` | `userId` | Subscribe to user notifications |
| `unsubscribe:user` | `userId` | Unsubscribe from user |
| `subscribe:task` | `taskId` | Subscribe to task updates |
| `unsubscribe:task` | `taskId` | Unsubscribe from task |

---

## AI Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/ai/generate-task` | Bearer | Generate task structure from natural language prompt |
| `POST` | `/ai/verify-task` | Bearer | AI verification of submission |

### Generate Task Body (`POST /ai/generate-task`)

```json
{
  "prompt": "I need 5 people to test my website and report bugs",
  "category": "testing"
}
```

### Generate Task Response (200)

```json
{
  "statusCode": 200,
  "message": "Success",
  "data": {
    "title": "Test Website for Bugs",
    "description": "Review landing page and report 3+ bugs with screenshots",
    "reward": "25.0",
    "tags": ["testing", "web", "qa"],
    "workersRequired": 3,
    "maxWorkers": 5,
    "verificationMode": "AI",
    "category": "testing"
  },
  "timestamp": "2026-08-01T03:00:00.000Z",
  "path": "/api/v1/ai/generate-task"
}
```

### Verify Task Body (`POST /ai/verify-task`)

```json
{
  "taskTitle": "Test Website Review",
  "taskDescription": "Review landing page and find bugs",
  "taskRequirements": "Find at least 3 bugs with reproduction steps",
  "submissionContent": "Found 4 bugs: 1) Button alignment 2) Mobile menu broken 3) Form validation missing 4) Slow load time",
  "submissionProof": "https://example.com/proof"
}
```

### Verify Task Response (200)

```json
{
  "statusCode": 200,
  "message": "Success",
  "data": {
    "passed": true,
    "score": 0.95,
    "feedback": "Submission meets all requirements. Found 4 bugs with clear reproduction steps."
  },
  "timestamp": "2026-08-01T03:00:00.000Z",
  "path": "/api/v1/ai/verify-task"
}
```

---

## Missing / Not Implemented

| Endpoint | Status | Notes |
|----------|--------|-------|
| `POST /submissions/:id/verify/manual` | ⚠️ 500 | Server error - needs fix |

---

## Error Responses

All errors follow standard format:

```json
{
  "statusCode": 400,
  "message": "Validation failed",
  "error": "Bad Request",
  "timestamp": "2026-08-01T12:00:00.000Z",
  "path": "/api/v1/tasks"
}
```

Common HTTP codes:
- `400` - Validation error (check DTO)
- `401` - Unauthorized (missing/invalid token)
- `403` - Forbidden (not owner/admin)
- `404` - Not found
- `409` - Conflict (already exists/joined)
- `500` - Server error

---

## Environment Variables

```bash
# Database
DATABASE_URL=postgresql://user:pass@localhost:5432/meteor_db

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# JWT
JWT_SECRET=your-secret
JWT_EXPIRATION=900
JWT_REFRESH_EXPIRATION=604800

# Monad
MONAD_RPC_URL=https://testnet-rpc.monad.xyz
MONAD_CHAIN_ID=10143
MONAD_ESCROW_CONTRACT_ADDRESS=0xD06122a48bcAfe76E4eAA8CE8922b20a709AA26d

# Google Gemini (for AI verification)
GEMINI_API_KEY=your-api-key

# CORS
CORS_ORIGIN=http://localhost:3000

# Logging
LOG_LEVEL=debug
```

---

## Contract Addresses

| Network | BountyEscrow | Explorer |
|---------|--------------|----------|
| Monad Testnet (10143) | `0xD06122a48bcAfe76E4eAA8CE8922b20a709AA26d` | [Monad Explorer](https://testnet.monadexplorer.com/address/0xD06122a48bcAfe76E4eAA8CE8922b20a709AA26d) |
| Localhost (Anvil 31337) | `0x5FbDB2315678afecb367f032d93F642f64180aa3` | - |

---

## Rate Limits

| Endpoint | Limit |
|----------|-------|
| Auth (`/auth/*`) | 10 req/min |
| Tasks (`/tasks`) | 60 req/min |
| Submissions | 30 req/min |
| Payments | 20 req/min |
| Marketplace | 100 req/min |
| Notifications | 60 req/min |

---

## SDK / Client Usage

```typescript
// Frontend API client (from meteor-frontend/src/lib/api/client.ts)
import { api } from '@/lib/api';

// Set token after auth
api.setToken(accessToken);

// Create task
const task = await api.post('/tasks', {
  title: 'Audit Smart Contract',
  description: 'Check for reentrancy',
  reward: '50.0',
  tags: ['security', 'solidity'],
  workersRequired: 3,
  maxWorkers: 5,
});

// Join task
await api.post(`/tasks/${taskId}/join`);

// Submit work
await api.post(`/tasks/${taskId}/submissions`, {
  content: 'Fixed the vulnerability...',
  proof: 'https://github.com/...'
});
```

---

## Deployment

```bash
# Development
docker compose up -d          # Start PostgreSQL, Redis, Backend
bun run start:dev             # Backend with hot reload

# Production
docker compose -f docker-compose.prod.yml up -d

# Run migrations
bunx prisma migrate deploy

# Generate Prisma client
bunx prisma generate
```