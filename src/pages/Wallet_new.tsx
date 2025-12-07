import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { walletAPI } from '../services/api';

export default function Wallet() {
  const { user } = useAuth();
  const [wallet, setWallet] = useState<any>(null);
  const [balance, setBalance] = useState<number>(0);
  const [utxos, setUtxos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchWalletData();
  }, []);

  const fetchWalletData = async () => {
    try {
      if (!user?.wallet_id) return;

      const [walletRes, balanceRes, utxosRes] = await Promise.all([
        walletAPI.getWallet(user.wallet_id),
        walletAPI.getBalance(user.wallet_id),
        walletAPI.getUTXOs(user.wallet_id),
      ]);

      setWallet(walletRes.data.data);
      setBalance(balanceRes.data.data.balance);
      setUtxos(utxosRes.data.data || []);
      setError('');
    } catch (err: any) {
      setError('Failed to load wallet data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  if (loading) {
    return (
      <div className="card text-center py-12">
        <div className="spinner mx-auto mb-4"></div>
        <p className="text-gray-600">Loading wallet...</p>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">💼 My Wallet</h1>

      {error && (
        <div className="alert alert-error mb-6">
          <svg className="w-5 h-5 inline mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="card bg-gradient-to-br from-green-500 to-green-600 text-white">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-green-100 text-sm">Total Balance</p>
              <p className="text-5xl font-bold mt-2">{balance.toFixed(2)}</p>
              <p className="text-lg text-green-100 mt-2">Coins</p>
            </div>
            <svg className="w-20 h-20 text-green-200" fill="currentColor" viewBox="0 0 20 20">
              <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd" />
            </svg>
          </div>
          <button
            onClick={fetchWalletData}
            className="w-full bg-green-700 hover:bg-green-800 text-white py-2 rounded-lg transition-colors flex items-center justify-center"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Refresh Balance
          </button>
        </div>

        <div className="card bg-gradient-to-br from-blue-500 to-blue-600 text-white">
          <p className="text-blue-100 text-sm mb-3">Wallet Address</p>
          <div className="bg-blue-700 bg-opacity-50 p-4 rounded-lg mb-4">
            <p className="font-mono text-sm break-all">{wallet?.wallet_id}</p>
          </div>
          <button
            onClick={() => copyToClipboard(wallet?.wallet_id || '')}
            className="w-full bg-blue-700 hover:bg-blue-800 text-white py-2 rounded-lg transition-colors flex items-center justify-center"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            Copy Address
          </button>
          <p className="text-xs text-blue-100 mt-2 text-center">Created: {wallet?.created_at ? formatDate(wallet.created_at) : 'N/A'}</p>
        </div>
      </div>

      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Unspent Outputs (UTXOs)</h2>
          <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-semibold">
            {utxos.length} UTXO{utxos.length !== 1 ? 's' : ''}
          </span>
        </div>

        {utxos.length === 0 ? (
          <div className="text-center py-12">
            <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
            </svg>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">No UTXOs</h3>
            <p className="text-gray-600">You don't have any unspent transaction outputs yet.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {utxos.map((utxo: any, index: number) => (
              <div key={utxo.utxo_id || index} className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded">
                        UNSPENT
                      </span>
                      <span className="text-xs text-gray-500">Output #{utxo.output_index || 0}</span>
                    </div>
                    <p className="text-xs font-mono text-gray-600 break-all mb-1">
                      Tx: {utxo.tx_hash?.substring(0, 40)}...
                    </p>
                    <p className="text-xs text-gray-500">
                      Created: {utxo.created_at ? formatDate(utxo.created_at) : 'N/A'}
                    </p>
                  </div>
                  <div className="text-right ml-4">
                    <p className="text-2xl font-bold text-green-600">{parseFloat(utxo.amount).toFixed(2)}</p>
                    <p className="text-sm text-gray-500">Coins</p>
                  </div>
                </div>
              </div>
            ))}\n          </div>
        )}
      </div>

      <div className="card mt-6 bg-blue-50 border border-blue-200">
        <div className="flex items-start">
          <svg className="w-6 h-6 text-blue-600 mt-0.5 mr-3" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
          <div>
            <p className="text-sm font-semibold text-blue-800 mb-1">About UTXOs</p>
            <p className="text-xs text-blue-700">
              UTXOs (Unspent Transaction Outputs) represent coins you can spend. When you receive money, new UTXOs are created. When you send money, UTXOs are consumed and new ones are created for the change.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
