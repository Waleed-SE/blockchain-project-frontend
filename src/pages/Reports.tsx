import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { reportsAPI, zakatAPI } from '../services/api';

export default function Reports() {
  const { user } = useAuth();
  const [monthlyReport, setMonthlyReport] = useState<any>(null);
  const [zakatRecords, setZakatRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      if (!user?.wallet_id) return;
      const [monthlyRes, zakatRes] = await Promise.all([
        reportsAPI.getMonthly(user.wallet_id),
        zakatAPI.getRecords(user.wallet_id),
      ]);
      setMonthlyReport(monthlyRes.data.data);
      setZakatRecords(zakatRes.data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => new Date(dateString).toLocaleDateString();

  if (loading) return <div className="card text-center py-12"><div className="spinner mx-auto mb-4"></div><p className="text-gray-600">Loading reports...</p></div>;

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">📊 Reports & Analytics</h1>
      
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <div className="card bg-gradient-to-br from-blue-500 to-blue-600 text-white">
          <p className="text-blue-100 text-sm">Total Sent</p>
          <p className="text-3xl font-bold mt-2">{monthlyReport?.total_sent?.toFixed(2) || '0.00'}</p>
          <p className="text-sm text-blue-100 mt-1">Last 30 Days</p>
        </div>
        <div className="card bg-gradient-to-br from-green-500 to-green-600 text-white">
          <p className="text-green-100 text-sm">Total Received</p>
          <p className="text-3xl font-bold mt-2">{monthlyReport?.total_received?.toFixed(2) || '0.00'}</p>
          <p className="text-sm text-green-100 mt-1">Last 30 Days</p>
        </div>
        <div className="card bg-gradient-to-br from-purple-500 to-purple-600 text-white">
          <p className="text-purple-100 text-sm">Transactions</p>
          <p className="text-3xl font-bold mt-2">{monthlyReport?.transaction_count || 0}</p>
          <p className="text-sm text-purple-100 mt-1">Last 30 Days</p>
        </div>
        <div className="card bg-gradient-to-br from-yellow-500 to-yellow-600 text-white">
          <p className="text-yellow-100 text-sm">Zakat Paid</p>
          <p className="text-3xl font-bold mt-2">{monthlyReport?.zakat_paid?.toFixed(2) || '0.00'}</p>
          <p className="text-sm text-yellow-100 mt-1">Last 30 Days</p>
        </div>
      </div>

      {/* Detailed Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="card">
          <h2 className="text-xl font-bold mb-4">💰 Account Overview</h2>
          <div className="space-y-3">
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <span className="text-gray-600">Current Balance</span>
              <span className="font-bold text-lg">{monthlyReport?.current_balance?.toFixed(2) || '0.00'} Coins</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <span className="text-gray-600">Net Change (30d)</span>
              <span className={`font-bold text-lg ${(monthlyReport?.net_change || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {(monthlyReport?.net_change || 0) >= 0 ? '+' : ''}{monthlyReport?.net_change?.toFixed(2) || '0.00'} Coins
              </span>
            </div>
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <span className="text-gray-600">All Time Transactions</span>
              <span className="font-bold text-lg">{monthlyReport?.all_time_transactions || 0}</span>
            </div>
          </div>
        </div>

        <div className="card">
          <h2 className="text-xl font-bold mb-4">📈 Transaction Breakdown</h2>
          <div className="space-y-3">
            <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
              <div>
                <p className="text-sm text-gray-600">Sent</p>
                <p className="font-bold text-blue-600">{monthlyReport?.total_sent?.toFixed(2) || '0.00'} Coins</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600">Avg per TX</p>
                <p className="font-bold text-blue-600">
                  {monthlyReport?.transaction_count > 0 
                    ? ((monthlyReport?.total_sent || 0) / monthlyReport.transaction_count).toFixed(2) 
                    : '0.00'} Coins
                </p>
              </div>
            </div>
            <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
              <div>
                <p className="text-sm text-gray-600">Received</p>
                <p className="font-bold text-green-600">{monthlyReport?.total_received?.toFixed(2) || '0.00'} Coins</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600">Avg per TX</p>
                <p className="font-bold text-green-600">
                  {monthlyReport?.transaction_count > 0 
                    ? ((monthlyReport?.total_received || 0) / monthlyReport.transaction_count).toFixed(2) 
                    : '0.00'} Coins
                </p>
              </div>
            </div>
            <div className="flex justify-between items-center p-3 bg-yellow-50 rounded-lg">
              <div>
                <p className="text-sm text-gray-600">Zakat (2.5%)</p>
                <p className="font-bold text-yellow-600">{monthlyReport?.zakat_paid?.toFixed(2) || '0.00'} Coins</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600">Records</p>
                <p className="font-bold text-yellow-600">{zakatRecords.length}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Zakat History */}
      <div className="card">
        <h2 className="text-2xl font-bold mb-6">🕌 Zakat History (2.5% Monthly)</h2>
        {zakatRecords.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600">No zakat records yet</p>
            <p className="text-sm text-gray-500 mt-2">Zakat will be automatically deducted monthly</p>
          </div>
        ) : (
          <div className="space-y-3">
            {zakatRecords.map((record: any, i: number) => (
              <div key={i} className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg hover:shadow-md transition-shadow">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-semibold text-gray-800">Zakat Deduction</p>
                    <p className="text-sm text-gray-600">{formatDate(record.deduction_date || record.created_at)}</p>
                    {record.transaction_hash && (
                      <p className="text-xs text-gray-500 mt-1 font-mono">
                        TX: {record.transaction_hash.substring(0, 16)}...
                      </p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-yellow-600">{parseFloat(record.amount).toFixed(2)}</p>
                    <p className="text-sm text-yellow-700">Coins</p>
                  </div>
                </div>
              </div>
            ))}
            <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <div className="flex justify-between items-center">
                <span className="font-semibold text-gray-700">Total Zakat Paid (All Time)</span>
                <span className="text-xl font-bold text-yellow-600">
                  {zakatRecords.reduce((sum, r) => sum + parseFloat(r.amount), 0).toFixed(2)} Coins
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
