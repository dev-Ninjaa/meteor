# BountyEscrow Contract Documentation

## Overview

**BountyEscrow** is a non-custodial escrow smart contract for the Meteor swarm bounty marketplace. It handles secure, trust-minimized payments between task creators and multiple workers without the backend ever holding private keys or user funds.

**Network**: Monad Testnet (EVM-compatible)
**Language**: Solidity ^0.8.24
**License**: MIT

---

## Architecture Philosophy

```
┌─────────────────┐     ┌──────────────────┐     ┌────────────────────┐
│   Frontend      │     │    Backend       │     │  BountyEscrow.sol  │
│   (Next.js)     │◄───►│   (NestJS)       │◄───►│  (Monad Testnet)   │
│                 │     │                  │     │                    │
│ • Wallet connect│     │ • Marketplace    │     │ • Lock escrow      │
│ • Sign txns     │     │ • AI verification│     │ • Claim payment    │
│ • Read state    │     │ • WebSocket      │     │ • Refund remaining │
└─────────────────┘     │ • Index events   │     │ • Emit events      │
                        └──────────────────┘     └────────────────────┘
```

**Key Principle**: Backend handles **matching, verification, coordination** (Web2 speed). Contract handles **value transfer only** (Web3 trust).

---

## Contract Interface

### Events (Indexed for Backend)

```solidity
event EscrowLocked(bytes32 indexed taskId, address indexed creator, uint256 rewardPerWorker, uint256 maxWorkers);
event WorkerPaid(bytes32 indexed taskId, address indexed worker, uint256 amount);
event EscrowRefunded(bytes32 indexed taskId, address indexed creator, uint256 amount);
```

### Functions

| Function | Caller | Purpose |
|----------|--------|---------|
| `lockEscrow(taskId, rewardPerWorker, maxWorkers)` | **Creator** (pays MON) | Deposits `rewardPerWorker × maxWorkers` into contract |
| `claimPayment(taskId)` | **Worker** (pull pattern) | Worker claims their reward after verification |
| `refundRemaining(taskId)` | **Creator** | Returns unclaimed MON to creator |
| `getTaskEscrow(taskId)` | Anyone (view) | Returns task state |
| `getContractBalance()` | Anyone (view) | Returns contract ETH balance |

---

## Data Structures

```solidity
struct TaskEscrow {
    address creator;              // Task creator
    uint256 rewardPerWorker;      // Fixed payout per worker (e.g., 0.05 MON)
    uint256 maxWorkers;           // Maximum workers allowed (e.g., 100)
    uint256 totalLocked;          // rewardPerWorker × maxWorkers
    uint256 totalReleased;        // Sum paid out so far
    bool cancelled;               // Refund initiated
    mapping(address => bool) paidWorkers;  // Prevent double-claim
}
```

---

## User Flows

### 1. Creator Publishes Task (Locks Escrow)

```javascript
// Frontend: User connects wallet, signs transaction
const taskId = keccak256("task-uuid-from-backend");
const rewardPerWorker = parseEther("0.05");  // 0.05 MON per worker
const maxWorkers = 100;
const totalValue = rewardPerWorker * maxWorkers; // 5 MON

await contract.lockEscrow(taskId, rewardPerWorker, maxWorkers, { value: totalValue });
// Emits: EscrowLocked(taskId, creator, 0.05 MON, 100)
```

**Backend**: Listens for `EscrowLocked` → syncs to DB → shows task as "Funded"

---

### 2. Workers Join & Submit (Off-Chain)

```
Worker clicks "Join"     → Backend DB: TaskWorker record
Worker submits work      → Backend DB: Submission record  
Backend AI verifies      → Backend: Verification result
Backend notifies worker  → WebSocket: "Your submission passed, claim payment"
```

**No blockchain interaction** - pure Web2 speed.

---

### 3. Worker Claims Payment (Pull Pattern)

```javascript
// Frontend: Worker clicks "Claim Reward", signs transaction
await contract.claimPayment(taskId);
// Contract: Transfers rewardPerWorker directly to worker
// Emits: WorkerPaid(taskId, worker, 0.05 MON)
```

**Backend**: Listens for `WorkerPaid` → updates DB → shows "Paid"

---

### 4. Creator Refunds (If Cancelled/Unfilled)

```javascript
// Frontend: Creator clicks "Cancel Task", signs transaction
await contract.refundRemaining(taskId);
// Contract: Returns (totalLocked - totalReleased) to creator
// Emits: EscrowRefunded(taskId, creator, remainingAmount)
```

---

## Security Features

| Protection | Implementation |
|------------|----------------|
| **Reentrancy** | Custom `nonReentrant` modifier on all state-changing functions |
| **Exact Deposit** | `require(msg.value == rewardPerWorker * maxWorkers)` |
| **No Double-Claim** | `paidWorkers[msg.sender]` mapping checked before payment |
| **No Over-Release** | `require(totalReleased + rewardPerWorker <= totalLocked)` |
| **Creator-Only Refund** | `require(msg.sender == t.creator)` |
| **Pull Payment** | Workers claim themselves - no batch gas cost for backend |
| **Immutable** | No upgradeability, no admin keys, no pause - rules fixed at deploy |

---

## Gas Estimates (Monad Testnet)

| Operation | Gas Used | Est. Cost (MON) |
|-----------|----------|-----------------|
| `lockEscrow` | ~130,000 | ~0.00013 MON |
| `claimPayment` | ~110,000 | ~0.00011 MON |
| `refundRemaining` | ~90,000 | ~0.00009 MON |
| `getTaskEscrow` (view) | Free | Free |

*Monad gas prices ~1 gwei = extremely cheap*

---

## Deployment

```bash
cd meteor-backend/meteor-contracts

# Set environment
export MONAD_RPC_URL=https://testnet-rpc.monad.xyz
export PRIVATE_KEY=your_deployer_key

# Deploy
forge script script/DeployBountyEscrow.s.sol \
  --rpc-url $MONAD_RPC_URL \
  --private-key $PRIVATE_KEY \
  --broadcast

# Output: "BountyEscrow deployed to: 0x..."
```

---

## Backend Integration

### Environment Variable
```env
MONAD_ESCROW_CONTRACT_ADDRESS=0x...
```

### ABI (Minimal)
```json
[
  "function lockEscrow(bytes32,uint256,uint256) payable",
  "function claimPayment(bytes32)",
  "function refundRemaining(bytes32)",
  "function getTaskEscrow(bytes32) view returns (address,uint256,uint256,uint256,uint256,bool)",
  "function getContractBalance() view returns (uint256)",
  "event EscrowLocked(bytes32,address,uint256,uint256)",
  "event WorkerPaid(bytes32,address,uint256)",
  "event EscrowRefunded(bytes32,address,uint256)"
]
```

### Event Indexing (Backend)
```typescript
// Listen for contract events
const filter = escrow.filters.EscrowLocked();
escrow.on(filter, (taskId, creator, reward, maxWorkers, event) => {
  await prisma.task.update({
    where: { id: taskIdToUuid(taskId) },
    data: { escrowStatus: 'LOCKED', escrowTxHash: event.transactionHash }
  });
});
```

---

## Testing

```bash
cd meteor-backend/meteor-contracts
forge test -vv
```

**13 Tests Covering:**
- Lock escrow (correct/incorrect amounts, double-lock prevention)
- Claim payment (success, double-claim, exceeding limit, cancelled task)
- Refund (success, only creator, double-refund)
- Full flow (3 workers claim, contract empties)
- Event emission

---

## Why This Design?

| Decision | Rationale |
|----------|-----------|
| **Single contract for all tasks** | Gas efficient, simple indexing, no factory pattern needed |
| **Pull payment (claimPayment)** | Workers pay own gas, scales to 1000+ workers, no backend batch tx |
| **bytes32 taskId** | Keccak256 of backend UUID - deterministic, no mapping storage |
| **No OpenZeppelin** | ~150 lines, zero deps, custom reentrancy cheaper than OZ |
| **Immutable, no owner** | Trust-minimized - rules can't change after deploy |
| **Native MON only** | No ERC20 complexity, Monad native token |

---

## Future Extensions (Post-MVP)

| Feature | Contract Change |
|---------|-----------------|
| **ERC-4337 Paymaster** | Add `claimPaymentWithPaymaster` for gasless claims |
| **Protocol Fee** | Add `feeBasisPoints` + `feeRecipient` in `lockEscrow` |
| **Dispute Resolution** | Add `raiseDispute` + `resolveDispute` with arbiter |
| **Multi-Token** | Replace `msg.value` with `IERC20.safeTransferFrom` |

---

## Security Considerations

1. **Private Keys**: Backend NEVER holds keys. Users sign all transactions.
2. **Frontend**: Must verify `taskId` matches backend before signing.
3. **Reentrancy**: Protected on all external calls.
4. **Upgradeability**: None - contract is immutable. Audit thoroughly before deploy.
5. **Testing**: 100% branch coverage via Foundry fuzzing.

---

## Contract Address (After Deploy)

| Network | Address | Explorer |
|---------|---------|----------|
| Monad Testnet | `0x...` | https://testnet.monadexplorer.com/address/0x... |

---

## License

MIT License - See [LICENSE](LICENSE) for details.