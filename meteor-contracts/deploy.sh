#!/bin/bash
# Deploy script - loads .env automatically
# Usage: ./deploy.sh [network]

set -e

# Load environment variables from .env
if [ -f .env ]; then
    export $(cat .env | grep -v '^#' | xargs)
else
    echo "Error: .env file not found. Copy .env.example to .env and fill in values."
    exit 1
fi

# Check required variables
if [ -z "$PRIVATE_KEY" ]; then
    echo "Error: PRIVATE_KEY not set in .env"
    exit 1
fi

NETWORK=${1:-monad-testnet}

case $NETWORK in
    monad-testnet)
        RPC_URL=${MONAD_RPC_URL:-https://testnet-rpc.monad.xyz}
        ;;
    monad-mainnet)
        RPC_URL=${MONAD_MAINNET_RPC_URL:-https://rpc.monad.xyz}
        ;;
    local)
        RPC_URL=${LOCAL_RPC_URL:-http://localhost:8545}
        ;;
    *)
        echo "Unknown network: $NETWORK"
        echo "Usage: ./deploy.sh [monad-testnet|monad-mainnet|local]"
        exit 1
        ;;
esac

echo "Deploying to $NETWORK ($RPC_URL)..."

forge script script/DeployBountyEscrow.s.sol \
    --rpc-url "$RPC_URL" \
    --private-key "$PRIVATE_KEY" \
    --broadcast \
    -vv

echo "Deployment complete! Check deployment.json for details."