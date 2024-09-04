import React, { useState, useCallback } from 'react';
import { usePrivy } from '@privy-io/react-auth';
import { useWalletClient } from 'wagmi';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';


interface NLPResult {
    intent: string;
    confidence: number;
    entities: {
      addresses: string[];
      transactionHashes: string[];
      blockNumbers: number[];
      tokenSymbols: string[];
      contractAddresses: string[];
      topics: string[];
      fromBlock?: number;
      toBlock?: number;
      timeRange?: string;
    };
    data: any;
  }
  

const AIAssistant: React.FC = () => {
  const [query, setQuery] = useState('');
  const [response, setResponse] = useState<NLPResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [context, setContext] = useState('');
  const [error, setError] = useState<string | null>(null);
  const { user, authenticated } = usePrivy();
  const { data: walletClient } = useWalletClient();

  const handleQueryChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(event.target.value);
    setError(null);
  };

  const processQuery = useCallback(async () => {
    if (!query.trim()) {
      setError('Please enter a query');
      return;
    }

    setIsLoading(true);
    setResponse(null);
    setError(null);

    try {
      const nlpResponse = await fetch('/api/process-query', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query, context }),
      });

      if (!nlpResponse.ok) {
        throw new Error('Failed to process query');
      }

      const nlpResult: NLPResult = await nlpResponse.json();
      setResponse(nlpResult);
      setContext(nlpResult.intent);
    } catch (error) {
      setError('Error processing query. Please try again.');
      console.error('Error processing query:', error);
    } finally {
      setIsLoading(false);
    }
  }, [query, context]);

  const renderData = (intent: string, data: any) => {
    switch (intent) {
      case 'contract_abi':
        return renderABI(data);
      case 'visualize_token_transfers':
        return renderTokenTransfersChart(data);
      case 'visualize_account_balance_history':
        return renderAccountBalanceHistoryChart(data);
      case 'visualize_transaction_volume':
        return renderTransactionVolumeChart(data);
      default:
        // If no specific intent handling, fall back to general data rendering
        if (Array.isArray(data)) {
          return (
            <ul className="list-disc pl-5">
              {data.map((item, index) => (
                <li key={index}>{JSON.stringify(item)}</li>
              ))}
            </ul>
          );
        } else if (typeof data === 'object') {
          return (
            <ul className="list-disc pl-5">
              {Object.entries(data).map(([key, value]) => (
                <li key={key}>
                  <strong>{key}:</strong> {JSON.stringify(value)}
                </li>
              ))}
            </ul>
          );
        } else {
          return (
            <pre className="whitespace-pre-wrap overflow-x-auto">
              {JSON.stringify(data, null, 2)}
            </pre>
          );
        }
    }
  };

  const renderABI = (abi: any[]) => (
    <div className="mt-4">
      <h4 className="font-bold">Contract ABI:</h4>
      <div className="max-h-96 overflow-y-auto">
        {abi.map((item, index) => (
          <div key={index} className="mb-4 p-2 bg-gray-200 rounded">
            <p><strong>Type:</strong> {item.type}</p>
            {item.name && <p><strong>Name:</strong> {item.name}</p>}
            {item.inputs && (
              <div>
                <p><strong>Inputs:</strong></p>
                <ul className="list-disc pl-5">
                  {item.inputs.map((input: any, i: number) => (
                    <li key={i}>{input.type} {input.name}</li>
                  ))}
                </ul>
              </div>
            )}
            {item.outputs && (
              <div>
                <p><strong>Outputs:</strong></p>
                <ul className="list-disc pl-5">
                  {item.outputs.map((output: any, i: number) => (
                    <li key={i}>{output.type} {output.name}</li>
                  ))}
                </ul>
              </div>
            )}
            {item.stateMutability && <p><strong>State Mutability:</strong> {item.stateMutability}</p>}
          </div>
        ))}
      </div>
    </div>
  );

  const renderTokenTransfersChart = (data: any) => (
    <div className="mt-4">
      <h4 className="font-bold">Token Transfers Chart:</h4>
      <ResponsiveContainer width="100%" height={400}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="timestamp" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey="value" stroke="#8884d8" activeDot={{ r: 8 }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );

  const renderAccountBalanceHistoryChart = (data: any) => (
    <div className="mt-4">
      <h4 className="font-bold">Account Balance History Chart:</h4>
      <ResponsiveContainer width="100%" height={400}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="timestamp" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey="balance" stroke="#82ca9d" activeDot={{ r: 8 }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );

  const renderTransactionVolumeChart = (data: any) => (
    <div className="mt-4">
      <h4 className="font-bold">Transaction Volume Chart:</h4>
      <ResponsiveContainer width="100%" height={400}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey="volume" stroke="#ffc658" activeDot={{ r: 8 }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );


  return (
    <div className="p-4 bg-white rounded-lg shadow">
      <h2 className="text-xl font-bold mb-4">AI Block Explorer Assistant for Base Blockchain</h2>
      <div className="mb-4">
        <label htmlFor="query" className="block text-sm font-medium text-gray-700">
          Enter your query
        </label>
        <input
          type="text"
          id="query"
          value={query}
          onChange={handleQueryChange}
          placeholder="Ask about the Base blockchain..."
          className="mt-1 block w-full p-2 border rounded-md shadow-sm"
          aria-label="Query input"
        />
      </div>
      <button
        onClick={processQuery}
        disabled={isLoading}
        className="w-full bg-blue-500 text-white p-2 rounded-md hover:bg-blue-600 disabled:bg-blue-300"
        aria-label="Process query"
      >
        {isLoading ? 'Processing...' : 'Process Query'}
      </button>
      {error && <div className="mt-4 p-2 bg-red-100 text-red-700 rounded-md">{error}</div>}
      {response && (
        <div className="mt-4 p-4 bg-gray-100 rounded-md">
          <h3 className="font-bold">Intent: {response.intent}</h3>
          <p>Confidence: {(response.confidence * 100).toFixed(2)}%</p>
          <h4 className="font-bold mt-2">Entities:</h4>
          <ul className="list-disc pl-5">
            {Object.entries(response.entities).map(([key, value]) => (
              <li key={key}>
                <strong>{key}:</strong> {Array.isArray(value) ? value.join(', ') : value}
              </li>
            ))}
          </ul>
          <h4 className="font-bold mt-2">Data:</h4>
          {renderData(response.intent, response.data)}
        </div>
      )}
      {authenticated && walletClient && (
        <div className="mt-4 p-2 bg-green-100 text-green-700 rounded-md">
          Connected wallet address: {walletClient.getAddress()}
        </div>
      )}
    </div>
  );
};

export default AIAssistant;
  