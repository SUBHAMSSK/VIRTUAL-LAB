import React, { useState, useEffect } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const AnalyticsDashboard = ({ data }) => {
  const [keHistory, setKeHistory] = useState(Array(50).fill(0));
  const [momHistory, setMomHistory] = useState(Array(50).fill(0));

  const totalKE = data.reduce((sum, item) => sum + item.kineticEnergy, 0);
  const totalMomentum = data.reduce((sum, item) => sum + item.momentum, 0);
  const avgVelocity = data.length > 0 
    ? data.reduce((sum, item) => sum + item.velocity, 0) / data.length 
    : 0;

  useEffect(() => {
    setKeHistory(prev => [...prev.slice(1), totalKE]);
    setMomHistory(prev => [...prev.slice(1), totalMomentum]);
  }, [data]); // Trigger on every new data frame from the physics engine

  // Chart config
  const keChartData = {
    labels: Array(50).fill(''), 
    datasets: [
      {
        label: 'System Kinetic Energy (J)',
        data: keHistory,
        borderColor: 'rgb(99, 102, 241)', // Indigo 500
        backgroundColor: 'rgba(99, 102, 241, 0.5)',
        tension: 0.4,
        pointRadius: 0,
        borderWidth: 2,
      },
    ],
  };

  const momChartData = {
    labels: Array(50).fill(''), 
    datasets: [
      {
        label: 'System Momentum (kg·m/s)',
        data: momHistory,
        borderColor: 'rgb(245, 158, 11)', // Amber 500
        backgroundColor: 'rgba(245, 158, 11, 0.5)',
        tension: 0.4,
        pointRadius: 0,
        borderWidth: 2,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    animation: { duration: 0 },
    plugins: {
      legend: { display: false },
      title: { display: false },
      tooltip: { enabled: false }
    },
    scales: {
      y: { 
        beginAtZero: true,
        ticks: { color: '#6b7280', maxTicksLimit: 4 }, 
        grid: { color: '#374151', borderDash: [5, 5] } 
      },
      x: { 
        ticks: { display: false }, 
        grid: { display: false } 
      },
    }
  };

  return (
    <div className="p-4 flex flex-col gap-6">
      
      {/* Quick Stats Cards */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-gray-800/50 rounded-xl p-3 border border-gray-700/50">
          <div className="text-xs text-gray-400 mb-1">Active Objects</div>
          <div className="text-2xl font-semibold text-gray-100">{data.length}</div>
        </div>
        <div className="bg-gray-800/50 rounded-xl p-3 border border-gray-700/50">
          <div className="text-xs text-gray-400 mb-1">Avg Velocity</div>
          <div className="text-2xl font-semibold text-gray-100">{avgVelocity.toFixed(1)} <span className="text-sm text-gray-500">m/s</span></div>
        </div>
      </div>

      {/* Main Charts */}
      <div className="bg-gray-800/30 p-3 rounded-xl border border-gray-700/50">
        <h3 className="text-sm text-gray-300 font-medium mb-3">Kinetic Energy</h3>
        <div className="h-32">
          <Line options={chartOptions} data={keChartData} />
        </div>
      </div>

      <div className="bg-gray-800/30 p-3 rounded-xl border border-gray-700/50">
        <h3 className="text-sm text-gray-300 font-medium mb-3">Momentum</h3>
        <div className="h-32">
          <Line options={chartOptions} data={momChartData} />
        </div>
      </div>

      {/* Object List */}
      <div>
        <h3 className="text-sm text-gray-300 font-medium mb-3">Body Telemetry</h3>
        <div className="flex flex-col gap-2">
          {data.length === 0 ? (
            <div className="text-sm text-gray-500 italic text-center py-4 bg-gray-800/20 rounded-lg">No active objects</div>
          ) : (
            data.slice(0, 5).map((body, i) => (
              <div key={body.id} className="bg-gray-800/40 p-2.5 rounded-lg flex justify-between items-center border border-gray-700/30">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-indigo-500"></div>
                  <span className="text-sm text-gray-300">Body #{body.id}</span>
                </div>
                <div className="text-xs font-mono text-gray-400">
                  {body.velocity.toFixed(2)} m/s
                </div>
              </div>
            ))
          )}
          {data.length > 5 && (
            <div className="text-xs text-center text-gray-500 pt-2">+ {data.length - 5} more bodies</div>
          )}
        </div>
      </div>

    </div>
  );
};

export default AnalyticsDashboard;
