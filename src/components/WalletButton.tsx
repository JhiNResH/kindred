'use client'

import { ConnectButton } from '@rainbow-me/rainbowkit'
import { useIsMounted } from './ClientOnly'

interface WalletButtonProps {
  variant?: 'default' | 'large' | 'minimal'
  showBalance?: boolean
}

export function WalletButton({ variant = 'default', showBalance = true }: WalletButtonProps) {
  const isMounted = useIsMounted()

  if (!isMounted) {
    return (
      <button className="px-5 py-2.5 rounded-lg bg-[#1f1f23] animate-pulse">
        <span className="invisible">Connect Wallet</span>
      </button>
    )
  }

  return (
    <ConnectButton.Custom>
      {({
        account,
        chain,
        openAccountModal,
        openChainModal,
        openConnectModal,
        mounted,
      }) => {
        const ready = mounted
        const connected = ready && account && chain

        return (
          <div
            {...(!ready && {
              'aria-hidden': true,
              style: {
                opacity: 0,
                pointerEvents: 'none',
                userSelect: 'none',
              },
            })}
          >
            {(() => {
              if (!connected) {
                return (
                  <button
                    onClick={openConnectModal}
                    className={`font-medium transition-all ${
                      variant === 'large'
                        ? 'px-8 py-4 text-lg rounded-xl bg-gradient-to-br from-purple-500 to-purple-700 text-white hover:translate-y-[-2px] hover:shadow-xl hover:shadow-purple-500/30'
                        : variant === 'minimal'
                        ? 'px-4 py-2 text-sm rounded-lg bg-transparent border border-[#2a2a2e] text-[#adadb0] hover:bg-[#111113] hover:text-white'
                        : 'px-5 py-2.5 rounded-lg bg-gradient-to-br from-purple-500 to-purple-700 text-white hover:translate-y-[-2px] hover:shadow-lg hover:shadow-purple-500/30'
                    }`}
                  >
                    Connect Wallet
                  </button>
                )
              }

              if (chain.unsupported) {
                return (
                  <button
                    onClick={openChainModal}
                    className="px-5 py-2.5 rounded-lg bg-red-500/20 text-red-400 border border-red-500/30 font-medium hover:bg-red-500/30 transition-colors"
                  >
                    Wrong Network
                  </button>
                )
              }

              return (
                <div className="flex items-center gap-2">
                  {showBalance && account.displayBalance && (
                    <button
                      onClick={openChainModal}
                      className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-lg bg-[#111113] border border-[#1f1f23] text-sm text-[#adadb0] hover:bg-[#1a1a1d] transition-colors"
                    >
                      {chain.hasIcon && chain.iconUrl && (
                        <img
                          src={chain.iconUrl}
                          alt={chain.name ?? 'Chain'}
                          className="w-4 h-4 rounded-full"
                        />
                      )}
                      <span>{account.displayBalance}</span>
                    </button>
                  )}

                  <button
                    onClick={openAccountModal}
                    className={`flex items-center gap-2 font-medium transition-all ${
                      variant === 'large'
                        ? 'px-6 py-3 text-base rounded-xl bg-[#111113] border border-[#2a2a2e] text-white hover:bg-[#1a1a1d]'
                        : 'px-4 py-2 rounded-lg bg-[#111113] border border-[#1f1f23] text-white hover:bg-[#1a1a1d]'
                    }`}
                  >
                    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-xs font-bold">
                      {account.displayName?.slice(0, 2)}
                    </div>
                    <span className="text-sm">{account.displayName}</span>
                  </button>
                </div>
              )
            })()}
          </div>
        )
      }}
    </ConnectButton.Custom>
  )
}
