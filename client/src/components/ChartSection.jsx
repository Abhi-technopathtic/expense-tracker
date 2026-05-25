import { useState } from 'react';
import { useTransactions } from '../context/TransactionContext';
import { formatCurrency } from '../utils/formatCurrency';
import { CHART_COLORS, getCategoryMeta } from '../utils/categories';
import {
  PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  AreaChart, Area,
} from 'recharts';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="chart-tooltip">
        {label && <p className="chart-tooltip-label">{label}</p>}
        {payload.map((entry, i) => (
          <p key={i} style={{ color: entry.color }}>
            {entry.name}: {formatCurrency(entry.value)}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

const TABS = ['Pie', 'Bar', 'Area'];

const ChartSection = () => {
  const { categoryData, monthlyData } = useTransactions();
  const [activeTab, setActiveTab] = useState('Bar');

  // Prepare pie data
  const pieData = categoryData.map((d, i) => {
    const meta = getCategoryMeta(d._id);
    return {
      name: d._id,
      value: d.total,
      color: meta.color || CHART_COLORS[i % CHART_COLORS.length],
      icon: meta.icon,
    };
  });

  // Monthly data ready for charts
  const barData = monthlyData.filter((m) => m.income > 0 || m.expense > 0);
  const areaData = monthlyData;

  const renderPie = () => (
    <div className="chart-container">
      {pieData.length === 0 ? (
        <div className="chart-empty">No expense data yet 📊</div>
      ) : (
        <>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={65}
                outerRadius={110}
                paddingAngle={3}
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell key={index} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend
                formatter={(value) => {
                  const item = pieData.find((d) => d.name === value);
                  return `${item?.icon || ''} ${value}`;
                }}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="pie-legend">
            {pieData.map((d) => (
              <div key={d.name} className="pie-legend-item">
                <span className="pie-dot" style={{ backgroundColor: d.color }} />
                <span className="pie-category">{d.icon} {d.name}</span>
                <span className="pie-amount">{formatCurrency(d.value)}</span>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );

  const renderBar = () => (
    <div className="chart-container">
      {barData.length === 0 ? (
        <div className="chart-empty">No monthly data yet 📊</div>
      ) : (
        <ResponsiveContainer width="100%" height={320}>
          <BarChart data={barData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis dataKey="monthName" tick={{ fill: '#94a3b8', fontSize: 12 }} />
            <YAxis
              tickFormatter={(v) => `₹${v >= 1000 ? `${(v / 1000).toFixed(0)}K` : v}`}
              tick={{ fill: '#94a3b8', fontSize: 11 }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Bar dataKey="income" name="Income" fill="#22c55e" radius={[6, 6, 0, 0]} />
            <Bar dataKey="expense" name="Expense" fill="#ef4444" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );

  const renderArea = () => (
    <div className="chart-container">
      {areaData.every((m) => m.income === 0 && m.expense === 0) ? (
        <div className="chart-empty">No trend data yet 📊</div>
      ) : (
        <ResponsiveContainer width="100%" height={320}>
          <AreaChart data={areaData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
            <defs>
              <linearGradient id="incomeGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="expenseGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis dataKey="monthName" tick={{ fill: '#94a3b8', fontSize: 12 }} />
            <YAxis
              tickFormatter={(v) => `₹${v >= 1000 ? `${(v / 1000).toFixed(0)}K` : v}`}
              tick={{ fill: '#94a3b8', fontSize: 11 }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Area
              type="monotone"
              dataKey="income"
              name="Income"
              stroke="#22c55e"
              strokeWidth={2.5}
              fill="url(#incomeGrad)"
            />
            <Area
              type="monotone"
              dataKey="expense"
              name="Expense"
              stroke="#ef4444"
              strokeWidth={2.5}
              fill="url(#expenseGrad)"
            />
          </AreaChart>
        </ResponsiveContainer>
      )}
    </div>
  );

  return (
    <div className="chart-card">
      <div className="chart-header">
        <h2 className="chart-title">Analytics</h2>
        <div className="chart-tabs">
          {TABS.map((tab) => (
            <button
              key={tab}
              className={`chart-tab ${activeTab === tab ? 'chart-tab--active' : ''}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab === 'Pie' ? '🥧 Categories' : tab === 'Bar' ? '📊 Monthly' : '📈 Trend'}
            </button>
          ))}
        </div>
      </div>
      {activeTab === 'Pie' && renderPie()}
      {activeTab === 'Bar' && renderBar()}
      {activeTab === 'Area' && renderArea()}
    </div>
  );
};

export default ChartSection;
