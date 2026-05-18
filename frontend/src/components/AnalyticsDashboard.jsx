import React, { useState, useEffect, useRef } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale, LinearScale, PointElement, LineElement,
  BarElement, Title, Tooltip, Legend, Filler
);

const BODY_COLORS = [
  '#6366f1', '#ec4899', '#14b8a6', '#f59e0b',
  '#8b5cf6', '#10b981', '#ef4444', '#3b82f6'
];

const StatCard = ({ label, value, unit, color }) => (
  <div className={`bg-gray-800/50 rounded-xl p-3 border border-gray-700/50 relative overflow-hidden`}>
    <div className={`absolute top-0 right-0 w-16 h-16 rounded-full blur-2xl opacity-20 ${color}`}></div>
    <div className="text-xs text-gray-400 mb-1 font-medium tracking-wide uppercase">{label}</div>
    <div className="text-xl font-bold text-gray-100 font-mono truncate">
      {value}
      {unit && <span className="text-xs text-gray-500 ml-1 font-sans font-normal">{unit}</span>}
    </div>
  </div>
);

const AnalyticsDashboard = ({ data, selectedBodyId, onSelectBody }) => {
  const HISTORY = 60;
  const [keHistory, setKeHistory]   = useState(Array(HISTORY).fill(0));
  const [momHistory, setMomHistory] = useState(Array(HISTORY).fill(0));
  const [velHistory, setVelHistory] = useState(Array(HISTORY).fill(0));
  const frameRef = useRef(0);

  const totalKE       = data.reduce((s, b) => s + b.kineticEnergy, 0);
  const totalMomentum = data.reduce((s, b) => s + b.momentum, 0);
  const avgVelocity   = data.length > 0
    ? data.reduce((s, b) => s + b.velocity, 0) / data.length : 0;
  const maxVelocity   = data.length > 0
    ? Math.max(...data.map(b => b.velocity)) : 0;

  useEffect(() => {
    frameRef.current += 1;
    setKeHistory(prev  => [...prev.slice(1), totalKE]);
    setMomHistory(prev => [...prev.slice(1), totalMomentum]);
    setVelHistory(prev => [...prev.slice(1), avgVelocity]);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);

  // Shared chart options factory
  const makeOptions = (color) => ({
    responsive: true,
    maintainAspectRatio: false,
    animation: { duration: 0 },
    interaction: { mode: 'index', intersect: false },
    plugins: {
      legend: { display: false },
      tooltip: {
        enabled: true,
        backgroundColor: '#1f2937',
        borderColor: '#374151',
        borderWidth: 1,
        titleColor: '#9ca3af',
        bodyColor: '#f3f4f6',
        padding: 8,
        callbacks: {
          label: (ctx) => ` ${ctx.parsed.y.toFixed(3)}`
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: { color: '#4b5563', maxTicksLimit: 4, font: { size: 10 } },
        grid: { color: '#1f2937' }
      },
      x: {
        ticks: { display: false },
        grid: { display: false }
      },
    }
  });

  const makeLineData = (history, label, borderColor, bgColor) => ({
    labels: Array(HISTORY).fill(''),
    datasets: [{
      label,
      data: history,
      borderColor,
      backgroundColor: bgColor,
      tension: 0.4,
      pointRadius: 0,
      borderWidth: 2,
      fill: true,
    }]
  });

  // Velocity histogram bucketing (5 buckets)
  const velBuckets = [0, 2, 4, 6, 8, Infinity];
  const velLabels  = ['0-2', '2-4', '4-6', '6-8', '8+'];
  const velBucketCounts = Array(5).fill(0);
  data.forEach(b => {
    for (let i = 0; i < velBuckets.length - 1; i++) {
      if (b.velocity >= velBuckets[i] && b.velocity < velBuckets[i + 1]) {
        velBucketCounts[i]++;
        break;
      }
    }
  });

  const histogramData = {
    labels: velLabels,
    datasets: [{
      label: 'Bodies',
      data: velBucketCounts,
      backgroundColor: 'rgba(99,102,241,0.6)',
      borderColor: 'rgb(99,102,241)',
      borderWidth: 1,
      borderRadius: 4,
    }]
  };
  const histogramOptions = {
    responsive: true,
    maintainAspectRatio: false,
    animation: { duration: 150 },
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#1f2937',
        borderColor: '#374151',
        borderWidth: 1,
        bodyColor: '#f3f4f6',
        padding: 6,
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: { stepSize: 1, color: '#4b5563', font: { size: 10 } },
        grid: { color: '#1f2937' }
      },
      x: {
        ticks: { color: '#6b7280', font: { size: 10 } },
        grid: { display: false }
      }
    }
  };

  const selectedBody = selectedBodyId != null
    ? data.find(b => b.id === selectedBodyId)
    : null;

  return (
    <div className="p-3 flex flex-col gap-4">

      {/* ── Stat Cards ── */}
      <div className="grid grid-cols-2 gap-2">
        <StatCard label="Objects"    value={data.length}             color="bg-indigo-500" />
        <StatCard label="Max Speed"  value={maxVelocity.toFixed(2)}  unit="m/s" color="bg-pink-500" />
        <StatCard label="Sys. KE"    value={totalKE.toFixed(2)}      unit="J"   color="bg-amber-500" />
        <StatCard label="Momentum"   value={totalMomentum.toFixed(2)} unit="kg·m/s" color="bg-teal-500" />
      </div>

      {/* ── Live Charts ── */}
      <div className="bg-gray-800/30 p-3 rounded-xl border border-gray-700/40">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-xs font-semibold text-indigo-400 uppercase tracking-wider">Kinetic Energy</h3>
          <span className="text-xs font-mono text-gray-500">{totalKE.toFixed(2)} J</span>
        </div>
        <div className="h-24">
          <Line
            options={makeOptions('rgb(99,102,241)')}
            data={makeLineData(keHistory, 'KE', 'rgb(99,102,241)', 'rgba(99,102,241,0.08)')}
          />
        </div>
      </div>

      <div className="bg-gray-800/30 p-3 rounded-xl border border-gray-700/40">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-xs font-semibold text-amber-400 uppercase tracking-wider">Momentum</h3>
          <span className="text-xs font-mono text-gray-500">{totalMomentum.toFixed(2)} kg·m/s</span>
        </div>
        <div className="h-24">
          <Line
            options={makeOptions('rgb(245,158,11)')}
            data={makeLineData(momHistory, 'Momentum', 'rgb(245,158,11)', 'rgba(245,158,11,0.08)')}
          />
        </div>
      </div>

      <div className="bg-gray-800/30 p-3 rounded-xl border border-gray-700/40">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-xs font-semibold text-teal-400 uppercase tracking-wider">Avg Velocity</h3>
          <span className="text-xs font-mono text-gray-500">{avgVelocity.toFixed(2)} m/s</span>
        </div>
        <div className="h-24">
          <Line
            options={makeOptions('rgb(20,184,166)')}
            data={makeLineData(velHistory, 'Avg Velocity', 'rgb(20,184,166)', 'rgba(20,184,166,0.08)')}
          />
        </div>
      </div>

      {/* ── Velocity Histogram ── */}
      <div className="bg-gray-800/30 p-3 rounded-xl border border-gray-700/40">
        <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Speed Distribution</h3>
        <div className="h-20">
          <Bar options={histogramOptions} data={histogramData} />
        </div>
        <p className="text-xs text-gray-600 mt-1 text-center">Speed buckets (m/s)</p>
      </div>

      {/* ── Per-Body Telemetry ── */}
      <div>
        <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Body Telemetry</h3>
        <div className="flex flex-col gap-1.5">
          {data.length === 0 ? (
            <div className="text-xs text-gray-600 italic text-center py-6 bg-gray-800/20 rounded-xl border border-dashed border-gray-700/50">
              Add objects to the canvas to see telemetry
            </div>
          ) : (
            data.slice(0, 8).map((body, i) => {
              const isSelected = selectedBodyId === body.id;
              const dotColor = BODY_COLORS[i % BODY_COLORS.length];
              return (
                <div
                  key={body.id}
                  onClick={() => onSelectBody && onSelectBody(isSelected ? null : body.id)}
                  className={`p-2 rounded-lg border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-indigo-600/15 border-indigo-500/40'
                      : 'bg-gray-800/30 border-gray-700/30 hover:bg-gray-800/60'
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: dotColor }}></div>
                      <span className="text-xs text-gray-300 font-mono">Body #{body.id}</span>
                    </div>
                    <span className={`text-xs font-mono font-semibold ${
                      body.velocity > 5 ? 'text-red-400' :
                      body.velocity > 2 ? 'text-amber-400' : 'text-teal-400'
                    }`}>
                      {body.velocity.toFixed(2)} m/s
                    </span>
                  </div>
                  {isSelected && (
                    <div className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1 pl-4 text-xs text-gray-500">
                      <span>KE: <span className="text-gray-300 font-mono">{body.kineticEnergy.toFixed(3)} J</span></span>
                      <span>p: <span className="text-gray-300 font-mono">{body.momentum.toFixed(3)}</span></span>
                      <span>mass: <span className="text-gray-300 font-mono">{body.mass.toFixed(2)} kg</span></span>
                    </div>
                  )}
                </div>
              );
            })
          )}
          {data.length > 8 && (
            <div className="text-xs text-center text-gray-600 pt-1">
              + {data.length - 8} more bodies
            </div>
          )}
        </div>
      </div>

      {/* ── Legend ── */}
      <div className="border-t border-gray-800/60 pt-3">
        <div className="flex items-center gap-3 text-xs text-gray-600">
          <div className="flex items-center gap-1"><div className="w-3 h-0.5 bg-red-500 rounded"></div> Velocity</div>
          <div className="flex items-center gap-1"><div className="w-3 h-0.5 bg-blue-500 rounded"></div> Force</div>
        </div>
        <p className="text-xs text-gray-700 mt-1">Vectors shown on canvas</p>
      </div>

    </div>
  );
};

export default AnalyticsDashboard;
