import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatAddress(addr: string): string {
  if (!addr) return ''
  if (addr.length <= 10) return addr
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`
}

// Gas limits for contract interactions
export const GAS_LIMITS = {
  CLAIM_PAYMENT: 200000n,
  LOCK_ESCROW: 300000n,
  REFUND_REMAINING: 150000n,
} as const

export type GasLimitKey = keyof typeof GAS_LIMITS

export function getGasLimit(key: GasLimitKey): bigint {
  return GAS_LIMITS[key]
}