import { useEffect, useRef } from 'react';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

export default function GoldGrowthChart({ transactions, currentValue }) {
  const chartRef = useRef(null);
  const chartInstance = useRef(null);

  useEffect(() => {
    if (!transactions || transactions.length === 0) return;

    // Prepare data - group transactions by date and calculate cumulative gold
    const sortedTransactions = [...transactions].sort(
      (a, b) => new Date(a.timestamp) - new Date(b.timestamp)
    );

    const labels = [];
    const goldData = [];
    const valueData = [];

    let cumulativeGold = 0;
    let cumulativeValue = 0;

    sortedTransactions.forEach((tx) => {
      const date = new Date(tx.timestamp);
      const label = date.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });

      if (tx.type === 'buy') {
        cumulativeGold += tx.goldGrams;
        cumulativeValue += tx.amount;
      } else {
        cumulativeGold -= tx.goldGrams;
        cumulativeValue -= tx.amount;
      }

      labels.push(label);
      goldData.push(cumulativeGold);
      valueData.push(cumulativeValue);
    });

    // Add current value point
    labels.push('Now');
    goldData.push(cumulativeGold);
    valueData.push(currentValue || cumulativeValue);

    const ctx = chartRef.current.getContext('2d');

    // Destroy existing chart
    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    // Create new chart
    chartInstance.current = new Chart(ctx, {
      type: 'line',
      data: {
        labels,
        datasets: [
          {
            label: 'Gold (grams)',
            data: goldData,
            borderColor: '#F59E0B',
            backgroundColor: 'rgba(245, 158, 11, 0.1)',
            fill: true,
            tension: 0.4,
            yAxisID: 'y',
          },
          {
            label: 'Value (₹)',
            data: valueData,
            borderColor: '#10B981',
            backgroundColor: 'rgba(16, 185, 129, 0.1)',
            fill: true,
            tension: 0.4,
            yAxisID: 'y1',
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
          mode: 'index',
          intersect: false,
        },
        plugins: {
          legend: {
            position: 'top',
            labels: {
              usePointStyle: true,
              padding: 20,
            },
          },
          tooltip: {
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            titleColor: '#fff',
            bodyColor: '#fff',
            padding: 12,
            cornerRadius: 8,
            callbacks: {
              label: function (context) {
                let label = context.dataset.label || '';
                if (label) {
                  label += ': ';
                }
                if (context.datasetIndex === 0) {
                  label += context.parsed.y.toFixed(4) + 'g';
                } else {
                  label += '₹' + context.parsed.y.toLocaleString('en-IN', { maximumFractionDigits: 0 });
                }
                return label;
              },
            },
          },
        },
        scales: {
          x: {
            grid: {
              display: false,
            },
          },
          y: {
            type: 'linear',
            display: true,
            position: 'left',
            title: {
              display: true,
              text: 'Gold (grams)',
              color: '#F59E0B',
            },
            grid: {
              color: 'rgba(0, 0, 0, 0.05)',
            },
          },
          y1: {
            type: 'linear',
            display: true,
            position: 'right',
            title: {
              display: true,
              text: 'Value (₹)',
              color: '#10B981',
            },
            grid: {
              drawOnChartArea: false,
            },
          },
        },
      },
    });

    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [transactions, currentValue]);

  if (!transactions || transactions.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Gold Growth Chart</h3>
        <div className="text-center py-8">
          <div className="text-6xl mb-4">📈</div>
          <p className="text-gray-500">No data to display</p>
          <p className="text-sm text-gray-400">Start investing to see your growth chart</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Gold Growth Chart</h3>
      <div className="h-64">
        <canvas ref={chartRef}></canvas>
      </div>
    </div>
  );
}

