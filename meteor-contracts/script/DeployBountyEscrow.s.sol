// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Script.sol";
import "../src/BountyEscrow.sol";

contract DeployBountyEscrow is Script {
    function run() external returns (address) {
        // Read configuration from environment variables
        string memory rpcUrl = vm.envString("MONAD_RPC_URL");
        if (bytes(rpcUrl).length == 0) {
            rpcUrl = "http://localhost:8545";
        }
        
        string memory privateKey = vm.envString("PRIVATE_KEY");
        if (bytes(privateKey).length == 0) {
            console.log("ERROR: PRIVATE_KEY not set in .env");
            revert("PRIVATE_KEY required");
        }
        
        // Get deployer address from env or use anvil default
        address deployer;
        string memory deployerEnv = vm.envString("DEPLOYER_ADDRESS");
        if (bytes(deployerEnv).length > 0) {
            deployer = vm.envAddress("DEPLOYER_ADDRESS");
        } else {
            // Use the anvil default account (first test account)
            deployer = 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266;
        }
        
        console.log("Deploying BountyEscrow...");
        console.log("RPC URL:", rpcUrl);
        console.log("Deployer:", deployer);
        console.log("Chain ID:", block.chainid);
        
        // Deploy contract
        vm.startBroadcast();
        BountyEscrow escrow = new BountyEscrow();
        vm.stopBroadcast();
        
        address contractAddress = address(escrow);
        console.log("BountyEscrow deployed to:", contractAddress);
        
        // Output deployment info for shell capture
        console.log("=== DEPLOYMENT_INFO_START ===");
        console.log("contractName:BountyEscrow");
        console.log("address:", contractAddress);
        console.log("chainId:", block.chainid);
        console.log("network:", block.chainid == 10143 ? "monad-testnet" : block.chainid == 31337 ? "local" : "unknown");
        console.log("deployer:", deployer);
        console.log("timestamp:", block.timestamp);
        console.log("blockNumber:", block.number);
        console.log("source:src/BountyEscrow.sol");
        console.log("=== DEPLOYMENT_INFO_END ===");
        
        return contractAddress;
    }
}