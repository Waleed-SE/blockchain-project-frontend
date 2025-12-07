import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { walletAPI, blockchainAPI } from '../services/api';

export default function Dashboard() {
  const { user } = useAuth();
  const [balance, setBalance] = useState<any>(null);
  const [blockchainInfo, setBlockchainInfo] = useState<any>(null);
  const [miningStats, setMiningStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [user]);

  const loadData = async () => {
    try {
      if (user?.wallet_id) {
        const [balanceRes, infoRes, statsRes] = await Promise.all([
          walletAPI.getBalance(user.wallet_id).catch(err => {
            console.warn('Failed to load balance:', err.response?.data?.message || err.message);
            return { data: { data: { balance: 0, utxo_count: 0, wallet_id: user.wallet_id } } };
          }),
          blockchainAPI.getInfo().catch(err => {
            console.warn('Failed to load blockchain info:', err.response?.data?.message || err.message);
            return { data: { data: { total_blocks: 0, total_transactions: 0, total_wallets: 0 } } };
          }),
          blockchainAPI.getMiningStats().catch(err => {
            console.warn('Failed to load mining stats:', err.response?.data?.message || err.message);
            return { data: { data: null } };
          }),
        ]);
        setBalance(balanceRes.data.data);
        setBlockchainInfo(infoRes.data.data);
        setMiningStats(statsRes.data.data);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="spinner mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">Welcome back, {user?.full_name || user?.email}! 👋</p>
        </div>
      </div>

      {/* Balance Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="stat-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm font-medium mb-2">Wallet Balance</p>
              <p className="text-3xl font-bold">
                {balance?.balance?.toFixed(8) || '0.00000000'}
              </p>
              <p className="text-blue-100 text-sm mt-2">
                BCW • {balance?.utxo_count || 0} UTXOs
              </p>
            </div>
            <div className="text-5xl opacity-20">💰</div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 text-white rounded-lg p-6 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm font-medium mb-2">Total Blocks</p>
              <p className="text-3xl font-bold">
                {blockchainInfo?.total_blocks || 0}
              </p>
              <p className="text-green-100 text-sm mt-2">On blockchain</p>
            </div>
            <div className="text-5xl opacity-20">⛓️</div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-lg p-6 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm font-medium mb-2">Pending TXs</p>
              <p className="text-3xl font-bold">
                {blockchainInfo?.pending_transactions || 0}
              </p>
              <p className="text-purple-100 text-sm mt-2">Awaiting mining</p>
            </div>
            <div className="text-5xl opacity-20">⏳</div>
          </div>
        </div>
      </div>

      {/* Mining Statistics */}
      {miningStats && (
        <div className="card bg-gradient-to-br from-amber-50 to-orange-50 border-2 border-amber-200">
          <div className="flex items-center mb-6">
            <div className="h-12 w-12 bg-amber-500 rounded-full flex items-center justify-center mr-3">
              <svg className="h-7 w-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Mining Statistics</h2>
              <p className="text-sm text-gray-600">Network supply and halving information</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-lg p-4 shadow-sm border border-amber-100">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-600">Current Reward</span>
                <span className="text-2xl">💰</span>
              </div>
              <p className="text-2xl font-bold text-amber-600">
                {miningStats.current_block_reward.toFixed(2)}
              </p>
              <p className="text-xs text-gray-500 mt-1">coins per block</p>
            </div>

            <div className="bg-white rounded-lg p-4 shadow-sm border border-amber-100">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-600">Next Halving</span>
                <span className="text-2xl">⏰</span>
              </div>
              <p className="text-2xl font-bold text-orange-600">
                {miningStats.blocks_until_halving}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                blocks (at block #{miningStats.next_halving_block})
              </p>
            </div>

            <div className="bg-white rounded-lg p-4 shadow-sm border border-amber-100">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-600">Total Mined</span>
                <span className="text-2xl">⛏️</span>
              </div>
              <p className="text-2xl font-bold text-green-600">
                {miningStats.total_mined_coins.toLocaleString()}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {miningStats.percentage_mined.toFixed(2)}% of max supply
              </p>
            </div>

            <div className="bg-white rounded-lg p-4 shadow-sm border border-amber-100">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-600">Remaining</span>
                <span className="text-2xl">🪙</span>
              </div>
              <p className="text-2xl font-bold text-blue-600">
                {miningStats.remaining_coins.toLocaleString()}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                of {miningStats.max_coin_supply.toLocaleString()} max
              </p>
            </div>
          </div>

          {/* Supply Progress Bar */}
          <div className="bg-white rounded-lg p-4 shadow-sm border border-amber-100">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-gray-700">Supply Progress</span>
              <span className="text-sm font-bold text-amber-600">
                {miningStats.percentage_mined.toFixed(2)}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
              <div
                className="bg-gradient-to-r from-amber-500 to-orange-500 h-4 rounded-full transition-all duration-500 flex items-center justify-end pr-2"
                style={{ width: `${Math.min(miningStats.percentage_mined, 100)}%` }}
              >
                {miningStats.percentage_mined > 5 && (
                  <span className="text-xs text-white font-bold">
                    {miningStats.percentage_mined.toFixed(1)}%
                  </span>
                )}
              </div>
            </div>
            <div className="flex justify-between mt-2 text-xs text-gray-500">
              <span>0</span>
              <span className="font-medium">Block Height: {miningStats.current_block_height}</span>
              <span>{miningStats.max_coin_supply.toLocaleString()}</span>
            </div>
          </div>

          {/* Halving Info */}
          <div className="mt-4 p-4 bg-amber-100 rounded-lg border border-amber-200">
            <div className="flex items-start">
              <svg className="h-5 w-5 text-amber-600 mt-0.5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              <div className="flex-1">
                <p className="text-sm font-medium text-amber-900">Halving Mechanism</p>
                <p className="text-xs text-amber-700 mt-1">
                  Mining rewards are halved every {miningStats.halving_interval} blocks. 
                  After the next halving at block #{miningStats.next_halving_block}, 
                  the reward will drop to {(miningStats.current_block_reward / 2).toFixed(2)} coins per block.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Wallet Info */}
      <div className="card">
        <div className="flex items-center mb-4">
          <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center mr-3">
            <svg className="h-6 w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-900">Your Wallet Details</h2>
        </div>
        <div className="space-y-3">
          <div className="p-4 bg-gray-50 rounded-lg">
            <span className="text-sm font-medium text-gray-500">Wallet ID:</span>
            <p className="font-mono text-sm text-gray-900 break-all mt-1">{user?.wallet_id}</p>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg">
            <span className="text-sm font-medium text-gray-500">Email:</span>
            <p className="text-gray-900 mt-1">{user?.email}</p>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <a href="/send" className="card hover:shadow-xl transition-all duration-200 hover:scale-105 cursor-pointer border-2 border-transparent hover:border-blue-500">
            <div className="text-center">
              <div className="mx-auto h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center mb-3">
                <svg className="h-6 w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </div>
              <h3 className="font-bold text-gray-900">Send Money</h3>
              <p className="text-sm text-gray-500 mt-1">Transfer funds to another wallet</p>
            </div>
          </a>
          <a href="/history" className="card hover:shadow-xl transition-all duration-200 hover:scale-105 cursor-pointer border-2 border-transparent hover:border-green-500">
            <div className="text-center">
              <div className="mx-auto h-12 w-12 bg-green-100 rounded-full flex items-center justify-center mb-3">
                <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <h3 className="font-bold text-gray-900">Transaction History</h3>
              <p className="text-sm text-gray-500 mt-1">View all your transactions</p>
            </div>
          </a>
          <a href="/blocks" className="card hover:shadow-xl transition-all duration-200 hover:scale-105 cursor-pointer border-2 border-transparent hover:border-purple-500">
            <div className="text-center">
              <div className="mx-auto h-12 w-12 bg-purple-100 rounded-full flex items-center justify-center mb-3">
                <svg className="h-6 w-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <h3 className="font-bold text-gray-900">Block Explorer</h3>
              <p className="text-sm text-gray-500 mt-1">Explore the blockchain</p>
            </div>
          </a>
        </div>
      </div>
    </div>
  );
}
