"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ConnectWallet } from "@/components/connect-wallet"
import { EscrowContract } from "@/components/escrow-contract"
import { useAccount } from "wagmi"

export function EscrowApp() {
  const { isConnected, address } = useAccount()
  const [contracts, setContracts] = useState([])

  const deployNewContract = async (beneficiary, arbiter, value) => {
    // This will be implemented in EscrowContract component
    // We'll just update the state here
    const contractAddress = "0x" + Math.random().toString(16).substring(2, 42) // Placeholder

    setContracts((prev) => [
      ...prev,
      {
        address: contractAddress,
        arbiter,
        beneficiary,
        value,
        isApproved: false,
      },
    ])

    return contractAddress
  }

  const addExistingContract = (address, arbiter, beneficiary, value) => {
    setContracts((prev) => [
      ...prev,
      {
        address,
        arbiter,
        beneficiary,
        value,
        isApproved: false,
      },
    ])
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Wallet Connection</CardTitle>
          <CardDescription>Connect your wallet to interact with the escrow contracts</CardDescription>
        </CardHeader>
        <CardContent>
          <ConnectWallet />
        </CardContent>
      </Card>

      {isConnected && (
        <EscrowContract
          account={address}
          contracts={contracts}
          onDeploy={deployNewContract}
          onAdd={addExistingContract}
        />
      )}
    </div>
  )
}
