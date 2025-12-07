import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { walletAPI } from '../services/api';

export default function Wallet() {
  const { user } = useAuth();
  const [walletData, setWalletData] = useState<any>(null);
  const [utxos, setUtxos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user?.wallet_id) {
      fetchWalletData();
    }
  }, [user]);

  const fetchWalletData = async () => {
    try {
      setLoading(true);
      if (!user?.wallet_id) return;
      const [walletRes, utxosRes] = await Promise.all([
        walletAPI.getWallet(user.wallet_id),
        walletAPI.getUTXOs(user.wallet_id)
      ]);
      
      setWalletData(walletRes.data.data);
      setUtxos(utxosRes.data.data || []);
      setError('');
    } catch (err: any) {
      setError('Failed to load wallet data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    alert(`${label} copied to clipboard!`);
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
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="card bg-gradient-to-br from-green-500 to-green-600 text-white">
          <p className="text-green-100 text-sm mb-2">Current Balance</p>
          <p className="text-5xl font-bold">{walletData?.balance?.toFixed(2) || '0.00'}</p>
          <p className="text-green-100 text-sm mt-2">Coins</p>
        </div>

        <div className="card bg-gradient-to-br from-blue-500 to-blue-600 text-white">
          <p className="text-blue-100 text-sm mb-2">Unspent Outputs (UTXOs)</p>
          <p className="text-5xl font-bold">{utxos.length}</p>
          <p className="text-blue-100 text-sm mt-2">Available for spending</p>
        </div>
      </div>

      <div className="card mb-6">
        <h2 className="text-xl font-bold mb-4">Wallet Information</h2>
        
        <div className="space-y-4">
          <div>
            <p className="text-sm text-gray-600 mb-1">Wallet ID</p>
            <div className="flex items-center gap-2">
              <p className="font-mono text-sm bg-gray-100 p-2 rounded flex-1 break-all">
                {user?.wallet_id}
              </p>
              <button
                onClick={() => copyToClipboard(user?.wallet_id || '', 'Wallet ID')}
                className="btn btn-secondary btn-sm"
              >
                📋 Copy
              </button>
            </div>
          </div>

          <div>
            <p className="text-sm text-gray-600 mb-1">Public Key</p>
            <div className="flex items-center gap-2">
              <textarea
                readOnly
                value={user?.public_key}
                className="font-mono text-xs bg-gray-100 p-2 rounded flex-1 h-24 resize-none"
              />
              <button
                onClick={() => copyToClipboard(user?.public_key || '', 'Public Key')}
                className="btn btn-secondary btn-sm"
              >
                📋 Copy
              </button>
            </div>
          </div>
        </div>
      </div>

      {utxos.length > 0 && (
        <div className="card">
          <h2 className="text-xl font-bold mb-4">Unspent Transaction Outputs (UTXOs)</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4">Amount</th>
                  <th className="text-left py-3 px-4">Transaction Hash</th>
                  <th className="text-left py-3 px-4">Output Index</th>
                  <th className="text-left py-3 px-4">Created</th>
                </tr>
              </thead>
              <tbody>
                {utxos.map((utxo: any, index: number) => (
                  <tr key={index} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4 font-bold text-green-600">
                      {parseFloat(utxo.amount).toFixed(2)} Coins
                    </td>
                    <td className="py-3 px-4 font-mono text-xs">
                      {utxo.transaction_hash.substring(0, 16)}...
                    </td>
                    <td className="py-3 px-4">{utxo.output_index}</td>
                    <td className="py-3 px-4 text-sm text-gray-600">
                      {new Date(utxo.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
