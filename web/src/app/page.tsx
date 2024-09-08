"use client";

import React from 'react';
import AIAssistant from '@/components/AI/AIAsisstant';

export default function Home() {
  return (
    <main className="flex flex-col items-center justify-center min-h-screen p-4 bg-gray-100">
      <h1 className="text-3xl font-bold mb-8">AI Blockchain Explorer for Base</h1>
      <div className="w-full max-w-3xl bg-white rounded-lg shadow-md p-6">
        <AIAssistant />
      </div>
    </main>
  );
}