# Meteor

Real-time bounty marketplace where users create small tasks (bounties), other users complete them, AI assists in generating and verifying tasks, and Monad enables instant escrow-based payments.

## Tech Stack

| Category | Technology |
|----------|-----------|
| Runtime | Node.js 24 |
| Language | TypeScript |
| Framework | NestJS 11 |
| Database | PostgreSQL 17 |
| ORM | Prisma 6 |
| Cache | Redis 7 |
| WebSockets | Socket.IO |
| Auth | JWT (Passport) |
| AI | Google Gemini |
| Blockchain | Monad (Viem) |
| Validation | Class Validator |
| API Docs | Swagger / OpenAPI |
| Logging | Pino |
| Testing | Jest + Supertest |
| Linting | ESLint + Prettier |
| Containerization | Docker + Docker Compose |

## Prerequisites

- Node.js >= 24
- npm >= 11
- Docker && Docker Compose

## Getting Started

### 1. Clone and install

```bash
git clone <repo-url>
cd meteor
npm install
```

### 2. Environment variables

```bash
cp .env.example .env
# Edit .env with your configuration
```

### 3. Start infrastructure

```bash
docker compose up -d postgres redis
```

### 4. Database setup

```bash
npx prisma generate
npx prisma migrate dev --name init
npx prisma db seed
```

### 5. Start the server

```bash
npm run start:dev
```

## Available Scripts

| Script | Description |
|--------|-------------|
| `npm run build` | Build the project |
| `npm run start:dev` | Start in development mode with watch |
| `npm run start:prod` | Start in production mode |
| `npm run lint` | Run ESLint |
| `npm run format` | Run Prettier |
| `npm test` | Run unit tests (167+ tests across 21 suites) |
| `npm run test:e2e` | Run end-to-end tests |
| `npm run test:cov` | Run tests with coverage |
| `npm run typecheck` | Run TypeScript type checking |
| `npm run prisma:generate` | Generate Prisma client |
| `npm run prisma:migrate` | Run database migrations |
| `npm run prisma:studio` | Open Prisma Studio |
| `npm run docker:up` | Start all Docker services |
| `npm run docker:down` | Stop all Docker services |

## API Documentation

When the server is running, visit `http://localhost:4000/docs` for Swagger UI.

## Project Structure

```
src/
  auth/            # Authentication module (wallet-based JWT)
  users/           # User management module
  tasks/           # Bounty/task CRUD and swarm tracking
  marketplace/     # Marketplace listing and search
  submissions/     # Task submission and verification
  payments/        # Monad escrow payment module
  ai/              # Google Gemini AI integration
  notifications/   # In-app notification module
  websocket/       # Socket.IO real-time gateway
  blockchain/      # Monad EVM interaction service
  database/        # Prisma service and module
  redis/           # Redis caching and pub/sub
  config/          # Configuration modules and env validation
  common/          # Shared utilities, guards, filters, interceptors
  contracts/       # Smart contract ABIs and types
```

## Architecture

This project follows Clean Architecture principles with clear separation between:

- **Controllers** - Handle HTTP requests/responses
- **Services** - Business logic
- **Repositories** - Data access via Prisma
- **DTOs** - Data transfer objects with validation
- **Guards** - Authentication and authorization
- **Interceptors** - Request/response transformation
- **Filters** - Exception handling
- **Modules** - Feature encapsulation

## License

MIT
