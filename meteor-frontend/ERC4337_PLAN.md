# ERC-4337 (Account Abstraction) Integration Plan

## Overview
ERC-4337 enables **Account Abstraction** - smart contract wallets with programmable logic, enabling:
- Gas sponsorship (paymasters)
- Batched transactions
- Social recovery
- Custom signature schemes

## Why for Meteor?

| Current Pain Point | ERC-4337 Solution |
|--------------------|-------------------|
| User pays gas for `claimPayment` | Paymaster sponsors gas |
| Multiple txs for join+submit+claim | Batch into single UserOperation |
| Private key management | Smart contract wallet (social recovery) |
| Gas in MON only | Paymaster accepts ERC-20 / fiat |

---

## Phase 1: Gas Sponsorship for claimPayment (MVP)

### Goal
Backend sponsors gas for `claimPayment` so workers don't need MON.

### Architecture

```
┌─────────────┐     UserOperation      ┌─────────────┐
│  Frontend   │ ─────────────────────► │  Bundler    │
│  (wagmi)    │                        │  (EntryPoint)│
└─────────────┘                        └──────┬──────┘
                                              │
                                              ▼
                                    ┌─────────────────┐
                                    │   Paymaster     │
                                    │  (Backend)      │
                                    └─────────────────┘
```

### Implementation Steps

#### 1. Deploy EntryPoint + Paymaster Contracts
```bash
# Use established implementation (e.g., Stackup, Alchemy, Pimlico)
# Or deploy custom: contracts/account-abstraction/
```

#### 2. Backend Paymaster Service
```typescript
// backend/src/paymaster/paymaster.service.ts
@Injectable()
export class PaymasterService {
  async signUserOperation(userOp: UserOperation): Promise<string> {
    // Validate: userOp calls claimPayment on our BountyEscrow
    // Verify: task exists, worker is valid, verification passed
    // Sign with paymaster private key
    return paymaster.sign(userOp);
  }

  async validateAndPay(userOp: UserOperation): Promise<PaymasterResult> {
    // Check: userOp.target == BOUNTY_ESCROW
    // Check: userOp.callData == claimPayment(taskId)
    // Check: task is verified, worker eligible
    return { success: true, context: '' };
  }
}
```

#### 3. Frontend Integration (wagmi + viem)
```typescript
// frontend/src/hooks/useClaimPaymentAA.ts
import { useSmartAccountClient } from '@account-kit/react';
import { encodeFunctionData } from 'viem';

export function useClaimPaymentAA() {
  const { sendUserOperation } = useSmartAccountClient();

  const claim = async (taskId: `0x${string}`) => {
    const callData = encodeFunctionData({
      abi: BOUNTY_ESCROW_ABI,
      functionName: 'claimPayment',
      args: [taskId],
    });

    const userOp = await sendUserOperation({
      target: CONTRACTS.BOUNTY_ESCROW,
      data: callData,
      paymaster: PAYMASTER_ADDRESS, // Backend paymaster
    });
    
    return userOp;
  };

  return { claim };
}
```

#### 4. Required Contracts
| Contract | Source |
|----------|--------|
| EntryPoint v0.7 | `ethereum/entrypoint` |
| SimpleAccount (wallet) | `ethereum/aa-smart-contract-wallet` |
| VerifyingPaymaster | Custom or `alchemy/aa-sdk` |

---

## Phase 2: Batched Operations (v2)

### Goal
Combine multiple actions into single UserOperation:
- Join task + Submit work + Claim (if auto-verify)
- Multi-task claim for power workers

```typescript
// Batched UserOperation
const userOp = await smartAccount.sendUserOperation({
  calls: [
    { target: BOUNTY_ESCROW, data: encodeJoinTask(taskId) },
    { target: BOUNTY_ESCROW, data: encodeSubmitWork(taskId, proof) },
    // If auto-verify enabled:
    { target: BOUNTY_ESCROW, data: encodeClaimPayment(taskId) },
  ],
  paymaster: PAYMASTER_ADDRESS,
});
```

---

## Phase 3: Smart Contract Wallets (v3)

### Features
- Social recovery (guardians)
- Session keys (auto-claim for verified tasks)
- Spending limits per session
- Multi-sig for high-value tasks

---

## Implementation Priority

| Phase | Timeline | Effort | Value |
|-------|----------|--------|-------|
| **1. Gas Sponsorship** | 2-3 weeks | Medium | High - removes MON requirement |
| **2. Batched Ops** | 2-3 weeks | Medium | Medium - better UX |
| **3. Smart Wallets** | 4-6 weeks | High | High - retention, recovery |

---

## Technical Requirements

### Backend
- [ ] Deploy Paymaster contract
- [ ] Fund Paymaster with MON
- [ ] API: `POST /paymaster/sign` (validates + signs UserOperation)
- [ ] Monitor Paymaster balance (alert < 10 MON)
- [ ] Rate limiting per user/IP

### Frontend
- [ ] Integrate `@account-kit/react` or `permissionless.js`
- [ ] Replace `useClaimPayment` with AA version
- [ ] Fallback to regular claim if AA fails
- [ ] Show "Gas sponsored" indicator

### Contracts
- [ ] Deploy EntryPoint v0.7
- [ ] Deploy SimpleAccount factory
- [ ] Deploy VerifyingPaymaster
- [ ] Verify on Monad explorer

---

## Cost Estimation

| Item | Cost (Testnet) | Cost (Mainnet est.) |
|------|----------------|---------------------|
| Paymaster deployment | ~0.01 MON | ~$50 |
| Paymaster funding (10k claims) | ~0.5 MON | ~$200 |
| Bundler fees (per UserOp) | ~0.0001 MON | ~$0.01 |
| **Total for 10k users** | **~1 MON** | **~$300** |

---

## Decision Points

1. **Build vs Buy**: Use Pimlico/Alchemy/Stackup paymaster vs deploy custom?
   - **Recommendation**: Start with Pimlico/Alchemy (managed), migrate to custom later

2. **Paymaster Validation**: On-chain vs off-chain?
   - On-chain: More secure, higher gas
   - Off-chain (signature): Cheaper, trust paymaster

3. **Wallet Provider**: Dynamic, Privy, Web3Auth, or custom?
   - **Recommendation**: Dynamic or Privy for social login + AA

---

## Next Steps (Immediate)

1. **Week 1**: Set up Pimlico testnet paymaster, integrate with frontend
2. **Week 2**: Test gas sponsorship for claimPayment
3. **Week 3**: Add batched operations for join+submit
4. **Week 4**: Deploy to testnet, gather metrics

---

## References
- [ERC-4337 Spec](https://eips.ethereum.org/EIPS/eip-4337)
- [EntryPoint v0.7](https://github.com/eth-infinitism/entrypoint)
- [Pimlico Docs](https://docs.pimlico.io)
- [Alchemy AA](https://www.alchemy.com/account-abstraction)
- [Stackup](https://stackup.sh)
- [viem Account Abstraction](https://viem.sh/docs/contracts/erc4337)