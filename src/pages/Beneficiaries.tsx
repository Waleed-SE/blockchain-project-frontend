import { useState, useEffect } from 'react';
import { beneficiaryAPI, walletAPI } from '../services/api';

export default function Beneficiaries() {
  const [beneficiaries, setBeneficiaries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    beneficiary_wallet_id: '',
    nickname: ''
  });
  const [validatingWallet, setValidatingWallet] = useState(false);
  const [walletValid, setWalletValid] = useState<boolean | null>(null);

  useEffect(() => {
    fetchBeneficiaries();
  }, []);

  const fetchBeneficiaries = async () => {
    try {
      setLoading(true);
      const response = await beneficiaryAPI.getAll();
      setBeneficiaries(response.data.data || []);
      setError('');
    } catch (err: any) {
      setError('Failed to load beneficiaries');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const validateWalletId = async (walletId: string) => {
    if (!walletId || walletId.length < 10) {
      setWalletValid(null);
      return;
    }

    try {
      setValidatingWallet(true);
      await walletAPI.getWallet(walletId);
      setWalletValid(true);
    } catch (err) {
      setWalletValid(false);
    } finally {
      setValidatingWallet(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    
    if (name === 'beneficiary_wallet_id') {
      setWalletValid(null);
      if (value.length >= 10) {
        validateWalletId(value);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!walletValid) {
      setError('Please enter a valid wallet ID');
      return;
    }

    try {
      await beneficiaryAPI.add(formData);
      setSuccess('Beneficiary added successfully!');
      setFormData({ beneficiary_wallet_id: '', nickname: '' });
      setShowAddForm(false);
      setWalletValid(null);
      fetchBeneficiaries();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to add beneficiary');
    }
  };

  const handleDelete = async (id: string, nickname: string) => {
    if (!confirm(`Are you sure you want to remove ${nickname || 'this beneficiary'}?`)) {
      return;
    }

    try {
      await beneficiaryAPI.delete(id);
      setSuccess('Beneficiary removed successfully!');
      fetchBeneficiaries();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to remove beneficiary');
    }
  };

  if (loading) {
    return (
      <div className="card text-center py-12">
        <div className="spinner mx-auto mb-4"></div>
        <p className="text-gray-600">Loading beneficiaries...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">👥 Beneficiaries</h1>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="btn btn-primary"
        >
          {showAddForm ? '✗ Cancel' : '➕ Add Beneficiary'}
        </button>
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

      {showAddForm && (
        <div className="card mb-6">
          <h2 className="text-xl font-bold mb-4">Add New Beneficiary</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Wallet ID <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  name="beneficiary_wallet_id"
                  value={formData.beneficiary_wallet_id}
                  onChange={handleChange}
                  placeholder="Enter beneficiary wallet ID"
                  className={`input-field pr-10 ${
                    walletValid === true ? 'border-green-500' :
                    walletValid === false ? 'border-red-500' : ''
                  }`}
                  required
                />
                {validatingWallet && (
                  <div className="absolute right-3 top-3">
                    <div className="spinner-small"></div>
                  </div>
                )}
                {walletValid === true && (
                  <div className="absolute right-3 top-3 text-green-500 text-xl">✓</div>
                )}
                {walletValid === false && (
                  <div className="absolute right-3 top-3 text-red-500 text-xl">✗</div>
                )}
              </div>
              {walletValid === false && (
                <p className="text-red-500 text-sm mt-1">Invalid wallet ID</p>
              )}
              {walletValid === true && (
                <p className="text-green-500 text-sm mt-1">Wallet ID verified</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nickname (Optional)
              </label>
              <input
                type="text"
                name="nickname"
                value={formData.nickname}
                onChange={handleChange}
                placeholder="Enter a friendly name"
                className="input-field"
              />
            </div>

            <div className="flex gap-3">
              <button
                type="submit"
                disabled={!walletValid || validatingWallet}
                className="btn btn-primary disabled:opacity-50"
              >
                ➕ Add Beneficiary
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowAddForm(false);
                  setFormData({ beneficiary_wallet_id: '', nickname: '' });
                  setWalletValid(null);
                }}
                className="btn btn-secondary"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {beneficiaries.length === 0 ? (
        <div className="card text-center py-12">
          <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">No Beneficiaries Yet</h3>
          <p className="text-gray-600 mb-4">Add beneficiary wallets for quick access when sending money.</p>
          <button
            onClick={() => setShowAddForm(true)}
            className="btn btn-primary"
          >
            ➕ Add Your First Beneficiary
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {beneficiaries.map((beneficiary: any) => (
            <div key={beneficiary.id} className="card hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center text-white text-xl font-bold mr-3">
                    {beneficiary.nickname?.charAt(0).toUpperCase() || '👤'}
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">
                      {beneficiary.nickname || 'Unnamed'}
                    </h3>
                    <p className="text-xs text-gray-500">
                      Added {new Date(beneficiary.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>

              <div className="mb-3">
                <p className="text-xs text-gray-600 mb-1">Wallet ID</p>
                <p className="font-mono text-xs bg-gray-100 p-2 rounded break-all">
                  {beneficiary.beneficiary_wallet_id}
                </p>
              </div>

              <button
                onClick={() => handleDelete(beneficiary.id, beneficiary.nickname)}
                className="btn bg-red-100 text-red-600 hover:bg-red-200 w-full"
              >
                🗑️ Remove
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
