'use client'

import { useState, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import { Wallet, Copy, X, ExternalLink, ChevronDown } from 'lucide-react'
import { useAccount, useDisconnect, useBalance, useChainId } from 'wagmi'
import { monadTestnet } from '@/lib/chains'
import { formatEther } from 'viem'
import { cn } from '@/lib/utils'

export function WalletConnectButton() {
  const { address, isConnected, isConnecting, connector } = useAccount()
  const { disconnectAsync } = useDisconnect()
  const { data: balance } = useBalance({ address })
  const chainId = useChainId()
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, right: 0 })
  const buttonRef = useRef<HTMLButtonElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const formatAddress = (addr: string) => `${addr.slice(0, 6)}...${addr.slice(-4)}`

  const getChainName = (id: number) => {
    if (id === monadTestnet.id) return 'Monad Testnet'
    return `Chain ${id}`
  }

  const handleCopyAddress = async () => {
    if (!address) return
    await navigator.clipboard.writeText(address)
  }

  const handleDisconnect = async () => {
    try {
      await disconnectAsync()
      setIsDropdownOpen(false)
    } catch (error) {
      console.error('Failed to disconnect:', error)
    }
  }

  // Calculate dropdown position relative to button
  const updateDropdownPosition = () => {
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect()
      setDropdownPosition({
        top: rect.bottom + window.scrollY + 8,
        right: window.innerWidth - rect.right
      })
    }
  }

  // Click outside to close
  useEffect(() => {
    if (!isDropdownOpen) return
    function handleClickOutside(event: MouseEvent) {
      if (buttonRef.current && !buttonRef.current.contains(event.target as Node)) {
        if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
          setIsDropdownOpen(false)
        }
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isDropdownOpen])

  // Escape key to close
  useEffect(() => {
    if (!isDropdownOpen) return
    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') setIsDropdownOpen(false)
    }
    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [isDropdownOpen])

  // Update position on scroll/resize
  useEffect(() => {
    if (!isDropdownOpen) return
    window.addEventListener('scroll', updateDropdownPosition, true)
    window.addEventListener('resize', updateDropdownPosition)
    updateDropdownPosition()
    return () => {
      window.removeEventListener('scroll', updateDropdownPosition, true)
      window.removeEventListener('resize', updateDropdownPosition)
    }
  }, [isDropdownOpen])

  // NOT CONNECTED - Use RainbowKit's ConnectButton
  if (!isConnected || !address) {
    return <ConnectButton showBalance={false} />
  }

  // CONNECTED - Our custom dropdown
  const dropdownContent = (
    <div
      ref={dropdownRef}
      className="liquid-glass rounded-xl border border-white/10 shadow-2xl z-[9999] min-w-[280px] animate-slide-down"
      style={{
        position: 'fixed',
        top: dropdownPosition.top,
        right: dropdownPosition.right,
      }}
    >
      {/* Header */}
      <div className="px-4 py-3 border-b border-white/10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#836EF9] to-white flex items-center justify-center text-black font-bold">
              <Wallet className="w-5 h-5" />
            </div>
            <div>
              <p className="font-medium text-white">Connected</p>
              <p className="text-xs text-white/50 font-mono">{formatAddress(address)}</p>
            </div>
          </div>
          <button onClick={() => setIsDropdownOpen(false)} className="text-white/40 hover:text-white transition-colors p-1">
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Balance */}
      <div className="px-4 py-3 border-b border-white/10">
        <div className="text-xs text-white/50 mb-1">MON Balance</div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl font-mono font-bold text-white">
              {balance ? parseFloat(formatEther(balance.value)).toFixed(4) : '0.0000'}
            </span>
            <span className="text-sm text-white/50">MON</span>
          </div>
          <button
            onClick={handleCopyAddress}
            className="p-1.5 rounded-lg text-white/50 hover:text-white hover:bg-white/10 transition-colors"
            title="Copy address"
          >
            <Copy className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Chain Info */}
      <div className="px-4 py-3 border-b border-white/10">
        <div className="text-xs text-white/50 mb-1">Network</div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-400" />
          <span className="text-white font-medium">{getChainName(chainId)}</span>
          <span className="text-xs text-white/40 font-mono">Chain ID: {chainId}</span>
        </div>
      </div>

      {/* Wallet Info */}
      {connector && (
        <div className="px-4 py-3 border-b border-white/10">
          <div className="text-xs text-white/50 mb-1">Wallet</div>
          <div className="flex items-center gap-2">
            <span className="text-white/80 capitalize">{connector.name}</span>
          </div>
        </div>
      )}

      {/* Disconnect */}
      <div className="p-4">
        <button
          onClick={handleDisconnect}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors"
        >
          <X className="w-5 h-5" />
          <span>Disconnect Wallet</span>
        </button>
      </div>

      <div className="px-4 py-2 text-center">
        <p className="text-[10px] text-white/40">By connecting, you agree to our Terms & Privacy</p>
      </div>
    </div>
  )

  return (
    <div className="relative">
      <button
        ref={buttonRef}
        onClick={() => {
          setIsDropdownOpen(prev => !prev)
          if (!isDropdownOpen) {
            setTimeout(updateDropdownPosition, 0)
          }
        }}
        className={cn(
          'flex items-center gap-2 px-3 py-2 rounded-full liquid-glass',
          'border border-white/10 hover:border-white/20',
          'text-white/80 hover:text-white transition-colors',
          'text-sm font-medium',
          isConnecting && 'opacity-70 cursor-wait'
        )}
        disabled={isConnecting}
        aria-expanded={isDropdownOpen}
        aria-haspopup="true"
      >
        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#836EF9] to-white flex items-center justify-center text-black font-bold">
          <Wallet className="w-4 h-4" />
        </div>
        <span className="font-mono">{formatAddress(address)}</span>
        <ChevronDown className={cn('w-3.5 h-3.5 transition-transform', isDropdownOpen && 'rotate-180')} />
      </button>

      {isDropdownOpen && createPortal(dropdownContent, document.body)}
    </div>
  )
}