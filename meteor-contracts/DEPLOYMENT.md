# BountyEscrow Contract Deployment Guide

## Overview

This guide covers deploying the `BountyEscrow` smart contract to various networks.

## Prerequisites

- [Foundry](https://book.getfoundry.sh/getting-started/installation) installed
- Access to an RPC endpoint for target network
- Private key with sufficient native tokens for gas

## Networks

| Network | Chain ID | RPC URL | Explorer |
|---------|----------|---------|----------|
| Local (Anvil) | 31337 | http://localhost:8545 | N/A |
| Monad Testnet | 10143 | https://testnet-rpc.monad.xyz | https://testnet.monadexplorer.com |
| Monad Mainnet | 10143 | https://rpc.monad.xyz | https://monadexplorer.com |

## Quick Start (Local)

### 1. Start Anvil
```bash
# Terminal 1
cd meteor-contracts
anvil --port 8545
```

### 2. Deploy
```bash
# Terminal 2
cd meteor-contracts
forge script script/DeployBountyEscrow.s.sol \
  --rpc-url http://localhost:8545 \
  --private-key 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80 \
  --broadcast -vv
```

**Expected Output:**
```
BountyEscrow deployed to: 0x5FbDB2315678afecb367f032d93F642f64180aa3
```

### 3. Run Tests
```bash
forge test --rpc-url http://localhost:8545 -vv
```

## Monad Testnet Deployment

### 1. Environment Setup
```bash
cd meteor-contracts
cp .env.example .env
# Edit .env with your values:
# PRIVATE_KEY=your_private_key
# MONAD_RPC_URL=https://testnet-rpc.monad.xyz
# DEPLOYER_ADDRESS=your_address
```

### 2. Fund Deployer
Get testnet MON from [Monad Faucet](https://faucet.monad.xyz) for your deployer address.

### 3. Deploy
```bash
forge script script/DeployBountyEscrow.s.sol \
  --rpc-url https://testnet-rpc.monad.xyz \
  --private-key $PRIVATE_KEY \
  --broadcast -vv
```

### 3. Verify on Explorer
```bash
forge verify-contract \
  --chain-id 10143 \
  --etherscan-api-key $MONAD_EXPLORER_API_KEY \
  <CONTRACT_ADDRESS> \
  src/BountyEscrow.sol:BountyEscrow
```

## Monad Mainnet Deployment

Same as testnet but:
- Use mainnet RPC: `https://rpc.monad.xyz`
- Use real MON (not testnet)
- Higher gas costs expected

## Post-Deployment

### 1. Update Frontend Config
Add contract address to frontend environment:
```bash
# meteor-frontend/.env
VITE_ESCROW_CONTRACT_ADDRESS=0x...
```

### 2. Update Backend Config
```bash
# meteor-backend/.env
MONAD_ESCROW_CONTRACT_ADDRESS=0x...
```

### 3. Verify Deployment
```bash
# Check contract state
cast call <ADDRESS> "getContractBalance()" --rpc-url <RPC_URL>

# Check deployment transaction
cast tx <TX_HASH> --rpc-url <RPC_URL>
```

## Contract Verification

### Source Verification (Monad Explorer)
```bash
forge verify-contract \
  --chain-id 10143 \
  --etherscan-api-key $API_KEY \
  <CONTRACT_ADDRESS> \
  src/BountyEscrow.sol:BountyEscrow \
  --watch
```

### Manual Verification Checklist
- [ ] Contract deployed at expected address
- [ ] `getContractBalance()` returns 0 initially
- [ ] `lockEscrow` works with correct value
- [ ] `claimPayment` transfers to worker
- [ ] `refundRemaining` returns funds to creator
- [ ] Events emitted: `EscrowLocked`, `WorkerPaid`, `EscrowRefunded`

## Environment Variables

### `.env.example`
```bash
# Required
PRIVATE_KEY=0x...
MONAD_RPC_URL=https://testnet-rpc.monad.xyz

# Optional
DEPLOYER_ADDRESS=0x...
MONAD_EXPLORER_API_KEY=your_api_key
```

## Troubleshooting

| Issue | Solution |
|-------|----------|
| "Insufficient funds" | Fund deployer with native tokens |
| "Revert: Exact amount required" | Send `rewardPerWorker * maxWorkers` with `lockEscrow` |
| "Task already locked" | Use unique `taskId` (keccak256 of task UUID) |
| "Not eligible or already claimed" | Worker can only claim once per task |
| WriteFile errors in script | Remove `vm.writeFile` calls, use broadcast output |

## Contract Addresses

| Network | Address | Deployed At | Deployer |
|---------|---------|-------------|----------|
| Local (Anvil) | 0x5FbDB2315678afecb367f032d93F642f64180aa3 | 2024-07-31 | 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266 |
| Monad Testnet | *pending* | | |
| Monad Mainnet | *pending* | | |

## Useful Commands

```bash
# Check contract bytecode
cast code <ADDRESS> --rpc-url <RPC_URL>

# Simulate call
cast call <ADDRESS> "getTaskEscrow(bytes32)" <TASK_ID> --rpc-url <RPC_URL>

# Estimate gas
cast estimate <ADDRESS> "lockEscrow(bytes32,uint256,uint256)" <TASK_ID> <REWARD> <MAX_WORKERS> --value <TOTAL> --rpc-url <RPC_URL>

# View events
cast logs --from-block 0 --address <ADDRESS> --rpc-url <RPC_URL>

# Get deployment transaction details
cat broadcast/DeployBountyEscrow.s.sol/31337/run-latest.json
```