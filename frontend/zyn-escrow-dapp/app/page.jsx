import { EscrowApp } from "@/components/escrow-app"

export default function Home() {
  return (
    <main className="min-h-screen p-4 md:p-8 lg:p-24">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-bold mb-6">Escrow DApp</h1>
        <p className="text-gray-600 dark:text-gray-400 mb-8">
          A decentralized escrow application for secure transactions
        </p>
        <EscrowApp />
      </div>
    </main>
  )
}
