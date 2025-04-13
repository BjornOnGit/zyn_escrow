"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { ContractList } from "@/components/contract-list"
import { isAddress } from "viem"
import { usePublicClient, useWriteContract } from "wagmi"
import { escrowAbi, escrowBytecode } from "@/lib/contract"

export function EscrowContract({ account, contracts, onDeploy, onAdd }) {
  const [beneficiary, setBeneficiary] = useState("")
  const [arbiter, setArbiter] = useState("")
  const [value, setValue] = useState("")
  const [existingAddress, setExistingAddress] = useState("")
  const [existingArbiter, setExistingArbiter] = useState("")
  const [existingBeneficiary, setExistingBeneficiary] = useState("")
  const [existingValue, setExistingValue] = useState("")
  const [isDeploying, setIsDeploying] = useState(false)

  const { toast } = useToast()
  const { writeContractAsync } = useWriteContract()
  const publicClient = usePublicClient()

  const handleDeploy = async () => {
    if (!writeContractAsync) return

    if (!isAddress(beneficiary)) {
      toast({
        title: "Invalid Address",
        description: "Please enter a valid beneficiary address",
        variant: "destructive",
      })
      return
    }

    if (!isAddress(arbiter)) {
      toast({
        title: "Invalid Address",
        description: "Please enter a valid arbiter address",
        variant: "destructive",
      })
      return
    }

    if (!value || Number.parseFloat(value) <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid amount to deposit",
        variant: "destructive",
      })
      return
    }

    setIsDeploying(true)
    try {
      // Convert ETH to Wei
      const valueInWei = BigInt(Number.parseFloat(value) * 10 ** 18)

      // Deploy contract using viem
      const hash = await writeContractAsync({
        abi: escrowAbi,
        bytecode: escrowBytecode,
        args: [arbiter, beneficiary],
        value: valueInWei,
      })

      // Wait for transaction receipt
      const receipt = await publicClient.waitForTransactionReceipt({ hash })

      // Get contract address from receipt
      const contractAddress = receipt.contractAddress

      if (contractAddress) {
        await onDeploy(beneficiary, arbiter, value)

        toast({
          title: "Contract Deployed",
          description: `New escrow contract deployed at ${contractAddress.substring(0, 6)}...${contractAddress.substring(38)}`,
        })

        // Reset form
        setBeneficiary("")
        setArbiter("")
        setValue("")
      }
    } catch (error) {
      console.error("Error deploying contract:", error)
      toast({
        title: "Deployment Failed",
        description: error.message || "Failed to deploy escrow contract. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsDeploying(false)
    }
  }

  const handleAddExisting = () => {
    if (!isAddress(existingAddress)) {
      toast({
        title: "Invalid Address",
        description: "Please enter a valid contract address",
        variant: "destructive",
      })
      return
    }

    if (!isAddress(existingBeneficiary)) {
      toast({
        title: "Invalid Address",
        description: "Please enter a valid beneficiary address",
        variant: "destructive",
      })
      return
    }

    if (!isAddress(existingArbiter)) {
      toast({
        title: "Invalid Address",
        description: "Please enter a valid arbiter address",
        variant: "destructive",
      })
      return
    }

    if (!existingValue || Number.parseFloat(existingValue) <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid contract value",
        variant: "destructive",
      })
      return
    }

    onAdd(existingAddress, existingArbiter, existingBeneficiary, existingValue)

    // Reset form
    setExistingAddress("")
    setExistingArbiter("")
    setExistingBeneficiary("")
    setExistingValue("")
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue="deploy">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="deploy">Deploy New Contract</TabsTrigger>
          <TabsTrigger value="existing">Add Existing Contract</TabsTrigger>
        </TabsList>

        <TabsContent value="deploy">
          <Card>
            <CardHeader>
              <CardTitle>Deploy New Escrow Contract</CardTitle>
              <CardDescription>
                Create a new escrow contract by specifying the beneficiary, arbiter, and deposit amount
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="beneficiary">Beneficiary Address</Label>
                <Input
                  id="beneficiary"
                  placeholder="0x..."
                  value={beneficiary}
                  onChange={(e) => setBeneficiary(e.target.value)}
                />
                <p className="text-xs text-gray-500">The address that will receive the funds when approved</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="arbiter">Arbiter Address</Label>
                <Input id="arbiter" placeholder="0x..." value={arbiter} onChange={(e) => setArbiter(e.target.value)} />
                <p className="text-xs text-gray-500">The address that will approve the transaction</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="value">Deposit Amount (ETH)</Label>
                <Input
                  id="value"
                  type="number"
                  step="0.01"
                  placeholder="0.1"
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                />
                <p className="text-xs text-gray-500">The amount to deposit in ETH</p>
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handleDeploy} disabled={isDeploying || !writeContractAsync} className="w-full">
                {isDeploying ? "Deploying..." : "Deploy Contract"}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="existing">
          <Card>
            <CardHeader>
              <CardTitle>Add Existing Escrow Contract</CardTitle>
              <CardDescription>Add an existing escrow contract by providing its address and details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="contractAddress">Contract Address</Label>
                <Input
                  id="contractAddress"
                  placeholder="0x..."
                  value={existingAddress}
                  onChange={(e) => setExistingAddress(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="existingBeneficiary">Beneficiary Address</Label>
                <Input
                  id="existingBeneficiary"
                  placeholder="0x..."
                  value={existingBeneficiary}
                  onChange={(e) => setExistingBeneficiary(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="existingArbiter">Arbiter Address</Label>
                <Input
                  id="existingArbiter"
                  placeholder="0x..."
                  value={existingArbiter}
                  onChange={(e) => setExistingArbiter(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="existingValue">Contract Value (ETH)</Label>
                <Input
                  id="existingValue"
                  type="number"
                  step="0.01"
                  placeholder="0.1"
                  value={existingValue}
                  onChange={(e) => setExistingValue(e.target.value)}
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handleAddExisting} disabled={!account} className="w-full">
                Add Contract
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>

      {contracts.length > 0 && <ContractList contracts={contracts} account={account} />}
    </div>
  )
}
