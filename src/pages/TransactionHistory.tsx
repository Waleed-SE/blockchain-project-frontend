import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { walletAPI, transactionAPI } from '../services/api';

export default function TransactionHistory() {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<any[]>([]);
  const [pendingTransactions, setPendingTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState<'all' | 'sent' | 'received' | 'pending'>('all');
  const [selectedTx, setSelectedTx] = useState<any>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const limit = 20;

  useEffect(() => {
    fetchTransactions();
  }, [page]);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      if (!user?.wallet_id) return;

      const offset = (page - 1) * limit;
      const [confirmedRes, pendingRes] = await Promise.all([
        walletAPI.getTransactions(user.wallet_id, limit, offset),
        transactionAPI.getPending().catch(() => ({ data: { data: [] } })),
      ]);
      
      const txList = confirmedRes.data.data || [];
      const pendingList = (pendingRes.data.data || []).filter((tx: any) => 
        tx.sender_wallet_id === user.wallet_id || tx.receiver_wallet_id === user.wallet_id
      );
      
      setTransactions(txList);
      setPendingTransactions(pendingList);
      setHasMore(txList.length === limit);
      setError('');
    } catch (err: any) {
      setError('Failed to load transactions');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filteredTransactions = [
    ...pendingTransactions.map(tx => ({ ...tx, isPending: true })),
    ...transactions
  ].filter((tx) => {
    if (filter === 'pending') return tx.isPending;
    if (filter === 'sent') return tx.sender_wallet_id === user?.wallet_id;
    if (filter === 'received') return tx.receiver_wallet_id === user?.wallet_id;
    return true;
  });

  const getTransactionType = (tx: any) => {
    if (tx.sender_wallet_id === user?.wallet_id) return 'sent';
    if (tx.recipient_wallet_id === user?.wallet_id) return 'received';
    return 'unknown';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const openTxDetails = (tx: any) => {
    setSelectedTx(tx);
  };

  const closeTxDetails = () => {
    setSelectedTx(null);
  };

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">📜 Transaction History</h1>

      <div className="card mb-6">
        <div className="flex flex-wrap gap-3 mb-4">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === 'all'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            All Transactions
          </button>
          <button
            onClick={() => setFilter('pending')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === 'pending'
                ? 'bg-yellow-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Pending ({pendingTransactions.length})
          </button>
          <button
            onClick={() => setFilter('sent')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === 'sent'
                ? 'bg-red-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Sent
          </button>
          <button
            onClick={() => setFilter('received')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === 'received'
                ? 'bg-green-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Received
          </button>
        </div>

        <p className="text-sm text-gray-600">
          Showing {filteredTransactions.length} transaction{filteredTransactions.length !== 1 ? 's' : ''}
        </p>
      </div>

      {error && (
        <div className="alert alert-error mb-6">
          <svg className="w-5 h-5 inline mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
          {error}
        </div>
      )}

      {loading ? (
        <div className="card text-center py-12">
          <div className="spinner mx-auto mb-4"></div>
          <p className="text-gray-600">Loading transactions...</p>
        </div>
      ) : filteredTransactions.length === 0 ? (
        <div className="card text-center py-12">
          <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">No Transactions Yet</h3>
          <p className="text-gray-600">Your transaction history will appear here once you start sending or receiving money.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredTransactions.map((tx: any, index: number) => {
            const type = getTransactionType(tx);
            const isSent = type === 'sent';
            const isReceived = type === 'received';

            return (
              <div 
                key={tx.transaction_hash || tx.tx_hash || index} 
                className="card hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => openTxDetails(tx)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center flex-1">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center mr-4 ${
                      tx.isPending ? 'bg-yellow-100' : isSent ? 'bg-red-100' : 'bg-green-100'
                    }`}>
                      {tx.isPending ? (
                        <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      ) : isSent ? (
                        <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                        </svg>
                      ) : (
                        <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 17l-5-5m0 0l5-5m-5 5h12" />
                        </svg>
                      )}
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        {tx.isPending && (
                          <span className="px-2 py-0.5 text-xs font-semibold rounded bg-yellow-100 text-yellow-800">
                            PENDING
                          </span>
                        )}
                        <span className={`px-2 py-0.5 text-xs font-semibold rounded ${
                          isSent ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                        }`}>
                          {isSent ? 'SENT' : 'RECEIVED'}
                        </span>
                      </div>

                      <p className="font-medium text-gray-900">
                        {isSent ? 'To: ' : 'From: '}
                        <span className="font-mono text-sm">
                          {(isSent ? tx.receiver_wallet_id : tx.sender_wallet_id)?.substring(0, 16)}...
                        </span>
                      </p>

                      {tx.note && (
                        <p className="text-sm text-gray-600 mt-1">{tx.note}</p>
                      )}

                      <p className="text-xs text-gray-500 mt-1">
                        {formatDate(tx.created_at)}
                      </p>

                      <p className="text-xs text-gray-400 font-mono mt-1">
                        Tx: {(tx.transaction_hash || tx.tx_hash)?.substring(0, 32)}...
                      </p>
                    </div>
                  </div>

                  <div className="text-right ml-4">
                    <p className={`text-2xl font-bold ${
                      isSent ? 'text-red-600' : 'text-green-600'
                    }`}>
                      {isSent ? '-' : '+'}{parseFloat(tx.amount).toFixed(2)}
                    </p>
                    <p className="text-sm text-gray-500">BCW</p>
                    {tx.block_index !== null && tx.block_index !== undefined && (
                      <p className="text-xs text-gray-400 mt-1">Block #{tx.block_index}</p>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {!loading && filteredTransactions.length > 0 && (
        <div className="flex justify-center gap-4 mt-6">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="btn btn-secondary disabled:opacity-50"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Previous
          </button>

          <span className="flex items-center px-4 py-2 text-gray-700 font-medium">
            Page {page}
          </span>

          <button
            onClick={() => setPage(p => p + 1)}
            disabled={!hasMore}
            className="btn btn-secondary disabled:opacity-50"
          >
            Next
            <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      )}

      {/* Transaction Details Modal */}
      {selectedTx && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={closeTxDetails}>
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Transaction Details</h2>
                <button onClick={closeTxDetails} className="text-gray-400 hover:text-gray-600">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-4">
                {/* Status Badge */}
                <div className="flex items-center gap-3">
                  {selectedTx.isPending ? (
                    <span className="px-4 py-2 bg-yellow-100 text-yellow-800 rounded-lg font-semibold text-lg">
                      ⏳ Pending
                    </span>
                  ) : (
                    <span className="px-4 py-2 bg-green-100 text-green-800 rounded-lg font-semibold text-lg">
                      ✅ Confirmed
                    </span>
                  )}
                  {selectedTx.sender_wallet_id === user?.wallet_id ? (
                    <span className="px-3 py-1 bg-red-100 text-red-800 rounded-lg font-medium">📤 Sent</span>
                  ) : (
                    <span className="px-3 py-1 bg-green-100 text-green-800 rounded-lg font-medium">📥 Received</span>
                  )}
                </div>

                {/* Amount */}
                <div className="bg-gray-50 p-6 rounded-lg">
                  <p className="text-sm text-gray-600 mb-2">Amount</p>
                  <p className={`text-4xl font-bold ${
                    selectedTx.sender_wallet_id === user?.wallet_id ? 'text-red-600' : 'text-green-600'
                  }`}>
                    {selectedTx.sender_wallet_id === user?.wallet_id ? '-' : '+'}{parseFloat(selectedTx.amount).toFixed(8)} BCW
                  </p>
                </div>

                {/* Transaction Hash */}
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-2">Transaction Hash</p>
                  <p className="bg-gray-50 p-3 rounded font-mono text-sm break-all">
                    {selectedTx.transaction_hash || selectedTx.tx_hash}
                  </p>
                </div>

                {/* Sender */}
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-2">From</p>
                  <p className="bg-gray-50 p-3 rounded font-mono text-sm break-all">
                    {selectedTx.sender_wallet_id}
                  </p>
                </div>

                {/* Receiver */}
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-2">To</p>
                  <p className="bg-gray-50 p-3 rounded font-mono text-sm break-all">
                    {selectedTx.receiver_wallet_id}
                  </p>
                </div>

                {/* Note */}
                {selectedTx.note && (
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-2">Note</p>
                    <p className="bg-gray-50 p-3 rounded text-sm">
                      {selectedTx.note}
                    </p>
                  </div>
                )}

                {/* Block Info */}
                {!selectedTx.isPending && selectedTx.block_index !== null && selectedTx.block_index !== undefined && (
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-2">Block Number</p>
                    <p className="bg-gray-50 p-3 rounded font-mono text-sm">
                      #{selectedTx.block_index}
                    </p>
                  </div>
                )}

                {/* Timestamp */}
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-2">
                    {selectedTx.isPending ? 'Created At' : 'Confirmed At'}
                  </p>
                  <p className="bg-gray-50 p-3 rounded text-sm">
                    {formatDate(selectedTx.created_at)}
                  </p>
                </div>

                {/* Signature */}
                {selectedTx.signature && (
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-2">Signature</p>
                    <p className="bg-gray-50 p-3 rounded font-mono text-xs break-all text-gray-600">
                      {selectedTx.signature}
                    </p>
                  </div>
                )}
              </div>

              <div className="mt-6 flex justify-end">
                <button onClick={closeTxDetails} className="btn-primary">
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
