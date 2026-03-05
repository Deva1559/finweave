import { useState, useEffect } from 'react';
import { useApp } from '../../App';

export default function GoldTransactionHistory() {
  const { API_URL, token } = useApp();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchHistory();
  }, [page]);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/investments/history?page=${page}&limit=20`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setTransactions(data.investments);
        setTotalPages(data.pagination.pages);
      }
    } catch (err) {
      console.error('Error fetching history:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Transaction History</h3>
        <div className="animate-pulse space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 bg-gray-200 rounded-xl"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Transaction History</h3>
      
      {transactions.length === 0 ? (
        <div className="text-center py-8">
          <div className="text-6xl mb-4">📋</div>
          <p className="text-gray-500">No transactions yet</p>
          <p className="text-sm text-gray-400">Your gold transactions will appear here</p>
        </div>
      ) : (
        <>
          <div className="space-y-3">
            {transactions.map((tx) => (
              <div 
                key={tx._id} 
                className={`flex items-center justify-between p-4 rounded-xl border ${
                  tx.type === 'buy' 
                    ? 'bg-green-50 border-green-200' 
                    : 'bg-red-50 border-red-200'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    tx.type === 'buy' ? 'bg-green-100' : 'bg-red-100'
                  }`}>
                    <span className="text-xl">{tx.type === 'buy' ? '💰' : '🏷️'}</span>
                  </div>
                  <div>
                    <p className={`font-semibold ${
                      tx.type === 'buy' ? 'text-green-800' : 'text-red-800'
                    }`}>
                      {tx.type === 'buy' ? 'Bought Gold' : 'Sold Gold'}
                    </p>
                    <p className="text-xs text-gray-500">{formatDate(tx.timestamp)}</p>
                  </div>
                </div>
                
                <div className="text-right">
                  <p className={`font-bold ${
                    tx.type === 'buy' ? 'text-green-700' : 'text-red-700'
                  }`}>
                    {tx.type === 'buy' ? '+' : '-'}{tx.goldGrams?.toFixed(4)}g
                  </p>
                  <p className="text-xs text-gray-500">
                    ₹{tx.amount?.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                  </p>
                  <p className="text-xs text-gray-400">
                    @₹{tx.goldPrice?.toLocaleString('en-IN', { maximumFractionDigits: 2 })}/g
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-100">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <span className="text-sm text-gray-500">
                Page {page} of {totalPages}
              </span>
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

