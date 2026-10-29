import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  dashboardAPI,
  formatCurrency,
  formatDate,
  CATEGORY_COLORS,
} from '../utils/api';
import {
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import '../CSS/DashboardPage.css';

const MONTH_NAMES = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
];

const greeting = () => {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 18) return 'Good afternoon';
  return 'Good evening';
};

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="custom-chart-tooltip">
        <p className="tooltip-label">{label}</p>
        {payload.map((entry, index) => (
          <div key={`tooltip-${index}`} className="tooltip-item">
            <span
              className="tooltip-dot"
              style={{ backgroundColor: entry.color }}
            />
            <span className="tooltip-name">{entry.name}:</span>
            <span className="tooltip-val">{formatCurrency(entry.value)}</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

const DashboardPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const tableContainerRef = useRef(null);
  const isHoveredRef = useRef(false);

  useEffect(() => {
    dashboardAPI
      .getSummary()
      .then((res) => setData(res.data.data))
      .catch((err) => {
        console.error('Dashboard error:', err?.response?.data || err.message);
        setError(
          'Failed to load dashboard. Make sure the backend is running on port 8000.',
        );
      })
      .finally(() => setLoading(false));
  }, []);

  // Smooth auto-scroll loop for recent transactions
  useEffect(() => {
    const el = tableContainerRef.current;
    if (!el || !data?.recentTransactions || data.recentTransactions.length <= 4)
      return;

    const scrollSpeed = 0.6;
    let animId;

    const step = () => {
      if (!isHoveredRef.current && el) {
        el.scrollTop += scrollSpeed;
        if (el.scrollTop + el.clientHeight >= el.scrollHeight - 1) {
          el.scrollTop = 0;
        }
      }
      animId = requestAnimationFrame(step);
    };

    animId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(animId);
  }, [data?.recentTransactions]);

  if (loading) {
    return (
      <div className="dashboard-container">
        <div className="skeleton-header">
          <div className="skeleton-bar h-8 w-64 mb-2" />
          <div className="skeleton-bar h-4 w-40" />
        </div>
        <div className="dashboard-scrollable-body">
          <div className="stats-grid">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="skeleton-card stat-skeleton" />
            ))}
          </div>
          <div className="charts-grid">
            <div className="skeleton-card chart-skeleton" />
            <div className="skeleton-card pie-skeleton" />
          </div>
          <div className="skeleton-card table-skeleton" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-container">
        <div className="dashboard-header">
          <h1 className="header-title">Dashboard</h1>
        </div>
        <div className="dashboard-error-card">
          <div className="error-icon-box">
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
          </div>
          <div>
            <h3 className="error-title">Connection Error</h3>
            <p className="error-desc">{error}</p>
            <div className="error-checklist">
              <span>Backend checklist:</span>
              <ul>
                <li>
                  Run <code>node server.js</code>
                </li>
                <li>
                  Ensure terminal displays{' '}
                  <code>Server running on port 8000</code>
                </li>
                <li>Verify your MongoDB connection</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!data) return null;

  const {
    totals = {},
    currentMonth = {},
    categoryBreakdown = [],
    recentTransactions = [],
    monthlyTrend = [],
  } = data;

  const netBalance = (totals.income || 0) - (totals.expense || 0);
  const isPositive = netBalance >= 0;

  const trendData = monthlyTrend.map((item) => ({
    name: MONTH_NAMES[parseInt(item.month.split('-')[1], 10) - 1],
    Income: Math.round(item.income || 0),
    Expenses: Math.round(item.expense || 0),
  }));

  return (
    <div className="dashboard-container fade-in">
      {/* Pinned Header */}
      <div className="dashboard-header">
        <div>
          <h1 className="header-title">
            {greeting()}, {user?.name?.split(' ')[0]}
          </h1>
          <p className="header-subtitle">
            Here is your financial performance overview
          </p>
        </div>
        <button
          className="btn-quick-add"
          onClick={() => navigate('/transactions')}
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
          >
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Add Record
        </button>
      </div>

      {/* Scrollable Content Body */}
      <div className="dashboard-scrollable-body">
        {/* 4 Metric Cards */}
        <div className="stats-grid">
          <StatCard
            label="Net Balance"
            value={formatCurrency(netBalance)}
            type={isPositive ? 'success' : 'danger'}
            icon={
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <rect width="20" height="14" x="2" y="5" rx="2" />
                <line x1="2" x2="22" y1="10" y2="10" />
              </svg>
            }
          />
          <StatCard
            label="Total Income"
            value={formatCurrency(totals.income || 0)}
            type="success"
            icon={
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
                <polyline points="17 6 23 6 23 12" />
              </svg>
            }
          />
          <StatCard
            label="Total Expenses"
            value={formatCurrency(totals.expense || 0)}
            type="danger"
            icon={
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <polyline points="23 18 13.5 8.5 8.5 13.5 1 6" />
                <polyline points="17 18 23 18 23 12" />
              </svg>
            }
          />
          <StatCard
            label="This Month"
            value={formatCurrency(currentMonth.expense || 0)}
            type="brand"
            sub={`Earned: ${formatCurrency(currentMonth.income || 0)}`}
            icon={
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
                <line x1="16" x2="16" y1="2" y2="6" />
                <line x1="8" x2="8" y1="2" y2="6" />
                <line x1="3" x2="21" y1="10" y2="10" />
              </svg>
            }
          />
        </div>

        {/* Charts Grid */}
        <div className="charts-grid">
          {/* Trend Area Chart */}
          <div className="dash-card">
            <div className="dash-card-header">
              <div>
                <h3 className="card-heading">Cashflow Dynamics</h3>
                <p className="card-subheading">Income vs Expenses over time</p>
              </div>
              <div className="legend-pills">
                <span className="pill-item">
                  <span className="dot dot-inc" /> Income
                </span>
                <span className="pill-item">
                  <span className="dot dot-exp" /> Expenses
                </span>
              </div>
            </div>
            {trendData.length > 0 ? (
              <div className="chart-canvas-wrapper">
                <ResponsiveContainer width="100%" height={260}>
                  <AreaChart
                    data={trendData}
                    margin={{ top: 10, right: 10, left: -15, bottom: 0 }}
                  >
                    <defs>
                      <linearGradient
                        id="incomeGradient"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="5%"
                          stopColor="#10b981"
                          stopOpacity={0.25}
                        />
                        <stop
                          offset="95%"
                          stopColor="#10b981"
                          stopOpacity={0}
                        />
                      </linearGradient>
                      <linearGradient
                        id="expenseGradient"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="5%"
                          stopColor="#ef4444"
                          stopOpacity={0.25}
                        />
                        <stop
                          offset="95%"
                          stopColor="#ef4444"
                          stopOpacity={0}
                        />
                      </linearGradient>
                    </defs>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="rgba(255, 255, 255, 0.05)"
                      vertical={false}
                    />
                    <XAxis
                      dataKey="name"
                      tick={{ fontSize: 12, fill: '#64748b' }}
                      stroke="rgba(255,255,255,0.08)"
                    />
                    <YAxis
                      tick={{ fontSize: 11, fill: '#64748b' }}
                      stroke="rgba(255,255,255,0.08)"
                      tickFormatter={(v) =>
                        `₹${v >= 1000 ? (v / 1000).toFixed(0) + 'k' : v}`
                      }
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Area
                      type="monotone"
                      dataKey="Income"
                      stroke="#10b981"
                      strokeWidth={2.5}
                      fillOpacity={1}
                      fill="url(#incomeGradient)"
                    />
                    <Area
                      type="monotone"
                      dataKey="Expenses"
                      stroke="#ef4444"
                      strokeWidth={2.5}
                      fillOpacity={1}
                      fill="url(#expenseGradient)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="chart-empty-box">
                <svg
                  width="36"
                  height="36"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#475569"
                  strokeWidth="1.5"
                >
                  <line x1="18" y1="20" x2="18" y2="10" />
                  <line x1="12" y1="20" x2="12" y2="4" />
                  <line x1="6" y1="20" x2="6" y2="14" />
                </svg>
                <p>Add transactions to view your monthly trend analysis</p>
              </div>
            )}
          </div>

          {/* Category Breakdown */}
          <div className="dash-card">
            <div className="dash-card-header">
              <div>
                <h3 className="card-heading">By Category</h3>
                <p className="card-subheading">Expense allocation</p>
              </div>
            </div>
            {categoryBreakdown.length > 0 ? (
              <div className="pie-section">
                <ResponsiveContainer width="100%" height={170}>
                  <PieChart>
                    <Pie
                      data={categoryBreakdown}
                      dataKey="total"
                      nameKey="category"
                      cx="50%"
                      cy="50%"
                      innerRadius={48}
                      outerRadius={74}
                      paddingAngle={3}
                    >
                      {categoryBreakdown.map((entry, i) => (
                        <Cell
                          key={i}
                          fill={CATEGORY_COLORS[entry.category] || '#6366f1'}
                          stroke="rgba(17, 24, 39, 0.8)"
                          strokeWidth={2}
                        />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="category-list">
                  {categoryBreakdown.slice(0, 5).map((item, i) => {
                    const tagColor =
                      CATEGORY_COLORS[item.category] || '#818cf8';
                    return (
                      <div key={i} className="category-row">
                        <div className="cat-label-wrap">
                          <span
                            className="cat-color-badge"
                            style={{ backgroundColor: tagColor }}
                          />
                          <span className="cat-name">{item.category}</span>
                        </div>
                        <span className="cat-pct">{item.percentage}%</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="chart-empty-box">
                <svg
                  width="36"
                  height="36"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#475569"
                  strokeWidth="1.5"
                >
                  <circle cx="12" cy="12" r="10" />
                  <path d="M12 2a10 10 0 0 1 10 10" />
                </svg>
                <p>No category expense data recorded yet</p>
              </div>
            )}
          </div>
        </div>

        {/* Auto-scroll Recent Transactions Card */}
        <div className="dash-card">
          <div className="dash-card-header">
            <div>
              <h3 className="card-heading">Recent Transactions</h3>
              <p className="card-subheading">
                Latest ledger activities (hover to pause)
              </p>
            </div>
            <button
              className="btn-table-action"
              onClick={() => navigate('/transactions')}
            >
              View All
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
              >
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </button>
          </div>

          {recentTransactions.length > 0 ? (
            <div
              className="table-container auto-scroll-container"
              ref={tableContainerRef}
              onMouseEnter={() => {
                isHoveredRef.current = true;
              }}
              onMouseLeave={() => {
                isHoveredRef.current = false;
              }}
            >
              <table className="modern-table">
                <thead>
                  <tr>
                    <th>Transaction</th>
                    <th>Category</th>
                    <th>Date</th>
                    <th className="text-right">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {recentTransactions.map((t) => {
                    const isInc = t.type === 'income';
                    const catColor = CATEGORY_COLORS[t.category] || '#818cf8';
                    return (
                      <tr key={t._id}>
                        <td>
                          <div className="tx-title">{t.title}</div>
                          {t.notes && <div className="tx-notes">{t.notes}</div>}
                        </td>
                        <td>
                          <span
                            className="category-badge"
                            style={{
                              color: catColor,
                              backgroundColor: `${catColor}1c`,
                              borderColor: `${catColor}33`,
                            }}
                          >
                            {t.category}
                          </span>
                        </td>
                        <td className="tx-date">{formatDate(t.date)}</td>
                        <td
                          className={`tx-amount text-right ${isInc ? 'val-inc' : 'val-exp'}`}
                        >
                          {isInc ? '+' : '-'} {formatCurrency(t.amount)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="table-empty-state">
              <div className="empty-icon-ring">
                <svg
                  width="28"
                  height="28"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#818cf8"
                  strokeWidth="1.8"
                >
                  <rect width="20" height="16" x="2" y="4" rx="2" />
                  <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                </svg>
              </div>
              <h4>No transactions recorded</h4>
              <p>
                Your ledger is completely empty. Start tracking your daily cash
                flow.
              </p>
              <button
                className="btn-primary-action"
                onClick={() => navigate('/transactions')}
              >
                Add First Transaction
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ label, value, icon, type = 'brand', sub }) => (
  <div className={`stat-box stat-theme-${type}`}>
    <div className="stat-box-top">
      <span className="stat-label-text">{label}</span>
      <div className="stat-icon-wrapper">{icon}</div>
    </div>
    <div className="stat-figure">{value}</div>
    {sub && <div className="stat-subtext">{sub}</div>}
  </div>
);

export default DashboardPage;
