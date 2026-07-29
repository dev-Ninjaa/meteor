# Architecture

## Overview

Meteor follows **Clean Architecture** principles, organizing code into layers with strict dependency rules. Each layer depends only on layers below it.

Meteor is a **swarm bounty marketplace**: multiple workers can simultaneously work on the same task. Each worker submits independently, and each submission is verified independently.

## Layers

```
┌─────────────────────────────────────────────┐
│           Controllers / Gateways             │  🔺 HTTP / WebSocket
├─────────────────────────────────────────────┤
│                 Services                     │  🔺 Business Logic
├─────────────────────────────────────────────┤
│         Blockchain / AI / Database           │  🔺 Infrastructure
├─────────────────────────────────────────────┤
│              PostgreSQL / Redis              │  🔺 Data Store
└─────────────────────────────────────────────┘
```

## Core Domain Concepts

### Task
A unit of work posted by a user. Unlike traditional freelance platforms, a task is NOT assigned to one worker. Multiple workers can join and submit independent solutions.

### TaskWorker
Tracks which workers have joined a task. Workers join tasks, work independently, and submit their results.

### Submission
A worker's independent deliverable for a task. Each submission is verified separately (by AI, manually, or both). This is the core unit of verification and payment.

### Verification
Belongs to a single Submission. Every submission gets its own verification result, ensuring independent quality control for each worker's output.

### Transaction
Records on-chain escrow operations. Each transaction is linked to a task and a user, storing blockchain metadata (tx hash, chain ID, block number).

## Module Dependency Graph

```
                    ┌──────────────┐
                    │   AppModule  │
                    └──────┬───────┘
           ┌────────────────┼────────────────┐
           ▼                ▼                ▼
    ┌──────────┐     ┌──────────┐     ┌──────────┐
    │  Auth    │     │  Users   │     │  Tasks   │
    └────┬─────┘     └────┬─────┘     └────┬─────┘
         │                │                │
         ▼                ▼                ▼
    ┌──────────┐     ┌──────────┐     ┌──────────┐
    │    AI    │     │Submiss.  │     │Marketpl. │
    └────┬─────┘     └────┬─────┘     └────┬─────┘
         │                │                │
         └────────────────┼────────────────┘
                          ▼
                   ┌──────────────┐
                   │  Payments    │
                   └──────┬───────┘
                          │
                          ▼
                   ┌──────────────┐
                   │  Blockchain  │
                   │  (Infra)     │
                   └──────────────┘

    ┌──────────┐     ┌──────────┐     ┌──────────┐
    │ Notif.   │     │WebSocket │     │ Database │
    └──────────┘     └──────────┘     └──────────┘
```

## Feature Modules

Each feature module follows this structure:

```
module/
  module.file.ts          # Module definition
  controller.file.ts     # HTTP routes
  service.file.ts        # Business logic
  dto/
    create-*.dto.ts      # Create request validation
    update-*.dto.ts      # Update request validation
    query-*.dto.ts       # Query/filter validation
    response-*.dto.ts    # Response serialization
  entities/
    *.entity.ts          # Domain entity
  guards/
    *.guard.ts           # Module-specific guards
```

## Blockchain Layer

Controllers NEVER communicate with Monad directly. The `BlockchainService` in `src/blockchain/` encapsulates all EVM interaction:

```
PaymentService ──► BlockchainService ──► Monad RPC
```

## AI Layer

The AI module separates prompts from logic:

```
AIService ──► prompts/*.prompt.ts ──► Google Gemini API
```

Prompts are NEVER hardcoded inside services. They live in `src/ai/prompts/`.

## Common Module

The `common/` directory contains shared infrastructure:

- **filters/** - Exception filters (AllExceptions, HttpException)
- **interceptors/** - Logging, response transformation
- **pipes/** - Global validation pipe
- **guards/** - JWT auth guard
- **decorators/** - Custom decorators (Public, CurrentUser, IsEthereumAddress)
- **pipes/** - GlobalValidationPipe (whitelist, transform, forbidNonWhitelisted)
- **types/** - Shared TypeScript types and interfaces
- **utils/** - Utility functions

## Data Flow

```
Client ──► Controller ──► Service ──► Repository ──► Prisma ──► PostgreSQL
                │              │            │
                ▼              ▼            ▼
             DTOs          Entities      Prisma Models

Client ──► Controller ──► Service ──► BlockchainService ──► Monad RPC
Client ──► Controller ──► Service ──► AIService ──► Gemini API
```

## Security Flow

```
Bootstrap ──► Env Validation ──► Helmet ──► Rate Limit ──► CORS ──► JWT Guard ──► Controller
                                                                         │
                                                                    Optional: Public
```

## WebSocket Architecture

```
Client ──► Socket.IO ──► Gateway ──► EventEmitterService ──► Business Services
                              │
                         Authentication
                              │
                      JWT Token (Bearer)
```

## Swarm Flow (vs Traditional Freelance)

| Aspect | Traditional Freelance | Swarm Marketplace (Meteor) |
|--------|----------------------|---------------------------|
| Assignment | One worker per task | Many workers per task |
| Model | BountyApplication → AssignedTo | TaskWorker → independent Submission |
| Verification | Single verification per task | Per-submission verification |
| Payment | One payout | Per-approved-submission payout |
| Escrow | Lock entire bounty | Lock per-worker allocation |
