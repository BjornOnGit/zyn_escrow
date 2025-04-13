"use client"

import { ConnectKitButton } from "connectkit"
import { useAccount } from "wagmi"

export function ConnectWallet() {
  const { isConnected, address } = useAccount()

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
      <div>
        {isConnected && address ? (
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-green-500"></div>
            <span className="text-sm font-medium">
              Connected: {address.substring(0, 6)}...{address.substring(38)}
            </span>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-gray-300"></div>
            <span className="text-sm font-medium">Not connected</span>
          </div>
        )}
      </div>

      <ConnectKitButton />
    </div>
  )
}
