import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { blockchainAPI } from '../services/api';

export default function BlockExplorer() {
  const [blocks, setBlocks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [validating, setValidating] = useState(false);
  const [validationResult, setValidationResult] = useState<{ isValid: boolean; message: string } | null>(null);
  const limit = 20;

  useEffect(() => {
    fetchBlocks();
  }, [page]);

  const fetchBlocks = async () => {
    try {
      setLoading(true);
      const offset = (page - 1) * limit;
      const response = await blockchainAPI.getBlocks(limit, offset);
      const blockList = response.data.data || [];
      
      setBlocks(blockList);
      setHasMore(blockList.length === limit);
      setError('');
    } catch (err: any) {
      setError('Failed to load blocks');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const validateBlockchain = async () => {
    try {
      setValidating(true);
      setValidationResult(null);
      const response = await blockchainAPI.validate();
      const isValid = response.data.data.is_valid;
      setValidationResult({
        isValid,
        message: isValid 
          ? '✅ Blockchain is valid! All blocks verified successfully.' 
          : '❌ Blockchain validation failed! Some blocks may be corrupted.',
      });
    } catch (err: any) {
      setValidationResult({
        isValid: false,
        message: '❌ Validation error: ' + (err.response?.data?.message || 'Unknown error'),
      });
    } finally {
      setValidating(false);
    }
  };

  const formatDate = (timestamp: number) => {
    // Unix timestamp is in seconds, convert to milliseconds for JavaScript Date
    return new Date(timestamp * 1000).toLocaleString();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">⛓️ Block Explorer</h1>
        <button
          onClick={validateBlockchain}
          disabled={validating}
          className="btn btn-primary flex items-center"
        >
          {validating ? (
            <>
              <div className="spinner-small mr-2"></div>
              Validating...
            </>
          ) : (
            <>
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              Validate Chain
            </>
          )}
        </button>
      </div>

      {validationResult && (
        <div className={`alert ${validationResult.isValid ? 'alert-success' : 'alert-error'} mb-6`}>
          <svg className="w-5 h-5 inline mr-2" fill="currentColor" viewBox="0 0 20 20">
            {validationResult.isValid ? (
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            ) : (
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            )}
          </svg>
          {validationResult.message}
        </div>
      )}

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
          <p className="text-gray-600">Loading blocks...</p>
        </div>
      ) : blocks.length === 0 ? (
        <div className="card text-center py-12">
          <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
          </svg>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">No Blocks Found</h3>
          <p className="text-gray-600">Start mining to create blocks.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {blocks.map((block: any) => (
            <Link
              key={block.index}
              to={`/block/${block.index}`}
              className="card hover:shadow-lg transition-shadow block"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center flex-1">
                  <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold text-xl mr-4">
                    #{block.index}
                  </div>

                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-gray-900 mb-1">Block {block.index}</h3>
                    <p className="text-sm text-gray-600 font-mono mb-1">
                      Hash: {block.hash?.substring(0, 32)}...
                    </p>
                    <p className="text-xs text-gray-500">
                      Mined: {formatDate(block.timestamp)}
                    </p>
                  </div>
                </div>

                <div className="text-right ml-4">
                  <div className="mb-2">
                    <p className="text-sm text-gray-600">Transactions</p>
                    <p className="text-2xl font-bold text-purple-600">{block.transactions?.length || 0}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Nonce: {block.nonce}</p>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {!loading && blocks.length > 0 && (
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
    </div>
  );
}
