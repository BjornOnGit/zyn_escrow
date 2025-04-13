"use client"

import { WagmiConfig, createConfig, http } from "wagmi"
import { mainnet, sepolia, hardhat } from "wagmi/chains"
import { ConnectKitProvider, getDefaultConfig } from "connectkit"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"

const queryClient = new QueryClient()

// Configure wagmi & ConnectKit
const config = createConfig(
  getDefaultConfig({
    // Your dApp's info
    appName: "Zyn Escrow DApp",
    // Get your own API keys from https://www.alchemy.com
    // This key is for demo purposes only
    alchemyId: process.env.NEXT_PUBLIC_ALCHEMY_ID || "demo",
    // Get your own WalletConnect project ID from https://cloud.walletconnect.com
    walletConnectProjectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || "demo",
    chains: [mainnet, sepolia, hardhat],
    transports: {
      [mainnet.id]: http(),
      [sepolia.id]: http(),
      [hardhat.id]: http(),
    },
  }),
)

export function Providers({ children }) {
  return (
    <QueryClientProvider client={queryClient}>
      <WagmiConfig config={config}>
        <ConnectKitProvider theme="auto">{children}</ConnectKitProvider>
      </WagmiConfig>
    </QueryClientProvider>
  )
}
