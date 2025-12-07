import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { blockchainAPI, transactionAPI } from '../services/api';

export default function Mining() {
  const { user } = useAuth();
  const [mining, setMining] = useState(false);
  const [pendingTxCount, setPendingTxCount] = useState(0);
  const [blockchainInfo, setBlockchainInfo] = useState<any>(null);
  const [miningHistory, setMiningHistory] = useState<any[]>([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [infoRes, pendingRes] = await Promise.all([
        blockchainAPI.getInfo(),
        transactionAPI.getPending(),
      ]);
      
      setBlockchainInfo(infoRes.data.data);
      setPendingTxCount(pendingRes.data.data?.length || 0);
    } catch (err: any) {
      console.error('Error fetching data:', err);
    }
  };

  const handleMine = async () => {
    setError('');
    setSuccess('');
    setMining(true);

    try {
      const response = await blockchainAPI.mine();
      const minedBlock = response.data.data;
      
      // Get actual reward from blockchain info
      const blockReward = blockchainInfo?.current_block_reward || 50;
      setSuccess(`Block #${minedBlock.block_index} mined successfully! You earned ${blockReward.toFixed(2)} coins!`);
      setMiningHistory([minedBlock, ...miningHistory]);
      
      // Refresh data
      setTimeout(() => {
        fetchData();
      }, 1000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Mining failed');
    } finally {
      setMining(false);
    }
  };

  const formatDate = (timestamp: number) => {
    // Unix timestamp is in seconds, convert to milliseconds
    return new Date(timestamp * 1000).toLocaleString();
  };

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">⛏️ Mining Center</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="card bg-gradient-to-br from-purple-500 to-purple-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm">Total Blocks</p>
              <p className="text-4xl font-bold mt-2">{blockchainInfo?.total_blocks || 0}</p>
            </div>
            <svg className="w-12 h-12 text-purple-200" fill="currentColor" viewBox="0 0 20 20">
              <path d="M3 12v3c0 1.657 3.134 3 7 3s7-1.343 7-3v-3c0 1.657-3.134 3-7 3s-7-1.343-7-3z" />
              <path d="M3 7v3c0 1.657 3.134 3 7 3s7-1.343 7-3V7c0 1.657-3.134 3-7 3S3 8.657 3 7z" />
              <path d="M17 5c0 1.657-3.134 3-7 3S3 6.657 3 5s3.134-3 7-3 7 1.343 7 3z" />
            </svg>
          </div>
        </div>

        <div className="card bg-gradient-to-br from-yellow-500 to-yellow-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-yellow-100 text-sm">Pending Transactions</p>
              <p className="text-4xl font-bold mt-2">{pendingTxCount}</p>
            </div>
            <svg className="w-12 h-12 text-yellow-200" fill="currentColor" viewBox="0 0 20 20">
              <path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
              <path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 001-1V5a1 1 0 00-1-1H3zM14 7a1 1 0 00-1 1v6.05A2.5 2.5 0 0115.95 16H17a1 1 0 001-1v-5a1 1 0 00-.293-.707l-2-2A1 1 0 0015 7h-1z" />
            </svg>
          </div>
        </div>

        <div className="card bg-gradient-to-br from-green-500 to-green-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm">Block Reward</p>
              <p className="text-4xl font-bold mt-2">{blockchainInfo?.current_block_reward?.toFixed(2) || '50'}</p>
              <p className="text-sm text-green-100 mt-1">Coins per block</p>
            </div>
            <svg className="w-12 h-12 text-green-200" fill="currentColor" viewBox="0 0 20 20">
              <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd" />
            </svg>
          </div>
        </div>
      </div>

      {error && (
        <div className="alert alert-error mb-6">
          <svg className="w-5 h-5 inline mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
          {error}
        </div>
      )}

      {success && (
        <div className="alert alert-success mb-6">
          <svg className="w-5 h-5 inline mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          {success}
        </div>
      )}

      <div className="card mb-6">
        <h2 className="text-2xl font-bold mb-4">Mine New Block</h2>
        <p className="text-gray-600 mb-6">
          Mining creates new blocks and generates coins as rewards. Each mined block rewards the miner with {blockchainInfo?.current_block_reward?.toFixed(2) || '50'} coins.
          {pendingTxCount > 0 && ` There are currently ${pendingTxCount} pending transaction(s) waiting to be included in the next block.`}
        </p>

        <button
          onClick={handleMine}
          disabled={mining}
          className="w-full btn btn-success py-4 text-lg flex items-center justify-center"
        >
          {mining ? (
            <>
              <div className="spinner mr-3"></div>
              Mining in progress... (This may take a few seconds)
            </>
          ) : (
            <>
              <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              Start Mining
            </>
          )}
        </button>

        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start">
            <svg className="w-5 h-5 text-blue-600 mt-0.5 mr-3" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            <div>
              <p className="text-sm font-semibold text-blue-800 mb-1">How Mining Works</p>
              <p className="text-xs text-blue-700">
                • Mining validates pending transactions and adds them to the blockchain<br />
                • You earn {blockchainInfo?.current_block_reward?.toFixed(2) || '50'} coins for each successfully mined block<br />
                • Mining difficulty is set to {blockchainInfo?.mining_difficulty || '3'} leading zeros<br />
                • The system uses Proof-of-Work (PoW) consensus algorithm<br />
                • All transactions in the mined block are marked as confirmed
              </p>
            </div>
          </div>
        </div>
      </div>

      {miningHistory.length > 0 && (
        <div className="card">
          <h2 className="text-2xl font-bold mb-4">Recent Mining Activity</h2>
          <div className="space-y-3">
            {miningHistory.map((block: any, index: number) => (
              <div key={index} className="bg-green-50 border border-green-200 p-4 rounded-lg">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="px-2 py-1 bg-green-600 text-white text-xs font-semibold rounded">
                        MINED
                      </span>
                      <span className="text-sm font-bold">Block #{block.block_index}</span>
                    </div>
                    <p className="text-xs font-mono text-gray-600 break-all mb-1">
                      Hash: {block.hash}
                    </p>
                    <p className="text-xs text-gray-500">
                      {formatDate(block.timestamp)} • Nonce: {block.nonce}
                    </p>
                  </div>
                  <div className="text-right ml-4">
                    <p className="text-2xl font-bold text-green-600">+{blockchainInfo?.current_block_reward?.toFixed(2) || '50'}</p>
                    <p className="text-sm text-gray-600">Coins</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
