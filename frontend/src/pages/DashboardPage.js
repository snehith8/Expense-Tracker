import { useState, useEffect } from 'react';
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
  Legend,
} from 'recharts';

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

const DashboardPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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

  if (loading)
    return (
      <div>
        <div style={{ marginBottom: '24px' }}>
          <div
            className="skeleton"
            style={{ height: '32px', width: '280px', marginBottom: '8px' }}
          />
          <div
            className="skeleton"
            style={{ height: '20px', width: '200px' }}
          />
        </div>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: '16px',
            marginBottom: '24px',
          }}
        >
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="skeleton"
              style={{ height: '110px', borderRadius: '12px' }}
            />
          ))}
        </div>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 360px',
            gap: '20px',
            marginBottom: '24px',
          }}
        >
          <div
            className="skeleton"
            style={{ height: '300px', borderRadius: '12px' }}
          />
          <div
            className="skeleton"
            style={{ height: '300px', borderRadius: '12px' }}
          />
        </div>
        <div
          className="skeleton"
          style={{ height: '300px', borderRadius: '12px' }}
        />
      </div>
    );

  if (error)
    return (
      <div>
        <h1
          style={{
            fontSize: '1.75rem',
            fontWeight: '800',
            marginBottom: '20px',
          }}
        >
          Dashboard
        </h1>
        <div
          className="alert alert-error"
          style={{ fontSize: '1rem', padding: '20px' }}
        >
          ⚠️ {error}
          <br />
          <br />
          <strong>Check:</strong>
          <br />
          1. Backend running: <code>node server.js</code>
          <br />
          2. Terminal shows "Server running on port 8000"
          <br />
          3. MongoDB is connected
        </div>
      </div>
    );

  if (!data) return null;

  const {
    totals = {},
    currentMonth = {},
    categoryBreakdown = [],
    recentTransactions = [],
    monthlyTrend = [],
  } = data;
  const isPositive = (totals.income || 0) >= (totals.expense || 0);

  const trendData = monthlyTrend.map((item) => ({
    name: MONTH_NAMES[parseInt(item.month.split('-')[1]) - 1],
    Income: Math.round(item.income || 0),
    Expenses: Math.round(item.expense || 0),
  }));

  return (
    <div className="fade-in">
      <div style={{ marginBottom: '28px' }}>
        <h1
          style={{
            fontSize: '1.75rem',
            fontWeight: '800',
            color: '#0f172a',
            marginBottom: '4px',
          }}
        >
          {greeting()}, {user?.name?.split(' ')[0]} 👋
        </h1>
        <p style={{ color: '#64748b', fontSize: '0.9rem' }}>
          Here's your financial overview
        </p>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '16px',
          marginBottom: '24px',
        }}
      >
        <StatCard
          label="Net Balance"
          value={formatCurrency((totals.income || 0) - (totals.expense || 0))}
          icon="💼"
          color={isPositive ? '#10b981' : '#ef4444'}
          bg={isPositive ? '#dcfce7' : '#fee2e2'}
        />
        <StatCard
          label="Total Income"
          value={formatCurrency(totals.income || 0)}
          icon="📈"
          color="#10b981"
          bg="#dcfce7"
        />
        <StatCard
          label="Total Expenses"
          value={formatCurrency(totals.expense || 0)}
          icon="📉"
          color="#ef4444"
          bg="#fee2e2"
        />
        <StatCard
          label="This Month"
          value={formatCurrency(currentMonth.expense || 0)}
          icon="📅"
          color="#6366f1"
          bg="#e0e7ff"
          sub={`Income: ${formatCurrency(currentMonth.income || 0)}`}
        />
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 360px',
          gap: '20px',
          marginBottom: '24px',
        }}
      >
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">📊 Monthly Trend</h3>
          </div>
          {trendData.length > 0 ? (
            <ResponsiveContainer width="100%" height={240}>
              <AreaChart
                data={trendData}
                margin={{ top: 5, right: 10, left: 0, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 12, fill: '#64748b' }}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: '#64748b' }}
                  tickFormatter={(v) =>
                    `₹${v >= 1000 ? (v / 1000).toFixed(0) + 'k' : v}`
                  }
                />
                <Tooltip formatter={(v) => formatCurrency(v)} />
                <Legend />
                <Area
                  type="monotone"
                  dataKey="Income"
                  stroke="#10b981"
                  fill="#dcfce7"
                  strokeWidth={2}
                />
                <Area
                  type="monotone"
                  dataKey="Expenses"
                  stroke="#ef4444"
                  fill="#fee2e2"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="empty-state">
              <p>Add transactions to see your monthly trend</p>
            </div>
          )}
        </div>

        <div className="card">
          <div className="card-header">
            <h3 className="card-title">🎯 By Category</h3>
          </div>
          {categoryBreakdown.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={170}>
                <PieChart>
                  <Pie
                    data={categoryBreakdown}
                    dataKey="total"
                    nameKey="category"
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={75}
                    paddingAngle={2}
                  >
                    {categoryBreakdown.map((entry, i) => (
                      <Cell
                        key={i}
                        fill={CATEGORY_COLORS[entry.category] || '#94a3b8'}
                      />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v) => formatCurrency(v)} />
                </PieChart>
              </ResponsiveContainer>
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '7px',
                  maxHeight: '130px',
                  overflowY: 'auto',
                  marginTop: '8px',
                }}
              >
                {categoryBreakdown.slice(0, 6).map((item, i) => (
                  <div
                    key={i}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      fontSize: '0.8rem',
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                      }}
                    >
                      <div
                        style={{
                          width: '10px',
                          height: '10px',
                          borderRadius: '50%',
                          flexShrink: 0,
                          background:
                            CATEGORY_COLORS[item.category] || '#94a3b8',
                        }}
                      />
                      <span style={{ color: '#0f172a', fontWeight: '500' }}>
                        {item.category}
                      </span>
                    </div>
                    <span style={{ color: '#64748b', fontWeight: '600' }}>
                      {item.percentage}%
                    </span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="empty-state">
              <p>No expense data yet</p>
            </div>
          )}
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h3 className="card-title">🕐 Recent Transactions</h3>
          <button
            className="btn btn-secondary btn-sm"
            onClick={() => navigate('/transactions')}
          >
            View All →
          </button>
        </div>
        {recentTransactions.length > 0 ? (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Category</th>
                  <th>Date</th>
                  <th style={{ textAlign: 'right' }}>Amount</th>
                </tr>
              </thead>
              <tbody>
                {recentTransactions.map((t) => (
                  <tr key={t._id}>
                    <td>
                      <div style={{ fontWeight: '600' }}>{t.title}</div>
                      {t.notes && (
                        <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                          {t.notes.substring(0, 40)}
                          {t.notes.length > 40 ? '…' : ''}
                        </div>
                      )}
                    </td>
                    <td>
                      <span
                        style={{
                          padding: '2px 8px',
                          borderRadius: '6px',
                          fontSize: '0.75rem',
                          fontWeight: '600',
                          background:
                            (CATEGORY_COLORS[t.category] || '#94a3b8') + '22',
                          color: '#0f172a',
                        }}
                      >
                        {t.category}
                      </span>
                    </td>
                    <td style={{ color: '#64748b', fontSize: '0.82rem' }}>
                      {formatDate(t.date)}
                    </td>
                    <td
                      style={{
                        textAlign: 'right',
                        fontWeight: '700',
                        color: t.type === 'income' ? '#10b981' : '#ef4444',
                      }}
                    >
                      {t.type === 'income' ? '+' : '-'}
                      {formatCurrency(t.amount)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="empty-state">
            <div style={{ fontSize: '2.5rem', marginBottom: '12px' }}>📭</div>
            <h3>No transactions yet</h3>
            <p>Start tracking your expenses</p>
            <button
              className="btn btn-primary"
              style={{ marginTop: '16px' }}
              onClick={() => navigate('/transactions')}
            >
              ➕ Add First Transaction
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

const StatCard = ({ label, value, icon, color, bg, sub }) => (
  <div className="stat-card">
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '12px',
      }}
    >
      <span className="stat-label">{label}</span>
      <div
        style={{
          width: '38px',
          height: '38px',
          background: bg,
          borderRadius: '10px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '1.2rem',
        }}
      >
        {icon}
      </div>
    </div>
    <div className="stat-value" style={{ color }}>
      {value}
    </div>
    {sub && (
      <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '4px' }}>
        {sub}
      </div>
    )}
  </div>
);

export default DashboardPage;
