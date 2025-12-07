import { useState } from 'react';
import { blockchainAPI } from '../services/api';

export default function ChainValidation() {
  const [validating, setValidating] = useState(false);
  const [validationResult, setValidationResult] = useState<{
    isValid: boolean;
    message: string;
    timestamp?: string;
  } | null>(null);
  const [blockchainInfo, setBlockchainInfo] = useState<any>(null);

  const validateBlockchain = async () => {
    try {
      setValidating(true);
      setValidationResult(null);
      
      const [validationRes, infoRes] = await Promise.all([
        blockchainAPI.validate(),
        blockchainAPI.getInfo(),
      ]);
      
      const isValid = validationRes.data.data.is_valid;
      setValidationResult({
        isValid,
        message: validationRes.data.message || 
          (isValid 
            ? '✅ Blockchain is valid! All blocks verified successfully.' 
            : '❌ Blockchain validation failed! Some blocks may be corrupted.'),
        timestamp: new Date().toLocaleString(),
      });
      
      setBlockchainInfo(infoRes.data.data);
    } catch (err: any) {
      setValidationResult({
        isValid: false,
        message: '❌ Validation error: ' + (err.response?.data?.message || 'Unknown error'),
        timestamp: new Date().toLocaleString(),
      });
    } finally {
      setValidating(false);
    }
  };

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">🔒 Blockchain Validation</h1>

      <div className="card max-w-3xl mx-auto mb-6">
        <div className="text-center">
          <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
          
          <h2 className="text-2xl font-bold mb-4">Validate Blockchain Integrity</h2>
          <p className="text-gray-600 mb-6">
            Run a comprehensive validation check to ensure all blocks in the chain are valid and properly linked.
            This process verifies hashes, previous block references, and the proof-of-work for each block.
          </p>

          <button
            onClick={validateBlockchain}
            disabled={validating}
            className="btn btn-primary text-lg px-8 py-3"
          >
            {validating ? (
              <>
                <div className="spinner-small mr-2"></div>
                Validating Blockchain...
              </>
            ) : (
              <>
                <svg className="w-6 h-6 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Start Validation
              </>
            )}
          </button>
        </div>
      </div>

      {validationResult && (
        <div className="space-y-6">
          <div className={`card ${validationResult.isValid ? 'border-green-500 border-2' : 'border-red-500 border-2'}`}>
            <div className="flex items-start">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center mr-4 ${
                validationResult.isValid ? 'bg-green-100' : 'bg-red-100'
              }`}>
                {validationResult.isValid ? (
                  <svg className="w-6 h-6 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <svg className="w-6 h-6 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                )}
              </div>
              <div className="flex-1">
                <h3 className={`text-xl font-bold mb-2 ${validationResult.isValid ? 'text-green-700' : 'text-red-700'}`}>
                  {validationResult.isValid ? 'Validation Successful' : 'Validation Failed'}
                </h3>
                <p className="text-gray-700 mb-2">{validationResult.message}</p>
                <p className="text-sm text-gray-500">Validated at: {validationResult.timestamp}</p>
              </div>
            </div>
          </div>

          {blockchainInfo && (
            <div className="card">
              <h3 className="text-xl font-bold mb-4">📊 Blockchain Statistics</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <p className="text-sm text-gray-600 mb-1">Total Blocks</p>
                  <p className="text-3xl font-bold text-blue-600">{blockchainInfo.total_blocks || 0}</p>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                  <p className="text-sm text-gray-600 mb-1">Total Transactions</p>
                  <p className="text-3xl font-bold text-purple-600">{blockchainInfo.total_transactions || 0}</p>
                </div>
                <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                  <p className="text-sm text-gray-600 mb-1">Active Wallets</p>
                  <p className="text-3xl font-bold text-green-600">{blockchainInfo.total_wallets || 0}</p>
                </div>
                <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
                  <p className="text-sm text-gray-600 mb-1">Mining Difficulty</p>
                  <p className="text-3xl font-bold text-amber-600">{blockchainInfo.mining_difficulty || 0}</p>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
                  <p className="text-sm text-gray-600 mb-1">Current Block Reward</p>
                  <p className="text-2xl font-bold text-orange-600">{blockchainInfo.current_block_reward?.toFixed(2) || '0'} BCW</p>
                </div>
                <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-200">
                  <p className="text-sm text-gray-600 mb-1">Pending Transactions</p>
                  <p className="text-2xl font-bold text-indigo-600">{blockchainInfo.pending_transactions || 0}</p>
                </div>
              </div>

              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <h4 className="font-semibold text-gray-800 mb-3">What gets validated:</h4>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li className="flex items-start">
                    <svg className="w-5 h-5 text-green-600 mr-2 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span><strong>Block Hash Integrity:</strong> Each block's hash matches its content</span>
                  </li>
                  <li className="flex items-start">
                    <svg className="w-5 h-5 text-green-600 mr-2 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span><strong>Chain Linkage:</strong> Previous hash references are correct</span>
                  </li>
                  <li className="flex items-start">
                    <svg className="w-5 h-5 text-green-600 mr-2 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span><strong>Proof of Work:</strong> Block hashes meet difficulty requirements</span>
                  </li>
                  <li className="flex items-start">
                    <svg className="w-5 h-5 text-green-600 mr-2 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span><strong>Genesis Block:</strong> First block is valid and unchanged</span>
                  </li>
                  <li className="flex items-start">
                    <svg className="w-5 h-5 text-green-600 mr-2 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span><strong>Sequential Order:</strong> Block indices are properly ordered</span>
                  </li>
                </ul>
              </div>
            </div>
          )}
        </div>
      )}

      {!validationResult && !validating && (
        <div className="card max-w-3xl mx-auto">
          <h3 className="text-xl font-bold mb-4">ℹ️ About Blockchain Validation</h3>
          <div className="space-y-4 text-gray-700">
            <p>
              Blockchain validation is a crucial process that ensures the integrity and immutability of the entire chain.
              It verifies that no blocks have been tampered with and that all cryptographic links are intact.
            </p>
            <p>
              <strong>Why validate?</strong> Regular validation helps detect any inconsistencies, corruption, or
              malicious attempts to alter the blockchain. A valid chain means all transactions are trustworthy.
            </p>
            <p>
              <strong>How it works:</strong> The validator checks each block sequentially, verifying hashes,
              previous block references, and proof-of-work calculations. Any mismatch indicates tampering.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
