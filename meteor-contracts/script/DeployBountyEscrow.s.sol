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
        
        // Get deployer address from env or derive from private key
        address deployer = vm.envAddress("DEPLOYER_ADDRESS");
        if (deployer == address(0)) {
            // Use a deterministic address for the private key
            deployer = vm.addr(uint256(keccak256("deployer")));
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
        
        // Save deployment info
        string memory network = block.chainid == 10143 ? "monad-testnet" : 
                               block.chainid == 31337 ? "local" : "unknown";
        
        string memory json = string(
            abi.encodePacked(
                '{"contractName":"BountyEscrow","address":"',
                vm.toString(contractAddress),
                '","chainId":',
                vm.toString(block.chainid),
                ',"network":"',
                network,
                '","deployer":"',
                vm.toString(deployer),
                '","timestamp":',
                vm.toString(block.timestamp),
                '","blockNumber":',
                vm.toString(block.number),
                '","source":"src/BountyEscrow.sol"}'
            )
        );
        
        vm.writeFile("deployment.json", json);
        console.log("Deployment saved to deployment.json");
        
        return contractAddress;
    }
}