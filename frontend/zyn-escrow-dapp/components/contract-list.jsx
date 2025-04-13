"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { escrowAbi } from "@/lib/contract"
import { CheckCircle, AlertCircle } from "lucide-react"
import { useWriteContract, useWaitForTransactionReceipt } from "wagmi"

export function ContractList({ contracts, account }) {
  const [approvingContract, setApprovingContract] = useState(null)
  const { toast } = useToast()

  // Use the wagmi v2 hooks for contract writing
  const {
    data: hash,
    isPending,
    writeContract,
  } = useWriteContract({
    onError(error) {
      console.error("Error approving contract:", error)
      toast({
        title: "Approval Failed",
        description: error.message || "Failed to approve the escrow contract",
        variant: "destructive",
      })
      setApprovingContract(null)
    },
  })

  // Wait for transaction receipt
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
    onSuccess() {
      toast({
        title: "Contract Approved",
        description: "The escrow contract has been approved and funds released to the beneficiary",
      })
      setApprovingContract(null)
    },
    onError(error) {
      console.error("Error in transaction:", error)
      toast({
        title: "Transaction Failed",
        description: "The approval transaction failed",
        variant: "destructive",
      })
      setApprovingContract(null)
    },
  })

  const approveContract = async (contractAddress) => {
    setApprovingContract(contractAddress)
    writeContract({
      address: contractAddress,
      abi: escrowAbi,
      functionName: "approve",
    })
  }

  const isArbiter = (contract) => {
    return contract.arbiter.toLowerCase() === account.toLowerCase()
  }

  const isBeneficiary = (contract) => {
    return contract.beneficiary.toLowerCase() === account.toLowerCase()
  }

  const isDepositor = (contract) => {
    // This is a simplification - in reality, you'd need to check if this account deployed the contract
    return !isArbiter(contract) && !isBeneficiary(contract)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Your Escrow Contracts</CardTitle>
        <CardDescription>Manage your escrow contracts</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {contracts.length === 0 ? (
            <p className="text-center text-gray-500">No contracts found</p>
          ) : (
            contracts.map((contract, index) => (
              <Card key={index} className="overflow-hidden">
                <div className="p-4 border-b">
                  <div className="flex justify-between items-center">
                    <h3 className="font-medium">
                      Contract: {contract.address.substring(0, 6)}...{contract.address.substring(38)}
                    </h3>
                    <div className="flex items-center">
                      {contract.isApproved ? (
                        <div className="flex items-center text-green-500">
                          <CheckCircle className="h-4 w-4 mr-1" />
                          <span className="text-xs">Approved</span>
                        </div>
                      ) : (
                        <div className="flex items-center text-yellow-500">
                          <AlertCircle className="h-4 w-4 mr-1" />
                          <span className="text-xs">Pending</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <div className="p-4 space-y-2 text-sm">
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <p className="text-gray-500">Amount</p>
                      <p className="font-medium">{contract.value} ETH</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Beneficiary</p>
                      <p className="font-medium truncate" title={contract.beneficiary}>
                        {contract.beneficiary.substring(0, 6)}...{contract.beneficiary.substring(38)}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-500">Arbiter</p>
                      <p className="font-medium truncate" title={contract.arbiter}>
                        {contract.arbiter.substring(0, 6)}...{contract.arbiter.substring(38)}
                      </p>
                    </div>
                  </div>

                  <div className="pt-2">
                    <div className="flex flex-wrap gap-2">
                      {isArbiter(contract) && !contract.isApproved && (
                        <Button
                          size="sm"
                          onClick={() => approveContract(contract.address)}
                          disabled={isPending || isConfirming || approvingContract === contract.address}
                        >
                          {isPending || isConfirming ? "Approving..." : "Approve & Release Funds"}
                        </Button>
                      )}

                      {isBeneficiary(contract) && (
                        <div className="text-sm text-green-600">
                          {contract.isApproved ? "Funds have been released to you" : "Waiting for arbiter approval"}
                        </div>
                      )}

                      {isDepositor(contract) && (
                        <div className="text-sm text-blue-600">
                          {contract.isApproved
                            ? "Funds have been released to the beneficiary"
                            : "Waiting for arbiter approval"}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  )
}
