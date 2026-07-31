// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title BountyEscrow
 * @dev Non-custodial escrow for swarm bounty marketplace.
 * Creators deposit funds, workers claim payments after verification.
 * Backend only indexes events - never holds private keys.
 */

struct TaskEscrow {
    address creator;
    uint256 rewardPerWorker;
    uint256 maxWorkers;
    uint256 totalLocked;
    uint256 totalReleased;
    bool cancelled;
    mapping(address => bool) paidWorkers;
}

interface IBountyEscrow {
    event EscrowLocked(bytes32 indexed taskId, address indexed creator, uint256 rewardPerWorker, uint256 maxWorkers);
    event WorkerPaid(bytes32 indexed taskId, address indexed worker, uint256 amount);
    event EscrowRefunded(bytes32 indexed taskId, address indexed creator, uint256 amount);

    function lockEscrow(bytes32 taskId, uint256 rewardPerWorker, uint256 maxWorkers) external payable;
    function claimPayment(bytes32 taskId) external;
    function refundRemaining(bytes32 taskId) external;
    function getTaskEscrow(bytes32 taskId) external view returns (
        address creator,
        uint256 rewardPerWorker,
        uint256 maxWorkers,
        uint256 totalLocked,
        uint256 totalReleased,
        bool cancelled
    );
}

contract BountyEscrow is IBountyEscrow {
    enum Status { Unlocked, Locked, Completed, Refunded }

    mapping(bytes32 => TaskEscrow) public tasks;

    // Reentrancy guard
    uint256 private constant NOT_ENTERED = 1;
    uint256 private constant ENTERED = 2;
    uint256 private _status;

    constructor() {
        _status = NOT_ENTERED;
    }

    modifier nonReentrant() {
        require(_status != ENTERED, "ReentrancyGuard: reentrant call");
        _status = ENTERED;
        _;
        _status = NOT_ENTERED;
    }

    /**
     * @dev Creator locks escrow for a task.
     * @param taskId Unique task identifier (keccak256 of task ID string)
     * @param rewardPerWorker Amount each worker receives
     * @param maxWorkers Maximum number of workers for this task
     */
    function lockEscrow(bytes32 taskId, uint256 rewardPerWorker, uint256 maxWorkers)
        external
        payable
        nonReentrant
    {
        require(msg.value == rewardPerWorker * maxWorkers, "Exact amount required");
        require(tasks[taskId].totalLocked == 0, "Task already locked");
        require(rewardPerWorker > 0, "Reward must be > 0");
        require(maxWorkers > 0, "Max workers must be > 0");

        TaskEscrow storage t = tasks[taskId];
        t.creator = msg.sender;
        t.rewardPerWorker = rewardPerWorker;
        t.maxWorkers = maxWorkers;
        t.totalLocked = msg.value;
        t.totalReleased = 0;
        t.cancelled = false;
        // paidWorkers mapping is automatically initialized to empty

        emit EscrowLocked(taskId, msg.sender, rewardPerWorker, maxWorkers);
    }

    /**
     * @dev Worker claims their payment after verification.
     * Called by worker themselves (pull payment pattern).
     * @param taskId Task identifier
     */
    function claimPayment(bytes32 taskId) external nonReentrant {
        TaskEscrow storage t = tasks[taskId];
        require(t.totalLocked > 0, "Task not found");
        require(!t.cancelled, "Task cancelled");
        require(!t.paidWorkers[msg.sender], "Not eligible or already claimed");
        require(t.totalReleased + t.rewardPerWorker <= t.totalLocked, "Exceeds locked amount");

        t.paidWorkers[msg.sender] = true;
        t.totalReleased += t.rewardPerWorker;

        (bool sent, ) = payable(msg.sender).call{value: t.rewardPerWorker}("");
        require(sent, "Transfer failed");

        emit WorkerPaid(taskId, msg.sender, t.rewardPerWorker);
    }

    /**
     * @dev Creator refunds remaining unclaimed funds.
     * @param taskId Task identifier
     */
    function refundRemaining(bytes32 taskId) external nonReentrant {
        TaskEscrow storage t = tasks[taskId];
        require(t.totalLocked > 0, "Task not found");
        require(msg.sender == t.creator, "Only creator can refund");
        require(!t.cancelled, "Already refunded");

        t.cancelled = true;
        uint256 refund = t.totalLocked - t.totalReleased;
        t.totalReleased = t.totalLocked;

        if (refund > 0) {
            (bool sent, ) = payable(t.creator).call{value: refund}("");
            require(sent, "Refund failed");
        }

        emit EscrowRefunded(taskId, t.creator, refund);
    }

    /**
     * @dev Get task escrow state.
     * @param taskId Task identifier
     * @return creator Task creator address
     * @return rewardPerWorker Amount each worker receives
     * @return maxWorkers Maximum number of workers
     * @return totalLocked Total amount locked in escrow
     * @return totalReleased Total amount released to workers
     * @return cancelled Whether task is cancelled/refunded
     */
    function getTaskEscrow(bytes32 taskId) external view returns (
        address creator,
        uint256 rewardPerWorker,
        uint256 maxWorkers,
        uint256 totalLocked,
        uint256 totalReleased,
        bool cancelled
    ) {
        TaskEscrow storage t = tasks[taskId];
        return (t.creator, t.rewardPerWorker, t.maxWorkers, t.totalLocked, t.totalReleased, t.cancelled);
    }

    /**
     * @dev Get contract ETH balance
     */
    function getContractBalance() external view returns (uint256) {
        return address(this).balance;
    }
}