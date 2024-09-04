"use client";

import React from 'react';
import { usePrivy } from '@privy-io/react-auth';
import { useWalletClient } from 'wagmi';
import AIAssistant from '@/components/AI/AIAsisstant'; // Import the AIAssistant component
import { Button } from "@/components/ui/button";

export default function Home() {
  const { authenticated, login } = usePrivy();
  const { data: walletClient } = useWalletClient();

  const renderBody = () => {
    if (!authenticated) {
      return (
        <div className="text-center">
          <p className="mb-4">Connect your wallet to use the AI Blockchain Explorer</p>
          <Button onClick={login}>Connect Wallet</Button>
        </div>
      );
    }

    return <AIAssistant />;
  };

  return (
    <main className="flex flex-col items-center justify-center min-h-screen p-4 bg-gray-100">
      <h1 className="text-3xl font-bold mb-8">AI Blockchain Explorer for Base</h1>
      <div className="w-full max-w-3xl bg-white rounded-lg shadow-md p-6">
        {renderBody()}
      </div>
      {authenticated && walletClient && (
        <div className="mt-4 p-2 bg-green-100 text-green-700 rounded-md">
          Connected wallet address: {walletClient.account.address}
        </div>
      )}
    </main>
  );
}