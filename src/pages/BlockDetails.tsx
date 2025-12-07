import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { blockchainAPI } from '../services/api';

export default function BlockDetails() {
  const { index } = useParams<{ index: string }>();
  const [block, setBlock] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (index) {
      fetchBlockDetails();
    }
  }, [index]);

  const fetchBlockDetails = async () => {
    try {
      setLoading(true);
      const response = await blockchainAPI.getBlock(parseInt(index!));
      setBlock(response.data.data);
      setError('');
    } catch (err: any) {
      setError('Failed to load block details');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (timestamp: number) => {
    // Unix timestamp is in seconds, convert to milliseconds
    return new Date(timestamp * 1000).toLocaleString();
  };

  if (loading) {
    return (
      <div className="card text-center py-12">
        <div className="spinner mx-auto mb-4"></div>
        <p className="text-gray-600">Loading block details...</p>
      </div>
    );
  }

  if (error || !block) {
    return (
      <div>
        <Link to="/blocks" className="btn btn-secondary mb-6">
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Explorer
        </Link>
        <div className="alert alert-error">
          <svg className="w-5 h-5 inline mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
          {error}
        </div>
      </div>
    );
  }

  return (
    <div>
      <Link to="/blocks" className="btn btn-secondary mb-6">
        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back to Explorer
      </Link>

      <h1 className="text-3xl font-bold mb-6">🔍 Block #{block.index}</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="card bg-gradient-to-br from-purple-500 to-purple-600 text-white">
          <p className="text-purple-100 text-sm">Block Index</p>
          <p className="text-4xl font-bold mt-1">#{block.index}</p>
        </div>

        <div className="card bg-gradient-to-br from-blue-500 to-blue-600 text-white">
          <p className="text-blue-100 text-sm">Transactions</p>
          <p className="text-4xl font-bold mt-1">{block.transactions?.length || 0}</p>
        </div>

        <div className="card bg-gradient-to-br from-green-500 to-green-600 text-white">
          <p className="text-green-100 text-sm">Nonce</p>
          <p className="text-4xl font-bold mt-1">{block.nonce}</p>
        </div>
      </div>

      <div className="card mb-6">
        <h2 className="text-xl font-bold mb-4">Block Information</h2>
        <div className="space-y-4">
          <div>
            <p className="text-sm text-gray-600 mb-1">Block Hash</p>
            <p className="font-mono text-sm bg-gray-100 p-2 rounded break-all">{block.hash}</p>
          </div>

          <div>
            <p className="text-sm text-gray-600 mb-1">Previous Hash</p>
            <p className="font-mono text-sm bg-gray-100 p-2 rounded break-all">{block.previous_hash || 'Genesis Block'}</p>
          </div>

          <div>
            <p className="text-sm text-gray-600 mb-1">Merkle Root</p>
            <p className="font-mono text-sm bg-gray-100 p-2 rounded break-all">{block.merkle_root || 'N/A'}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600 mb-1">Timestamp</p>
              <p className="font-medium">{formatDate(block.timestamp)}</p>
            </div>

            <div>
              <p className="text-sm text-gray-600 mb-1">Difficulty</p>
              <p className="font-medium">{block.difficulty || 'N/A'}</p>
            </div>
          </div>
        </div>
      </div>

      {block.transactions && block.transactions.length > 0 && (
        <div className="card">
          <h2 className="text-xl font-bold mb-4">Transactions</h2>
          <div className="space-y-3">
            {block.transactions.map((tx: any, index: number) => (
              <div key={index} className="bg-gray-50 p-4 rounded-lg">
                <div className="flex justify-between items-start mb-2">
                  <p className="font-mono text-sm text-gray-600">Tx #{index + 1}</p>
                  <p className="font-bold text-green-600">{parseFloat(tx.amount).toFixed(2)} Coins</p>
                </div>
                <p className="text-xs font-mono text-gray-500 break-all mb-2">{tx.transaction_hash}</p>
                <div className="text-xs text-gray-600">
                  <p>From: {tx.sender_wallet_id.substring(0, 16)}...</p>
                  <p>To: {tx.receiver_wallet_id.substring(0, 16)}...</p>
                  {tx.note && <p className="mt-1 italic">Note: {tx.note}</p>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
