import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { walletAPI, transactionAPI, beneficiaryAPI, blockchainAPI } from '../services/api';

export default function SendMoney() {
  const { user } = useAuth();
  const [wallet, setWallet] = useState<any>(null);
  const [balance, setBalance] = useState<number>(0);
  const [transactionFee, setTransactionFee] = useState<number>(0.1);
  const [beneficiaries, setBeneficiaries] = useState<any[]>([]);
  const [showBeneficiaries, setShowBeneficiaries] = useState(false);
  const [formData, setFormData] = useState({
    recipientWalletId: '',
    amount: '',
    description: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchWalletData();
    fetchBeneficiaries();
    fetchBlockchainInfo();
  }, []);

  const fetchBlockchainInfo = async () => {
    try {
      const response = await blockchainAPI.getInfo();
      setTransactionFee(response.data.data.transaction_fee);
    } catch (err: any) {
      console.error('Error fetching blockchain info:', err);
    }
  };

  const fetchWalletData = async () => {
    try {
      if (!user?.wallet_id) return;
      
      const [walletRes, balanceRes] = await Promise.all([
        walletAPI.getWallet(user.wallet_id),
        walletAPI.getBalance(user.wallet_id),
      ]);
      
      setWallet(walletRes.data.data);
      setBalance(balanceRes.data.data.balance);
    } catch (err: any) {
      console.error('Error fetching wallet:', err);
    }
  };

  const fetchBeneficiaries = async () => {
    try {
      const response = await beneficiaryAPI.getAll();
      setBeneficiaries(response.data.data || []);
    } catch (err: any) {
      console.error('Error fetching beneficiaries:', err);
    }
  };

  const selectBeneficiary = (beneficiary: any) => {
    setFormData({
      ...formData,
      recipientWalletId: beneficiary.beneficiary_wallet_id,
    });
    setShowBeneficiaries(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!formData.recipientWalletId || !formData.amount) {
      setError('Please fill in all required fields');
      return;
    }

    const amount = parseFloat(formData.amount);
    if (isNaN(amount) || amount <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    const totalRequired = amount + transactionFee;
    if (totalRequired > balance) {
      setError(`Insufficient balance. You need ${totalRequired.toFixed(2)} coins (${amount.toFixed(2)} + ${transactionFee.toFixed(2)} fee) but have ${balance.toFixed(2)} coins`);
      return;
    }

    setLoading(true);

    try {
      const payload = {
        sender_wallet_id: user?.wallet_id,
        receiver_wallet_id: formData.recipientWalletId,
        amount: amount,
        note: formData.description || null,
      };

      await transactionAPI.create(payload);
      setSuccess(`Transaction successful! Sent ${amount} coins to ${formData.recipientWalletId.substring(0, 8)}...`);
      setFormData({ recipientWalletId: '', amount: '', description: '' });
      
      // Refresh balance
      setTimeout(() => {
        fetchWalletData();
      }, 1000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Transaction failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">💸 Send Money</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="card bg-gradient-to-br from-green-500 to-green-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm">Available Balance</p>
              <p className="text-3xl font-bold mt-1">{balance.toFixed(2)}</p>
              <p className="text-sm text-green-100 mt-1">Coins</p>
            </div>
            <svg className="w-12 h-12 text-green-200" fill="currentColor" viewBox="0 0 20 20">
              <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd" />
            </svg>
          </div>
        </div>

        <div className="card bg-gradient-to-br from-blue-500 to-blue-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm">Your Wallet ID</p>
              <p className="text-lg font-mono mt-1">{wallet?.wallet_id?.substring(0, 16)}...</p>
              <button 
                onClick={() => navigator.clipboard.writeText(wallet?.wallet_id || '')}
                className="text-xs text-blue-100 hover:text-white mt-2 flex items-center"
              >
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                Copy Full ID
              </button>
            </div>
          </div>
        </div>

        <div className="card bg-gradient-to-br from-purple-500 to-purple-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm">Transaction Fee</p>
              <p className="text-3xl font-bold mt-1">{transactionFee.toFixed(2)}</p>
              <p className="text-sm text-purple-100 mt-1">Coins per transaction</p>
            </div>
            <svg className="w-12 h-12 text-purple-200" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
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

      <div className="card max-w-2xl">
        <h2 className="text-xl font-bold mb-6 flex items-center">
          <svg className="w-6 h-6 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Send Transaction
        </h2>

        {beneficiaries.length > 0 && (
          <div className="mb-6">
            <button
              type="button"
              onClick={() => setShowBeneficiaries(!showBeneficiaries)}
              className="btn btn-secondary w-full flex items-center justify-center"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              {showBeneficiaries ? 'Hide' : 'Select from'} Beneficiaries ({beneficiaries.length})
            </button>

            {showBeneficiaries && (
              <div className="mt-4 space-y-2 max-h-60 overflow-y-auto">
                {beneficiaries.map((beneficiary: any) => (
                  <button
                    key={beneficiary.id}
                    type="button"
                    onClick={() => selectBeneficiary(beneficiary)}
                    className="w-full p-3 bg-gray-50 hover:bg-gray-100 rounded-lg text-left transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold mr-3">
                          {beneficiary.nickname?.charAt(0).toUpperCase() || '👤'}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">
                            {beneficiary.nickname || 'Unnamed'}
                          </p>
                          <p className="text-xs text-gray-500 font-mono">
                            {beneficiary.beneficiary_wallet_id.substring(0, 16)}...
                          </p>
                        </div>
                      </div>
                      <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="label">
              Recipient Wallet ID *
            </label>
            <input
              type="text"
              value={formData.recipientWalletId}
              onChange={(e) => setFormData({ ...formData, recipientWalletId: e.target.value })}
              className="input"
              placeholder="Enter recipient's wallet ID"
              required
              disabled={loading}
            />
            <p className="text-xs text-gray-500 mt-1">The wallet ID of the person you want to send money to</p>
          </div>

          <div>
            <label className="label">
              Amount (Coins) *
            </label>
            <div className="relative">
              <input
                type="number"
                step="0.01"
                min="0.01"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                className="input pr-20"
                placeholder="0.00"
                required
                disabled={loading}
              />
              <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 font-semibold">
                COINS
              </span>
            </div>
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>Available: {balance.toFixed(2)} coins</span>
              <span>Fee: {transactionFee.toFixed(2)} coins</span>
            </div>
            {formData.amount && (
              <p className="text-sm font-semibold text-indigo-600 mt-2">
                Total: {(parseFloat(formData.amount) + transactionFee).toFixed(2)} coins
              </p>
            )}
          </div>

          <div>
            <label className="label">
              Description (Optional)
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="input min-h-24"
              placeholder="Add a note for this transaction..."
              disabled={loading}
              rows={3}
            />
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-start">
              <svg className="w-5 h-5 text-yellow-600 mt-0.5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <div>
                <p className="text-sm font-semibold text-yellow-800">Important</p>
                <p className="text-xs text-yellow-700 mt-1">
                  • Transactions are irreversible once confirmed<br />
                  • A 2.5% Zakat fee will be automatically deducted monthly<br />
                  • Verify the recipient's wallet ID before sending
                </p>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || !formData.recipientWalletId || !formData.amount}
            className="w-full btn btn-success py-3 text-lg flex items-center justify-center"
          >
            {loading ? (
              <>
                <div className="spinner mr-2"></div>
                Processing Transaction...
              </>
            ) : (
              <>
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
                Send Money
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
