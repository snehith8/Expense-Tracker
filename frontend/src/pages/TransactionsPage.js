import { useState, useEffect, useCallback, useRef } from 'react';
import {
  transactionsAPI,
  formatCurrency,
  formatDate,
  CATEGORIES,
  CATEGORY_COLORS,
} from '../utils/api';
import TransactionModal from '../components/Transactions/TransactionModal';

const TransactionsPage = () => {
  const [transactions, setTransactions] = useState([]);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalCount: 0,
  });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [category, setCategory] = useState('all');
  const [type, setType] = useState('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [sortField, setSortField] = useState('date');
  const [sortOrder, setSortOrder] = useState('desc');
  const [page, setPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedTx, setSelectedTx] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [detailTx, setDetailTx] = useState(null);
  const searchTimeout = useRef(null);

  const fetchTransactions = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = { page, limit: 15, sortBy: sortField, sortOrder };
      if (search) params.search = search;
      if (category !== 'all') params.category = category;
      if (type !== 'all') params.type = type;
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;
      const res = await transactionsAPI.getAll(params);
      setTransactions(res.data.data || []);
      setPagination(
        res.data.pagination || { currentPage: 1, totalPages: 1, totalCount: 0 },
      );
    } catch (err) {
      console.error('Fetch error:', err);
      setError('Failed to load transactions.');
    } finally {
      setLoading(false);
    }
  }, [page, search, category, type, startDate, endDate, sortField, sortOrder]);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  const handleSearchChange = ({ target: { value } }) => {
    setSearchInput(value);
    clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(() => {
      setSearch(value);
      setPage(1);
    }, 400);
  };

  const handleSortChange = ({ target: { value } }) => {
    const [field, order] = value.split('-');
    setSortField(field);
    setSortOrder(order);
    setPage(1);
  };

  const clearFilters = () => {
    setSearch('');
    setSearchInput('');
    setCategory('all');
    setType('all');
    setStartDate('');
    setEndDate('');
    setSortField('date');
    setSortOrder('desc');
    setPage(1);
  };

  const hasFilters =
    search || category !== 'all' || type !== 'all' || startDate || endDate;

  const showSuccess = (msg) => {
    setSuccess(msg);
    setTimeout(() => setSuccess(''), 3000);
  };

  const handleCreate = async (data) => {
    setSubmitting(true);
    setError('');
    try {
      await transactionsAPI.create(data);
      setModalOpen(false);
      showSuccess('Transaction added!');
      fetchTransactions();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create transaction');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdate = async (data) => {
    setSubmitting(true);
    setError('');
    try {
      await transactionsAPI.update(selectedTx._id, data);
      setModalOpen(false);
      setSelectedTx(null);
      showSuccess('Transaction updated!');
      fetchTransactions();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update transaction');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await transactionsAPI.delete(id);
      setDeleteConfirm(null);
      showSuccess('Transaction deleted');
      fetchTransactions();
    } catch {
      setError('Failed to delete transaction');
    }
  };

  const openEdit = (tx) => {
    setSelectedTx(tx);
    setModalOpen(true);
  };
  const openAdd = () => {
    setSelectedTx(null);
    setModalOpen(true);
  };
  const closeModal = () => {
    setModalOpen(false);
    setSelectedTx(null);
  };

  return (
    <div className="fade-in">
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '24px',
        }}
      >
        <div>
          <h1
            style={{
              fontSize: '1.75rem',
              fontWeight: '800',
              marginBottom: '4px',
            }}
          >
            💳 Transactions
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            {pagination.totalCount} transaction
            {pagination.totalCount !== 1 ? 's' : ''} total
          </p>
        </div>
        <button className="btn btn-primary" onClick={openAdd}>
          ➕ Add Transaction
        </button>
      </div>

      {success && <div className="alert alert-success">✅ {success}</div>}
      {error && (
        <div
          className="alert alert-error"
          style={{ cursor: 'pointer' }}
          onClick={() => setError('')}
        >
          ⚠️ {error}
        </div>
      )}

      {/* Filters */}
      <div className="card" style={{ marginBottom: '20px' }}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr 1fr',
            gap: '12px',
          }}
        >
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label" style={{ fontSize: '0.75rem' }}>
              🔍 Search
            </label>
            <input
              className="form-control"
              placeholder="Search by title or notes..."
              value={searchInput}
              onChange={handleSearchChange}
            />
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label" style={{ fontSize: '0.75rem' }}>
              Category
            </label>
            <select
              className="form-control"
              value={category}
              onChange={(e) => {
                setCategory(e.target.value);
                setPage(1);
              }}
            >
              <option value="all">All Categories</option>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label" style={{ fontSize: '0.75rem' }}>
              Type
            </label>
            <select
              className="form-control"
              value={type}
              onChange={(e) => {
                setType(e.target.value);
                setPage(1);
              }}
            >
              <option value="all">All Types</option>
              <option value="expense">Expense</option>
              <option value="income">Income</option>
            </select>
          </div>
        </div>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr 1fr auto',
            gap: '12px',
            marginTop: '12px',
            alignItems: 'end',
          }}
        >
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label" style={{ fontSize: '0.75rem' }}>
              From Date
            </label>
            <input
              type="date"
              className="form-control"
              value={startDate}
              onChange={(e) => {
                setStartDate(e.target.value);
                setPage(1);
              }}
            />
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label" style={{ fontSize: '0.75rem' }}>
              To Date
            </label>
            <input
              type="date"
              className="form-control"
              value={endDate}
              onChange={(e) => {
                setEndDate(e.target.value);
                setPage(1);
              }}
            />
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label" style={{ fontSize: '0.75rem' }}>
              Sort By
            </label>
            <select
              className="form-control"
              value={`${sortField}-${sortOrder}`}
              onChange={handleSortChange}
            >
              <option value="date-desc">Date (Newest First)</option>
              <option value="date-asc">Date (Oldest First)</option>
              <option value="amount-desc">Amount (High → Low)</option>
              <option value="amount-asc">Amount (Low → High)</option>
            </select>
          </div>
          {hasFilters && (
            <button
              className="btn btn-secondary"
              onClick={clearFilters}
              style={{ height: '40px' }}
            >
              Clear
            </button>
          )}
        </div>
        {hasFilters && (
          <div
            style={{
              marginTop: '10px',
              display: 'flex',
              flexWrap: 'wrap',
              gap: '6px',
              alignItems: 'center',
            }}
          >
            <span
              style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}
            >
              Active:
            </span>
            {search && (
              <FilterChip
                label={`"${search}"`}
                onRemove={() => {
                  setSearch('');
                  setSearchInput('');
                  setPage(1);
                }}
              />
            )}
            {category !== 'all' && (
              <FilterChip
                label={category}
                onRemove={() => {
                  setCategory('all');
                  setPage(1);
                }}
              />
            )}
            {type !== 'all' && (
              <FilterChip
                label={type}
                onRemove={() => {
                  setType('all');
                  setPage(1);
                }}
              />
            )}
            {startDate && (
              <FilterChip
                label={`From: ${startDate}`}
                onRemove={() => {
                  setStartDate('');
                  setPage(1);
                }}
              />
            )}
            {endDate && (
              <FilterChip
                label={`To: ${endDate}`}
                onRemove={() => {
                  setEndDate('');
                  setPage(1);
                }}
              />
            )}
          </div>
        )}
      </div>

      {/* Table */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {loading ? (
          <div
            style={{
              padding: '32px',
              display: 'flex',
              flexDirection: 'column',
              gap: '10px',
            }}
          >
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className="skeleton"
                style={{ height: '56px', borderRadius: '8px' }}
              />
            ))}
          </div>
        ) : transactions.length === 0 ? (
          <div className="empty-state">
            <div style={{ fontSize: '3rem', marginBottom: '12px' }}>
              {hasFilters ? '🔍' : '📭'}
            </div>
            <h3>
              {hasFilters
                ? 'No transactions match your filters'
                : 'No transactions yet'}
            </h3>
            <p style={{ marginBottom: '16px' }}>
              {hasFilters
                ? 'Try adjusting or clearing your filters'
                : 'Click "Add Transaction" to record your first one'}
            </p>
            {hasFilters ? (
              <button className="btn btn-secondary" onClick={clearFilters}>
                Clear Filters
              </button>
            ) : (
              <button className="btn btn-primary" onClick={openAdd}>
                ➕ Add Transaction
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Category</th>
                    <th>Date</th>
                    <th>Type</th>
                    <th style={{ textAlign: 'right' }}>Amount</th>
                    <th style={{ textAlign: 'center', width: '100px' }}>
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((t) => (
                    <tr
                      key={t._id}
                      style={{ cursor: 'pointer' }}
                      onClick={() => setDetailTx(t)}
                    >
                      <td>
                        <div
                          style={{
                            fontWeight: '600',
                            color: 'var(--text-primary)',
                          }}
                        >
                          {t.title}
                        </div>
                        {t.notes && (
                          <div
                            style={{
                              fontSize: '0.75rem',
                              color: 'var(--text-secondary)',
                              marginTop: '2px',
                            }}
                          >
                            {t.notes.length > 55
                              ? t.notes.substring(0, 55) + '…'
                              : t.notes}
                          </div>
                        )}
                      </td>
                      <td>
                        <span
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            padding: '3px 10px',
                            borderRadius: '6px',
                            fontSize: '0.75rem',
                            fontWeight: '600',
                            background:
                              (CATEGORY_COLORS[t.category] || '#94a3b8') + '22',
                            color: 'var(--text-primary)',
                          }}
                        >
                          {t.category}
                        </span>
                      </td>
                      <td
                        style={{
                          color: 'var(--text-secondary)',
                          fontSize: '0.85rem',
                        }}
                      >
                        {formatDate(t.date)}
                      </td>
                      <td>
                        <span className={`badge badge-${t.type}`}>
                          {t.type === 'income' ? '📈' : '📉'} {t.type}
                        </span>
                      </td>
                      <td
                        style={{
                          textAlign: 'right',
                          fontWeight: '700',
                          color:
                            t.type === 'income'
                              ? 'var(--success)'
                              : 'var(--danger)',
                        }}
                      >
                        {t.type === 'income' ? '+' : '-'}
                        {formatCurrency(t.amount)}
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <div
                          style={{
                            display: 'flex',
                            gap: '6px',
                            justifyContent: 'center',
                          }}
                          onClick={(e) => e.stopPropagation()}
                        >
                          <button
                            className="btn btn-secondary btn-sm btn-icon"
                            onClick={() => openEdit(t)}
                            title="Edit"
                          >
                            ✏️
                          </button>
                          <button
                            className="btn btn-danger btn-sm btn-icon"
                            onClick={() => setDeleteConfirm(t)}
                            title="Delete"
                          >
                            🗑️
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {pagination.totalPages > 1 && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '14px 20px',
                  borderTop: '1px solid var(--border)',
                }}
              >
                <span
                  style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}
                >
                  Page {pagination.currentPage} of {pagination.totalPages} ·{' '}
                  {pagination.totalCount} total
                </span>
                <div className="pagination">
                  <button
                    className="pagination-btn"
                    onClick={() => setPage(1)}
                    disabled={page === 1}
                  >
                    «
                  </button>
                  <button
                    className="pagination-btn"
                    onClick={() => setPage((p) => p - 1)}
                    disabled={page === 1}
                  >
                    ‹
                  </button>
                  {Array.from(
                    { length: Math.min(5, pagination.totalPages) },
                    (_, i) => {
                      let p = page - 2 + i;
                      if (p < 1) p = i + 1;
                      if (p > pagination.totalPages) return null;
                      return (
                        <button
                          key={p}
                          className={`pagination-btn ${p === page ? 'active' : ''}`}
                          onClick={() => setPage(p)}
                        >
                          {p}
                        </button>
                      );
                    },
                  )}
                  <button
                    className="pagination-btn"
                    onClick={() => setPage((p) => p + 1)}
                    disabled={page === pagination.totalPages}
                  >
                    ›
                  </button>
                  <button
                    className="pagination-btn"
                    onClick={() => setPage(pagination.totalPages)}
                    disabled={page === pagination.totalPages}
                  >
                    »
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      <TransactionModal
        isOpen={modalOpen}
        onClose={closeModal}
        onSubmit={selectedTx ? handleUpdate : handleCreate}
        transaction={selectedTx}
        loading={submitting}
      />

      {deleteConfirm && (
        <div className="modal-overlay">
          <div
            className="modal"
            style={{ maxWidth: '380px', textAlign: 'center' }}
          >
            <div style={{ fontSize: '3rem', marginBottom: '12px' }}>🗑️</div>
            <h3
              style={{
                fontSize: '1.1rem',
                fontWeight: '700',
                marginBottom: '8px',
              }}
            >
              Delete Transaction?
            </h3>
            <p
              style={{
                color: 'var(--text-secondary)',
                fontSize: '0.875rem',
                marginBottom: '4px',
              }}
            >
              <strong>"{deleteConfirm.title}"</strong>
            </p>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
              {formatCurrency(deleteConfirm.amount)} · This cannot be undone.
            </p>
            <div className="modal-actions" style={{ justifyContent: 'center' }}>
              <button
                className="btn btn-secondary"
                onClick={() => setDeleteConfirm(null)}
              >
                Cancel
              </button>
              <button
                className="btn btn-danger"
                onClick={() => handleDelete(deleteConfirm._id)}
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {detailTx && (
        <div className="modal-overlay" onClick={() => setDetailTx(null)}>
          <div
            className="modal"
            style={{ maxWidth: '420px' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h2 className="modal-title">Transaction Details</h2>
              <button
                className="btn btn-icon btn-secondary"
                onClick={() => setDetailTx(null)}
              >
                ✕
              </button>
            </div>
            <div
              style={{
                background: detailTx.type === 'income' ? '#dcfce7' : '#fee2e2',
                borderRadius: '12px',
                padding: '20px',
                textAlign: 'center',
                marginBottom: '20px',
              }}
            >
              <div
                style={{
                  fontSize: '2.2rem',
                  fontWeight: '800',
                  color:
                    detailTx.type === 'income'
                      ? 'var(--success)'
                      : 'var(--danger)',
                }}
              >
                {detailTx.type === 'income' ? '+' : '-'}
                {formatCurrency(detailTx.amount)}
              </div>
              <div
                style={{
                  fontSize: '1rem',
                  fontWeight: '600',
                  marginTop: '6px',
                }}
              >
                {detailTx.title}
              </div>
            </div>
            <DetailRow label="Category" value={detailTx.category} />
            <DetailRow
              label="Type"
              value={
                <span className={`badge badge-${detailTx.type}`}>
                  {detailTx.type}
                </span>
              }
            />
            <DetailRow label="Date" value={formatDate(detailTx.date)} />
            {detailTx.notes && (
              <DetailRow label="Notes" value={detailTx.notes} />
            )}
            <div className="modal-actions">
              <button
                className="btn btn-secondary"
                onClick={() => setDetailTx(null)}
              >
                Close
              </button>
              <button
                className="btn btn-primary"
                onClick={() => {
                  setDetailTx(null);
                  openEdit(detailTx);
                }}
              >
                ✏️ Edit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const FilterChip = ({ label, onRemove }) => (
  <span
    style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: '4px',
      padding: '3px 8px',
      background: 'var(--primary-light)',
      color: 'var(--primary-dark)',
      borderRadius: '20px',
      fontSize: '0.75rem',
      fontWeight: '600',
    }}
  >
    {label}
    <button
      onClick={onRemove}
      style={{
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        color: 'inherit',
        padding: 0,
        lineHeight: 1,
        fontSize: '1rem',
      }}
    >
      ×
    </button>
  </span>
);

const DetailRow = ({ label, value }) => (
  <div
    style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '10px 0',
      borderBottom: '1px solid var(--border)',
    }}
  >
    <span
      style={{
        fontSize: '0.78rem',
        color: 'var(--text-secondary)',
        fontWeight: '700',
        textTransform: 'uppercase',
        letterSpacing: '0.05em',
      }}
    >
      {label}
    </span>
    <span
      style={{
        fontSize: '0.9rem',
        color: 'var(--text-primary)',
        fontWeight: '500',
      }}
    >
      {value}
    </span>
  </div>
);

export default TransactionsPage;
