#!/bin/bash
# Deploy script for BountyEscrow contract
# Usage: ./deploy.sh [network]
# Networks: local, testnet, mainnet
# Loads .env automatically, uses forge script for deployment

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Ensure forge is in PATH
export PATH="$HOME/.foundry/bin:$PATH"

# Default network
NETWORK=${1:-testnet}

# Load environment variables from .env
if [ -f .env ]; then
    echo -e "${YELLOW}Loading .env...${NC}"
    export $(cat .env | grep -v '^#' | xargs)
else
    echo -e "${RED}Error: .env file not found. Copy .env.example to .env and fill in values.${NC}"
    exit 1
fi

# Validate required variables
if [ -z "$PRIVATE_KEY" ]; then
    echo -e "${RED}Error: PRIVATE_KEY not set in .env${NC}"
    exit 1
fi

# Set RPC URL based on network
case $NETWORK in
    local)
        RPC_URL=${LOCAL_RPC_URL:-http://localhost:8545}
        echo -e "${YELLOW}Deploying to LOCAL (Anvil) at $RPC_URL${NC}"
        ;;
    testnet)
        RPC_URL=${MONAD_RPC_URL:-https://testnet-rpc.monad.xyz}
        echo -e "${YELLOW}Deploying to MONAD TESTNET at $RPC_URL${NC}"
        ;;
    mainnet)
        RPC_URL=${MONAD_MAINNET_RPC_URL:-https://rpc.monad.xyz}
        echo -e "${RED}Deploying to MONAD MAINNET at $RPC_URL${NC}"
        echo -e "${RED}WARNING: This uses real funds! Press Ctrl+C to cancel (5s)${NC}"
        sleep 5
        ;;
    *)
        echo -e "${RED}Unknown network: $NETWORK. Use: local, testnet, or mainnet${NC}"
        exit 1
        ;;
esac

# Run deployment using forge script
echo -e "${YELLOW}Running deployment script...${NC}"

# Capture output and extract deployment info
OUTPUT=$(forge script script/DeployBountyEscrow.s.sol \
    --rpc-url "$RPC_URL" \
    --private-key "$PRIVATE_KEY" \
    --broadcast -vv 2>&1)

echo "$OUTPUT"

# Save full output for debugging
echo "$OUTPUT" > deploy-output.log
echo -e "${GREEN}Full output saved to deploy-output.log${NC}"

# Extract deployment info from console logs
# Looking for the === DEPLOYMENT_INFO_START === ... === DEPLOYMENT_INFO_END === block
DEPLOYMENT_INFO=$(echo "$OUTPUT" | sed -n '/=== DEPLOYMENT_INFO_START ===/,/=== DEPLOYMENT_INFO_END ===/p' | sed '1d;$d')

if [ -z "$DEPLOYMENT_INFO" ]; then
    echo -e "${RED}Warning: Could not extract deployment info from output${NC}"
    # Try to extract contract address from return value
    CONTRACT_ADDRESS=$(echo "$OUTPUT" | grep -oE '0x[a-fA-F0-9]{40}' | head -1)
    if [ ! -z "$CONTRACT_ADDRESS" ]; then
        echo -e "${GREEN}Contract deployed at: $CONTRACT_ADDRESS${NC}"
        # Create minimal deployment record
        cat > deployment.json <<EOF
{
  "contractName": "BountyEscrow",
  "address": "$CONTRACT_ADDRESS",
  "chainId": $(cast chain-id --rpc-url "$RPC_URL" 2>/dev/null || echo "31337"),
  "network": "$NETWORK",
  "timestamp": $(date +%s),
  "source": "src/BountyEscrow.sol"
}
EOF
        echo -e "${GREEN}Created deployment.json${NC}"
    fi
else
    # Parse the deployment info and create JSON using awk for robustness
    echo -e "${GREEN}Deployment successful!${NC}"
    
    # Parse key:value pairs and build JSON
    echo "$DEPLOYMENT_INFO" | awk -F': ' '
    BEGIN { print "{" }
    {
        gsub(/"/, "\\\"", $2)
        printf "  \"%s\": \"%s\",\n", $1, $2
    }
    END { print "}" }
    ' | sed '$s/,$//' > deployment.json
    
    echo -e "${GREEN}Saved deployment.json${NC}"
fi

# Show deployment summary
if [ -f deployment.json ]; then
    echo -e "${GREEN}=== Deployment Summary ===${NC}"
    cat deployment.json | jq . 2>/dev/null || cat deployment.json
fi

echo -e "${GREEN}Deployment complete!${NC}"