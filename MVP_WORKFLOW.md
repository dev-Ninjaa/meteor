# Meteor – MVP End‑to‑End Workflow Document

> **Purpose** – Single source of truth for the complete happy‑path a user follows from landing page to on‑chain payment claim.  
> **Audience** – Frontend devs, backend devs, smart‑contract auditors, product & QA.  
> **Version** – 2025‑08‑01 (matches `IMPLEMENTATION.md`)

---

## 1. High‑Level Flow (Happy Path)

| Step | User Action | UI / Component | Front‑end Hook / State | Backend API(s) | Smart‑Contract Call |
|------|-------------|----------------|------------------------|----------------|---------------------|
| 1 | **Landing page** – reads thesis, vision, how‑it‑works | `HeroSection` … `OpenSourceSection` (static) | – | *none* | – |
| 2 | Clicks **“Try MVP”** | `Navbar` → `<Link to="/app/marketplace">` | React‑Router push `/app/marketplace` | – | – |
| 3 | **App layout** mounts (`/app/*`) | `AppLayout` → `Navbar` (tabs + `WalletConnectButton`) | `useLocation` → `isAppRoute=true` | – | – |
| 4 | **Connect Wallet** | `WalletConnectButton` (portal dropdown) | `useConnect()` / `useAccount()` (wagmi) | `POST /auth/nonce` → `POST /auth/verify` (SIWE) → JWT | – |
| 5 | **JWT stored** | `useAuth.login` mutation | `localStorage.setItem('accessToken'…)`, `refreshToken` | – | – |
| 6 | **Socket.io auto‑connect** | `useSocket` reads token | `socket.connect(token)` | – | – |
| 7 | **Marketplace loads** | `MarketplaceView` | `useMarketplace(params)` → `marketplaceApi.list(params)` | `GET /marketplace` (paginated) + `GET /marketplace/tags` | – |
| 8 | **Filter / search** | Category pills, selects, text input | Zustand store → re‑fetch `useMarketplace` | `GET /marketplace?...` | – |
| 9 | **Publish Task (AI Prompt)** | `CreateTaskModal` (global store) | `setIsCreateModalOpen(true)` | – | – |
|10| **Auto‑generate spec** | Prompt textarea + “Auto‑Generate” | *mocked* `handleAiParse()` → fills form | `POST /ai/generate-task` (Bearer) → `{title, description, reward, tags, workersRequired, maxWorkers, verificationMode, category}` | – |
|11| **Edit & Publish** | Same modal → “Publish Task” | `createTask(dto)` → `tasksApi.create` | `POST /tasks` (Bearer) → `Task` (status `DRAFT`) | – |
|12| **Lock Escrow** (creator) | `TaskDetailView` “Lock Escrow” | `usePayments.lockEscrow({taskId, rewardPerWorker, maxWorkers, amount})` | `POST /payments/escrow/create` → `BlockchainService.createEscrow` | `lockEscrow(bytes32 taskId, uint256 rewardPerWorker, uint256 maxWorkers)` **payable** |
|13| **Task appears on Marketplace** | `MarketplaceView` re‑fetch | `useMarketplace` | `GET /marketplace` now includes task (status `OPEN`) | – |
|14| **Worker opens TaskDetail** | Card → `setSelectedTask` / router | `useTask(taskId)` → `tasksApi.get` | `GET /tasks/:id` (public) | – |
|15| **Worker Joins** | “Join Task” button | `useJoinTask.mutate(taskId)` | `POST /tasks/:id/join` (Bearer) → emits `task.joined` socket | – |
|16| **Worker Submits Work** | “Submit Work” modal (content + proof) | `useCreateSubmission.mutate({taskId, content, proof})` | `POST /tasks/:taskId/submissions` (Bearer) → emits `submission.created` | – |
|17| **Verification (AI or Manual)** | “Verify” tab → AI / Manual | AI: `useVerifySubmissionAi.mutate(id)` → `POST /submissions/:id/verify/ai` <br>Manual: `useVerifySubmissionManual.mutate({id, status, notes})` | AI → Gemini → `{passed, score, feedback}` <br>Manual → creator decision | – |
|18| **Release Payment** (creator or auto on AI pass) | “Release” button | `usePayments.releaseEscrow({taskId, submissionId, workerAddress})` | `POST /payments/escrow/release` → `BlockchainService.releaseFunds` | `releaseEscrow(bytes32 taskId, bytes32 submissionId)` |
|19| **Worker Claims (pull‑payment)** | Wallet page → “Claim” | `useClaimPayment` (wagmi generated) → `writeContract({functionName:'claimPayment', args:[taskId]})` | – (direct RPC) | `claimPayment(bytes32 taskId)` |
|20| **Real‑time UI updates** | All views (`NotificationCenter`, `MarketplaceView`, `TaskDetailView`, `DashboardView`) | `useSocket()` → listeners for `task.joined`, `submission.created`, `verification.completed`, `escrow.locked`, `escrow.released`, `notification.created` | Socket.io events (no REST) | – |

---

## 2. Component ↔ Hook ↔ API Map

| Front‑end Component | Primary Hook(s) | Backend API(s) Used | Contract Call(s) |
|---------------------|----------------|---------------------|------------------|
| `WalletConnectButton` | `useConnect`, `useDisconnect`, `useAccount` (wagmi) | `POST /auth/nonce`, `POST /auth/verify` | – |
| `Navbar` (app routes) | `useLocation`, `useAccount` | – | – |
| `MarketplaceView` | `useMarketplace`, `useMarketplaceTags`, `useSearchMarketplace` | `GET /marketplace`, `GET /marketplace/tags`, `GET /marketplace/search` | – |
| `CreateTaskModal` | `useAI.generateTask` (optional), `useCreateTask` | `POST /ai/generate-task`, `POST /tasks` | – |
| `TaskDetailView` | `useTask`, `useJoinTask`, `useCreateSubmission`, `useVerifySubmissionAi`, `useVerifySubmissionManual`, `useClaimPayment` (wagmi) | `GET /tasks/:id`, `POST /tasks/:id/join`, `POST /tasks/:id/submissions`, `POST /submissions/:id/verify/ai`, `POST /submissions/:id/verify/manual` | `claimPayment` (wagmi) |
| `NotificationCenter` | `useNotifications`, `useUnreadCount`, `useMarkRead`, `useMarkAllRead`, `useDeleteNotification`, `useSocket` | `GET /notifications`, `GET /notifications/unread-count`, `PATCH /notifications/:id/read`, `PATCH /notifications/read-all`, `DELETE /notifications/:id` | – |
| `WalletView` | `usePayments.transactions`, wagmi `useContractBalance`, `useTaskEscrow` | `GET /payments/transactions` | `getContractBalance`, `getTaskEscrow` (read) |
| `DashboardView` | `useTasks.list`, `useSubmissions.list`, `usePayments.transactions` | `GET /tasks?createdBy=me`, `GET /submissions`, `GET /payments/transactions` | – |
| `ProfileView` | `useAuth.me`, `useAuth.updateMe` | `GET /users/me`, `PATCH /users/me` | – |

---

## 3. Smart‑Contract Functions (BountyEscrow)

| Function | Mutability | Params | Called By |
|----------|------------|--------|-----------|
| `lockEscrow` | `payable` | `bytes32 taskId, uint256 rewardPerWorker, uint256 maxWorkers` | Backend `BlockchainService.createEscrow` (POST `/payments/escrow/create`) |
| `releaseEscrow` | `nonpayable` | `bytes32 taskId, bytes32 submissionId` | Backend `BlockchainService.releaseFunds` (POST `/payments/escrow/release`) |
| `refundRemaining` | `nonpayable` | `bytes32 taskId` | Backend `BlockchainService.refundEscrow` (POST `/payments/escrow/refund`) |
| `claimPayment` | `nonpayable` | `bytes32 taskId` | Front‑end `useClaimPayment` (wagmi) – direct RPC |
| `getTaskEscrow` | `view` | `bytes32 taskId` | Front‑end `useTaskEscrow` (wagmi) |
| `getContractBalance` | `view` | – | Front‑end `useContractBalance` (wagmi) |

---

## 4. Real‑Time Event Map (Socket.io)

| Server → Client Event | Payload | UI Consumer |
|-----------------------|---------|-------------|
| `task.created` | `{taskId, title, description, reward, status, createdById, tags}` | `MarketplaceView` (prepend) |
| `task.updated` | `{taskId, …updates}` | `TaskDetailView` |
| `task.published` | `{taskId, title, createdById, status}` | `MarketplaceView` |
| `task.cancelled` | `{taskId, title, createdById, status}` | `DashboardView` |
| `task.joined` | `{taskId, userId, workerId}` | `TaskDetailView` (progress bar) |
| `task.left` | `{taskId, userId, workerId}` | `TaskDetailView` |
| `submission.created` | `{taskId, submissionId, workerId}` | `TaskDetailView` (submissions tab) |
| `submission.approved` | `{taskId, submissionId, workerId, status}` | `TaskDetailView` (verification tab) |
| `submission.rejected` | `{taskId, submissionId, workerId, status}` | `TaskDetailView` |
| `verification.completed` | `{taskId, submissionId, workerId, status, mode}` | `VerificationLiveStatus` |
| `escrow.locked` | `{taskId, userId, amount, txHash}` | `WalletView`, `DashboardView` |
| `escrow.released` | `{taskId, userId, submissionId, txHash}` | `WalletView`, `NotificationCenter` |
| `escrow.refunded` | `{taskId, userId, txHash, reason}` | `WalletView` |
| `notification.created` | `{userId, notification}` | `NotificationCenter` (badge + list) |

Client → Server subscriptions: `subscribe:user`, `unsubscribe:user`, `subscribe:task`, `unsubscribe:task`.

---

## 5. File & Folder Index (New MVP Code)

```
meteor-frontend/
├── src/
│   ├── components/
│   │   ├── ui/
│   │   │   ├── WalletConnectButton.tsx
│   │   │   └── toaster.tsx
│   │   ├── layout/
│   │   │   ├── Navbar.tsx
│   │   │   ├── NotificationCenter.tsx
│   │   │   └── Toasts.tsx
│   │   ├── marketplace/
│   │   │   ├── CreateTaskModal.tsx
│   │   │   └── InteractiveSolverModal.tsx
│   │   ├── shared/
│   │   │   ├── VerificationLiveStatus.tsx
│   │   │   ├── VerificationBadge.tsx
│   │   │   ├── ProgressIndicator.tsx
│   │   │   └── ... (AiSummaryCard, SubmissionRenderer, etc.)
│   │   └── landing/ (HeroSection, ProblemSection, …)
│   ├── features/
│   │   ├── tasks/TaskDetailView.tsx
│   │   ├── marketplace/MarketplaceView.tsx
│   │   ├── dashboard/DashboardView.tsx
│   │   ├── wallet/WalletView.tsx
│   │   └── profile/ProfileView.tsx
│   ├── hooks/
│   │   ├── useAuth.ts
│   │   ├── useTasks.ts
│   │   ├── useSubmissions.ts
│   │   ├── usePayments.ts
│   │   ├── useNotifications.ts
│   │   ├── useAI.ts
│   │   ├── useSocket.ts
│   │   └── useToast.ts
│   ├── lib/
│   │   ├── api/*.api.ts (auth, tasks, marketplace, submissions, payments, notifications, ai, wallet)
│   │   ├── wallet.ts          // wagmi config + SIWE
│   │   ├── chains.ts          // Monad testnet
│   │   ├── socket.ts          // Socket.io client + event map
│   │   ├── generated.ts       // wagmi CLI output (contract hooks)
│   │   └── utils.ts           // cn(), formatAddress()
│   ├── providers.tsx          // WagmiProvider + QueryClientProvider
│   ├── App.tsx                // React‑Router routes (/ , /app/*)
│   └── main.tsx
├── wagmi.config.ts
├── tsconfig.json (paths @/* → src/*)
└── package.json
```

---

## 6. Commands Cheat‑Sheet

```bash
# ---- Monorepo root -------------------------------------------------
bun run build                 # builds backend + frontend
bun run typecheck             # tsc for both packages
bun run --cwd meteor-backend start:dev   # NestJS dev server (port 4000)
bun run --cwd meteor-frontend dev        # Vite dev server (port 3000)

# ---- Contract -------------------------------------------------------
cd meteor-contracts
bun run build                 # forge build
bun run test                  # forge test (13 passing)
bun run deploy                # ./deploy.sh (writes deployment.json)

# ---- Frontend contract types ----------------------------------------
cd meteor-frontend
bun run wagmi:generate        # reads Foundry ABI → src/lib/generated.ts
```

---

## 7. Known Gaps / Next Work

| Area | Issue | Owner |
|------|-------|-------|
| **Backend AI auth** | `/ai/generate-task` & `/ai/verify-task` missing `@UseGuards(JwtAuthGuard)` | Backend |
| **Submission socket hang‑up** | `SubmissionsService.create()` throws “socket hang up” | Backend |
| **Manual verify 500** | `SubmissionsService.verifyManual()` crashes | Backend |
| **Frontend mock data** | `MarketplaceView`, `DashboardView`, `WalletView`, `ProfileView` still use Zustand mock arrays – wire to real hooks | Frontend |
| **E2E test script** | Automate full happy‑path (create → lock → join → submit → verify → claim) | QA / Dev |

---

*Generated from the living codebase – keep this file in sync with `IMPLEMENTATION.md` and the actual source.*