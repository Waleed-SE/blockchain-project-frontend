import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { transactionAPI } from '../services/api';

export default function Logs() {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState<'all' | 'sent' | 'received'>('all');

  useEffect(() => {
    if (user?.wallet_id) {
      fetchTransactions();
    }
  }, [user]);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const response = await transactionAPI.getHistory(user?.wallet_id || '', 100, 0);
      setTransactions(response.data.data || []);
      setError('');
    } catch (err: any) {
      setError('Failed to load transaction history');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filteredTransactions = transactions.filter(tx => {
    if (filter === 'sent') return tx.sender_wallet_id === user?.wallet_id;
    if (filter === 'received') return tx.receiver_wallet_id === user?.wallet_id;
    return true;
  });

  const getTransactionType = (tx: any) => {
    if (tx.sender_wallet_id === user?.wallet_id && tx.receiver_wallet_id === user?.wallet_id) {
      return { type: 'Self', icon: '🔄', color: 'text-blue-600' };
    }
    if (tx.sender_wallet_id === user?.wallet_id) {
      return { type: 'Sent', icon: '📤', color: 'text-red-600' };
    }
    return { type: 'Received', icon: '📥', color: 'text-green-600' };
  };

  if (loading) {
    return (
      <div className="card text-center py-12">
        <div className="spinner mx-auto mb-4"></div>
        <p className="text-gray-600">Loading transaction logs...</p>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">📋 Transaction Logs</h1>

      {error && (
        <div className="alert alert-error mb-6">
          {error}
        </div>
      )}

      <div className="card mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">Filter Transactions</h2>
          <div className="flex gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded ${filter === 'all' ? 'bg-primary text-white' : 'bg-gray-200'}`}
            >
              All ({transactions.length})
            </button>
            <button
              onClick={() => setFilter('sent')}
              className={`px-4 py-2 rounded ${filter === 'sent' ? 'bg-primary text-white' : 'bg-gray-200'}`}
            >
              Sent ({transactions.filter(tx => tx.sender_wallet_id === user?.wallet_id).length})
            </button>
            <button
              onClick={() => setFilter('received')}
              className={`px-4 py-2 rounded ${filter === 'received' ? 'bg-primary text-white' : 'bg-gray-200'}`}
            >
              Received ({transactions.filter(tx => tx.receiver_wallet_id === user?.wallet_id).length})
            </button>
          </div>
        </div>
      </div>

      {filteredTransactions.length === 0 ? (
        <div className="card text-center py-12">
          <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">No Transactions Found</h3>
          <p className="text-gray-600">Your transaction history will appear here.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredTransactions.map((tx: any, index: number) => {
            const txType = getTransactionType(tx);
            return (
              <div key={index} className="card hover:shadow-lg transition-shadow">
                <div className="flex items-center justify-between">
                  <div className="flex items-center flex-1">
                    <div className="text-4xl mr-4">{txType.icon}</div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`font-bold ${txType.color}`}>{txType.type}</span>
                        <span className="text-2xl font-bold text-gray-900">
                          {parseFloat(tx.amount).toFixed(2)} Coins
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 font-mono mb-1">
                        Hash: {tx.transaction_hash?.substring(0, 32)}...
                      </p>
                      <div className="text-xs text-gray-500">
                        <p>From: {tx.sender_wallet_id.substring(0, 16)}...</p>
                        <p>To: {tx.receiver_wallet_id.substring(0, 16)}...</p>
                      </div>
                      {tx.note && (
                        <p className="text-sm text-gray-700 mt-2 italic">📝 {tx.note}</p>
                      )}
                    </div>
                  </div>
                  <div className="text-right ml-4">
                    <p className="text-sm text-gray-600 mb-1">
                      {new Date(tx.created_at).toLocaleDateString()}
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(tx.created_at).toLocaleTimeString()}
                    </p>
                    {tx.block_index && (
                      <p className="text-xs text-purple-600 font-medium mt-1">
                        Block #{tx.block_index}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
