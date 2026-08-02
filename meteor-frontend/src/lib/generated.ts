import {
  createUseReadContract,
  createUseWriteContract,
  createUseSimulateContract,
  createUseWatchContractEvent,
} from 'wagmi/codegen'

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// BountyEscrow
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * [__View Contract on Monad Testnet Monad Testnet Explorer__](https://testnet.monadexplorer.com/address/0xD06122a48bcAfe76E4eAA8CE8922b20a709AA26d)
 */
export const bountyEscrowAbi = [
  { type: 'constructor', inputs: [], stateMutability: 'nonpayable' },
  {
    type: 'function',
    inputs: [{ name: 'taskId', internalType: 'bytes32', type: 'bytes32' }],
    name: 'claimPayment',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'getContractBalance',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'taskId', internalType: 'bytes32', type: 'bytes32' }],
    name: 'getTaskEscrow',
    outputs: [
      { name: 'creator', internalType: 'address', type: 'address' },
      { name: 'rewardPerWorker', internalType: 'uint256', type: 'uint256' },
      { name: 'maxWorkers', internalType: 'uint256', type: 'uint256' },
      { name: 'totalLocked', internalType: 'uint256', type: 'uint256' },
      { name: 'totalReleased', internalType: 'uint256', type: 'uint256' },
      { name: 'cancelled', internalType: 'bool', type: 'bool' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'taskId', internalType: 'bytes32', type: 'bytes32' },
      { name: 'rewardPerWorker', internalType: 'uint256', type: 'uint256' },
      { name: 'maxWorkers', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'lockEscrow',
    outputs: [],
    stateMutability: 'payable',
  },
  {
    type: 'function',
    inputs: [{ name: 'taskId', internalType: 'bytes32', type: 'bytes32' }],
    name: 'refundRemaining',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: '', internalType: 'bytes32', type: 'bytes32' }],
    name: 'tasks',
    outputs: [
      { name: 'creator', internalType: 'address', type: 'address' },
      { name: 'rewardPerWorker', internalType: 'uint256', type: 'uint256' },
      { name: 'maxWorkers', internalType: 'uint256', type: 'uint256' },
      { name: 'totalLocked', internalType: 'uint256', type: 'uint256' },
      { name: 'totalReleased', internalType: 'uint256', type: 'uint256' },
      { name: 'cancelled', internalType: 'bool', type: 'bool' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'taskId',
        internalType: 'bytes32',
        type: 'bytes32',
        indexed: true,
      },
      {
        name: 'creator',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'rewardPerWorker',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
      {
        name: 'maxWorkers',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'EscrowLocked',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'taskId',
        internalType: 'bytes32',
        type: 'bytes32',
        indexed: true,
      },
      {
        name: 'creator',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'amount',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'EscrowRefunded',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'taskId',
        internalType: 'bytes32',
        type: 'bytes32',
        indexed: true,
      },
      {
        name: 'worker',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'amount',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'WorkerPaid',
  },
] as const

/**
 * [__View Contract on Monad Testnet Monad Testnet Explorer__](https://testnet.monadexplorer.com/address/0xD06122a48bcAfe76E4eAA8CE8922b20a709AA26d)
 */
export const bountyEscrowAddress = {
  10143: '0xD06122a48bcAfe76E4eAA8CE8922b20a709AA26d',
} as const

/**
 * [__View Contract on Monad Testnet Monad Testnet Explorer__](https://testnet.monadexplorer.com/address/0xD06122a48bcAfe76E4eAA8CE8922b20a709AA26d)
 */
export const bountyEscrowConfig = {
  address: bountyEscrowAddress,
  abi: bountyEscrowAbi,
} as const

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// React
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link bountyEscrowAbi}__
 *
 * [__View Contract on Monad Testnet Monad Testnet Explorer__](https://testnet.monadexplorer.com/address/0xD06122a48bcAfe76E4eAA8CE8922b20a709AA26d)
 */
export const useReadBountyEscrow = /*#__PURE__*/ createUseReadContract({
  abi: bountyEscrowAbi,
  address: bountyEscrowAddress,
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link bountyEscrowAbi}__ and `functionName` set to `"getContractBalance"`
 *
 * [__View Contract on Monad Testnet Monad Testnet Explorer__](https://testnet.monadexplorer.com/address/0xD06122a48bcAfe76E4eAA8CE8922b20a709AA26d)
 */
export const useReadBountyEscrowGetContractBalance =
  /*#__PURE__*/ createUseReadContract({
    abi: bountyEscrowAbi,
    address: bountyEscrowAddress,
    functionName: 'getContractBalance',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link bountyEscrowAbi}__ and `functionName` set to `"getTaskEscrow"`
 *
 * [__View Contract on Monad Testnet Monad Testnet Explorer__](https://testnet.monadexplorer.com/address/0xD06122a48bcAfe76E4eAA8CE8922b20a709AA26d)
 */
export const useReadBountyEscrowGetTaskEscrow =
  /*#__PURE__*/ createUseReadContract({
    abi: bountyEscrowAbi,
    address: bountyEscrowAddress,
    functionName: 'getTaskEscrow',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link bountyEscrowAbi}__ and `functionName` set to `"tasks"`
 *
 * [__View Contract on Monad Testnet Monad Testnet Explorer__](https://testnet.monadexplorer.com/address/0xD06122a48bcAfe76E4eAA8CE8922b20a709AA26d)
 */
export const useReadBountyEscrowTasks = /*#__PURE__*/ createUseReadContract({
  abi: bountyEscrowAbi,
  address: bountyEscrowAddress,
  functionName: 'tasks',
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link bountyEscrowAbi}__
 *
 * [__View Contract on Monad Testnet Monad Testnet Explorer__](https://testnet.monadexplorer.com/address/0xD06122a48bcAfe76E4eAA8CE8922b20a709AA26d)
 */
export const useWriteBountyEscrow = /*#__PURE__*/ createUseWriteContract({
  abi: bountyEscrowAbi,
  address: bountyEscrowAddress,
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link bountyEscrowAbi}__ and `functionName` set to `"claimPayment"`
 *
 * [__View Contract on Monad Testnet Monad Testnet Explorer__](https://testnet.monadexplorer.com/address/0xD06122a48bcAfe76E4eAA8CE8922b20a709AA26d)
 */
export const useWriteBountyEscrowClaimPayment =
  /*#__PURE__*/ createUseWriteContract({
    abi: bountyEscrowAbi,
    address: bountyEscrowAddress,
    functionName: 'claimPayment',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link bountyEscrowAbi}__ and `functionName` set to `"lockEscrow"`
 *
 * [__View Contract on Monad Testnet Monad Testnet Explorer__](https://testnet.monadexplorer.com/address/0xD06122a48bcAfe76E4eAA8CE8922b20a709AA26d)
 */
export const useWriteBountyEscrowLockEscrow =
  /*#__PURE__*/ createUseWriteContract({
    abi: bountyEscrowAbi,
    address: bountyEscrowAddress,
    functionName: 'lockEscrow',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link bountyEscrowAbi}__ and `functionName` set to `"refundRemaining"`
 *
 * [__View Contract on Monad Testnet Monad Testnet Explorer__](https://testnet.monadexplorer.com/address/0xD06122a48bcAfe76E4eAA8CE8922b20a709AA26d)
 */
export const useWriteBountyEscrowRefundRemaining =
  /*#__PURE__*/ createUseWriteContract({
    abi: bountyEscrowAbi,
    address: bountyEscrowAddress,
    functionName: 'refundRemaining',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link bountyEscrowAbi}__
 *
 * [__View Contract on Monad Testnet Monad Testnet Explorer__](https://testnet.monadexplorer.com/address/0xD06122a48bcAfe76E4eAA8CE8922b20a709AA26d)
 */
export const useSimulateBountyEscrow = /*#__PURE__*/ createUseSimulateContract({
  abi: bountyEscrowAbi,
  address: bountyEscrowAddress,
})

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link bountyEscrowAbi}__ and `functionName` set to `"claimPayment"`
 *
 * [__View Contract on Monad Testnet Monad Testnet Explorer__](https://testnet.monadexplorer.com/address/0xD06122a48bcAfe76E4eAA8CE8922b20a709AA26d)
 */
export const useSimulateBountyEscrowClaimPayment =
  /*#__PURE__*/ createUseSimulateContract({
    abi: bountyEscrowAbi,
    address: bountyEscrowAddress,
    functionName: 'claimPayment',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link bountyEscrowAbi}__ and `functionName` set to `"lockEscrow"`
 *
 * [__View Contract on Monad Testnet Monad Testnet Explorer__](https://testnet.monadexplorer.com/address/0xD06122a48bcAfe76E4eAA8CE8922b20a709AA26d)
 */
export const useSimulateBountyEscrowLockEscrow =
  /*#__PURE__*/ createUseSimulateContract({
    abi: bountyEscrowAbi,
    address: bountyEscrowAddress,
    functionName: 'lockEscrow',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link bountyEscrowAbi}__ and `functionName` set to `"refundRemaining"`
 *
 * [__View Contract on Monad Testnet Monad Testnet Explorer__](https://testnet.monadexplorer.com/address/0xD06122a48bcAfe76E4eAA8CE8922b20a709AA26d)
 */
export const useSimulateBountyEscrowRefundRemaining =
  /*#__PURE__*/ createUseSimulateContract({
    abi: bountyEscrowAbi,
    address: bountyEscrowAddress,
    functionName: 'refundRemaining',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link bountyEscrowAbi}__
 *
 * [__View Contract on Monad Testnet Monad Testnet Explorer__](https://testnet.monadexplorer.com/address/0xD06122a48bcAfe76E4eAA8CE8922b20a709AA26d)
 */
export const useWatchBountyEscrowEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: bountyEscrowAbi,
    address: bountyEscrowAddress,
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link bountyEscrowAbi}__ and `eventName` set to `"EscrowLocked"`
 *
 * [__View Contract on Monad Testnet Monad Testnet Explorer__](https://testnet.monadexplorer.com/address/0xD06122a48bcAfe76E4eAA8CE8922b20a709AA26d)
 */
export const useWatchBountyEscrowEscrowLockedEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: bountyEscrowAbi,
    address: bountyEscrowAddress,
    eventName: 'EscrowLocked',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link bountyEscrowAbi}__ and `eventName` set to `"EscrowRefunded"`
 *
 * [__View Contract on Monad Testnet Monad Testnet Explorer__](https://testnet.monadexplorer.com/address/0xD06122a48bcAfe76E4eAA8CE8922b20a709AA26d)
 */
export const useWatchBountyEscrowEscrowRefundedEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: bountyEscrowAbi,
    address: bountyEscrowAddress,
    eventName: 'EscrowRefunded',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link bountyEscrowAbi}__ and `eventName` set to `"WorkerPaid"`
 *
 * [__View Contract on Monad Testnet Monad Testnet Explorer__](https://testnet.monadexplorer.com/address/0xD06122a48bcAfe76E4eAA8CE8922b20a709AA26d)
 */
export const useWatchBountyEscrowWorkerPaidEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: bountyEscrowAbi,
    address: bountyEscrowAddress,
    eventName: 'WorkerPaid',
  })
