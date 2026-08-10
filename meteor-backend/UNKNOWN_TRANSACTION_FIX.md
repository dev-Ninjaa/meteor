# Fixing "Unknown Transaction" in Wallets

## Problem
When users interact with the BountyEscrow contract via OKX Wallet / MetaMask / RainbowKit, the transaction shows as **"Unknown transaction"** instead of a human-readable function name like `lockEscrow` or `claimPayment`.

![Unknown Transaction](clip_20260803_094910_5.png)

---

## Root Cause
Wallets decode the **function selector** (first 4 bytes of calldata) against known ABIs. If the wallet doesn't have the contract's ABI, it cannot decode the function signature and displays "Unknown transaction".

| Component | Status |
|-----------|--------|
| Contract deployed | ✅ `0xD06122a48bcAfe76E4eAA8CE8922b20a709AA26d` |
| Contract verified on explorer | ✅ **Verified (exact match)** |
| Wallet has ABI | ✅ Auto-fetched from Sourcify |
| Function selector decode | ✅ Works → shows function names |

---

## Solutions (Priority Order)

### 1. Verify Contract on Monad Explorer (DONE)
**This is the permanent fix** - once verified, all wallets auto-fetch ABI.

**Status: ✅ COMPLETED via Foundry/Sourcify on 2026-08-10**

**Finder/UI Steps (alternative path):**
1. Go to [Monad Testnet Explorer](https://testnet.monadexplorer.com/)
2. Search contract: `0xD06122a48bcAfe76E4eAA8CE8922b20a709AA26d`
3. Click **"Verify & Publish"**
4. Provide:
   - Compiler version: `0.8.35+commit.47b9dedd` (actual build, NOT 0.8.24)
   - Optimization: `disabled` (actual build profile)
   - Source code: Exact `BountyEscrow.sol` + all imports
   - Constructor arguments: (empty - no constructor args)
5. Submit verification

**Result:** Wallets (OKX, MetaMask, RainbowKit) fetch ABI automatically → shows `lockEscrow`, `claimPayment`, etc.

---

### Verification Record (2026-08-10)

**Method:** `forge verify-contract` → Sourcify (BlockVision) → exact match

```bash
forge verify-contract \
  --rpc-url https://testnet-rpc.monad.xyz \
  --verifier sourcify \
  --verifier-url 'https://sourcify-api-monad.blockvision.org/' \
  --constructor-args "" \
  0xD06122a48bcAfe76E4eAA8CE8922b20a709AA26d \
  src/BountyEscrow.sol:BountyEscrow
```

> **Trap:** the verifier URL must be `https://sourcify-api-monad.blockvision.org/`
> (trailing slash, NO `/api`). Adding `/api` causes
> `ERROR: Failed to deserialize response: expected value at line 1 column 1`.
> Also ensure no `etherscan_api_key` exists in `foundry.toml`.

| Field | Value |
|-------|-------|
| Verification Job ID | `01d3e576-460e-47ed-b72a-0d0b38338413` |
| Status | ✅ `isJobCompleted: true` |
| Match | `exact_match` (runtime bytecode) |
| Creation match | `null` |
| Runtime match | `exact_match` |
| Chain ID | `10143` (Monad Testnet) |
| Contract address | `0xD06122a48bcAfe76E4eAA8CE8922b20a709AA26d` |
| Verified at | `2026-08-10T06:17:40Z` |
| Job start | `2026-08-10T06:17:39Z` |
| Compilation time | `157` ms |
| Match ID | `799021` |
| Sourcify URL | `https://sourcify-api-monad.blockvision.org/v2/verify/01d3e576-460e-47ed-b72a-0d0b38338413` |

**Actual build metadata used for verification** (`out/BountyEscrow.sol/BountyEscrow.json`):

| Field | Value |
|-------|-------|
| Compiler | `0.8.35+commit.47b9dedd` |
| Optimizer | `enabled: false`, `runs: 200` |
| Constructor | `constructor()` — no inputs, no args |

---

---

### 2. Add Contract to Wallet's Known Contracts (Manual)
Some wallets allow manual ABI registration.

**OKX Wallet:**
- Settings → Networks → Monad Testnet → "Add Custom Contract"
- Paste contract address + ABI JSON

**MetaMask:**
- Settings → Experimental → "Enable Contract Detection"
- Or use "Add Contract" with ABI

**RainbowKit:**
- Configure in `wagmi.config.ts`:
```typescript
const config = getDefaultConfig({
  chains: [monadTestnet],
  contracts: {
    bountyEscrow: {
      address: '0xD06122a48bcAfe76E4eAA8CE8922b20a709AA26d',
      abi: bountyEscrowAbi, // imported from generated
    },
  },
});
```

---

### 3. Use EIP-712 Typed Data (Best UX)
Instead of raw `eth_sendTransaction`, use `eth_signTypedData` for human-readable prompts.

**Example for lockEscrow:**
```typescript
const typedData = {
  types: {
    LockEscrow: [
      { name: 'taskId', type: 'bytes32' },
      { name: 'rewardPerWorker', type: 'uint256' },
      { name: 'maxWorkers', type: 'uint256' },
    ],
  },
  primaryType: 'LockEscrow',
  domain: {
    name: 'BountyEscrow',
    version: '1',
    chainId: 10143,
    verifyingContract: '0xD06122a48bcAfe76E4eAA8CE8922b20a709AA26d',
  },
  message: {
    taskId: '0x1234...',
    rewardPerWorker: '1000000000000000000',
    maxWorkers: 5,
  },
};

const signature = await signTypedData({ typedData });
```

**Wallet shows:**
```
Lock Escrow
Task: 0x1234...
Reward: 1 MON/worker
Workers: 5
Total: 5 MON
[Confirm] [Cancel]
```

---

## Verification Checklist

After applying fix, test these scenarios:

| Action | Expected Wallet Display |
|--------|------------------------|
| Creator locks escrow | `lockEscrow(taskId, 1 MON, 5 workers)` + value: 5 MON |
| Worker claims payment | `claimPayment(taskId)` |
| Creator releases escrow | `releaseEscrow(taskId, submissionId)` |
| Creator refunds | `refundRemaining(taskId)` |

---

## Quick Test
```bash
# ✅ Contract already verified (exact match) — see Verification Record above
# 1. Clear wallet cache / reconnect (or restart browser)
# 2. Try locking escrow again
# 3. Should show function name instead of "Unknown transaction"
```

---

## Files Reference
| File | Purpose |
|------|---------|
| `meteor-contracts/src/BountyEscrow.sol` | Contract source |
| `meteor-frontend/src/lib/generated.ts` | wagmi generated hooks + ABI |
| `meteor-frontend/src/components/marketplace/EscrowLockModal.tsx` | lockEscrow call |
| `meteor-frontend/src/components/marketplace/InteractiveSolverModal.tsx` | claimPayment call |

---

## Notes
- **Contract verification is one-time** - survives redeploys if address stays same
- **EIP-712 requires backend support** - more work but best UX
- **RainbowKit + wagmi** already has type-safe hooks once ABI is known
- **Monad Testnet Explorer** verification is free and permanent