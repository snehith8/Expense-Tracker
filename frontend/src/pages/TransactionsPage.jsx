import { useState, useEffect, useCallback, useRef } from 'react';
import {
  transactionsAPI,
  formatCurrency,
  formatDate,
  CATEGORIES,
  CATEGORY_COLORS,
} from '../utils/api';
import TransactionModal from '../components/Transactions/TransactionModal';
import '../CSS/TransactionsPage.css';

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
  const tableContainerRef = useRef(null);
  const isHoveredRef = useRef(false);

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

  // Smooth auto-scroll loop with pause on hover
  useEffect(() => {
    const el = tableContainerRef.current;
    if (!el || transactions.length <= 5) return;

    const scrollSpeed = 0.55;
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
  }, [transactions]);

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
    <div className="tx-container fade-in">
      {/* Pinned Header */}
      <div className="tx-header">
        <div>
          <h1 className="tx-title">Transactions</h1>
          <p className="tx-subtitle">
            {pagination.totalCount} transaction
            {pagination.totalCount !== 1 ? 's' : ''} recorded (hover to pause
            scroll)
          </p>
        </div>
        <button className="btn-add-tx" onClick={openAdd}>
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
          Add Transaction
        </button>
      </div>

      {/* Scrollable Body */}
      <div className="tx-scrollable-body">
        {/* Notifications */}
        {success && (
          <div className="tx-alert tx-alert-success">
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <polyline points="20 6 9 17 4 12" />
            </svg>
            <span>{success}</span>
          </div>
        )}
        {error && (
          <div className="tx-alert tx-alert-error" onClick={() => setError('')}>
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            <span>{error}</span>
          </div>
        )}

        {/* Filter Card */}
        <div className="tx-filter-card">
          <div className="tx-filter-grid-top">
            <div className="tx-field">
              <label className="tx-label">Search</label>
              <div className="tx-input-wrapper">
                <svg
                  className="tx-input-icon"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
                <input
                  className="tx-input"
                  placeholder="Search by title or notes..."
                  value={searchInput}
                  onChange={handleSearchChange}
                />
              </div>
            </div>
            <div className="tx-field">
              <label className="tx-label">Category</label>
              <select
                className="tx-select"
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
            <div className="tx-field">
              <label className="tx-label">Type</label>
              <select
                className="tx-select"
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

          <div className="tx-filter-grid-bottom">
            <div className="tx-field">
              <label className="tx-label">From Date</label>
              <input
                type="date"
                className="tx-input tx-date-input"
                value={startDate}
                onChange={(e) => {
                  setStartDate(e.target.value);
                  setPage(1);
                }}
              />
            </div>
            <div className="tx-field">
              <label className="tx-label">To Date</label>
              <input
                type="date"
                className="tx-input tx-date-input"
                value={endDate}
                onChange={(e) => {
                  setEndDate(e.target.value);
                  setPage(1);
                }}
              />
            </div>
            <div className="tx-field">
              <label className="tx-label">Sort Order</label>
              <select
                className="tx-select"
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
              <button className="tx-btn-clear" onClick={clearFilters}>
                Clear
              </button>
            )}
          </div>

          {hasFilters && (
            <div className="tx-chip-container">
              <span className="tx-chip-legend">Active Filters:</span>
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

        {/* Table Container Card */}
        <div className="tx-table-card">
          {loading ? (
            <div className="tx-skeleton-wrapper">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="tx-skeleton-row" />
              ))}
            </div>
          ) : transactions.length === 0 ? (
            <div className="tx-empty-state">
              <div className="empty-state-icon-box">
                <svg
                  width="32"
                  height="32"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#818cf8"
                  strokeWidth="1.8"
                >
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
              </div>
              <h3>
                {hasFilters
                  ? 'No matching records'
                  : 'No transactions recorded'}
              </h3>
              <p>
                {hasFilters
                  ? 'Try resetting your search query or date range filters'
                  : 'Click "Add Transaction" to start recording your ledger entries'}
              </p>
              {hasFilters ? (
                <button className="tx-btn-outline" onClick={clearFilters}>
                  Clear All Filters
                </button>
              ) : (
                <button className="btn-add-tx" onClick={openAdd}>
                  Add Transaction
                </button>
              )}
            </div>
          ) : (
            <>
              <div
                className="tx-table-wrapper auto-scroll-container"
                ref={tableContainerRef}
                onMouseEnter={() => {
                  isHoveredRef.current = true;
                }}
                onMouseLeave={() => {
                  isHoveredRef.current = false;
                }}
              >
                <table className="tx-table">
                  <thead>
                    <tr>
                      <th>Title</th>
                      <th>Category</th>
                      <th>Date</th>
                      <th>Type</th>
                      <th className="text-right">Amount</th>
                      <th className="text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transactions.map((t) => {
                      const isInc = t.type === 'income';
                      const catColor = CATEGORY_COLORS[t.category] || '#818cf8';
                      return (
                        <tr
                          key={t._id}
                          className="tx-row"
                          onClick={() => setDetailTx(t)}
                        >
                          <td>
                            <div className="tx-title-text">{t.title}</div>
                            {t.notes && (
                              <div className="tx-notes-text">
                                {t.notes.length > 50
                                  ? `${t.notes.substring(0, 50)}…`
                                  : t.notes}
                              </div>
                            )}
                          </td>
                          <td>
                            <span
                              className="tx-category-badge"
                              style={{
                                color: catColor,
                                backgroundColor: `${catColor}1c`,
                                borderColor: `${catColor}33`,
                              }}
                            >
                              {t.category}
                            </span>
                          </td>
                          <td className="tx-date-cell">{formatDate(t.date)}</td>
                          <td>
                            <span
                              className={`tx-type-pill ${isInc ? 'pill-income' : 'pill-expense'}`}
                            >
                              {isInc ? 'Income' : 'Expense'}
                            </span>
                          </td>
                          <td
                            className={`tx-amount-cell text-right ${isInc ? 'amount-income' : 'amount-expense'}`}
                          >
                            {isInc ? '+' : '-'} {formatCurrency(t.amount)}
                          </td>
                          <td className="text-center">
                            <div
                              className="tx-actions"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <button
                                className="btn-action-icon edit-action"
                                onClick={() => openEdit(t)}
                                title="Edit transaction"
                              >
                                <svg
                                  width="15"
                                  height="15"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                >
                                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                                </svg>
                              </button>
                              <button
                                className="btn-action-icon delete-action"
                                onClick={() => setDeleteConfirm(t)}
                                title="Delete transaction"
                              >
                                <svg
                                  width="15"
                                  height="15"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                >
                                  <polyline points="3 6 5 6 21 6" />
                                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                                </svg>
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Pagination Controls */}
              {pagination.totalPages > 1 && (
                <div className="tx-pagination-bar">
                  <span className="tx-pagination-info">
                    Page {pagination.currentPage} of {pagination.totalPages} ·{' '}
                    {pagination.totalCount} total
                  </span>
                  <div className="tx-pagination-controls">
                    <button
                      className="tx-pg-btn"
                      onClick={() => setPage(1)}
                      disabled={page === 1}
                    >
                      «
                    </button>
                    <button
                      className="tx-pg-btn"
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
                            className={`tx-pg-btn ${p === page ? 'active' : ''}`}
                            onClick={() => setPage(p)}
                          >
                            {p}
                          </button>
                        );
                      },
                    )}
                    <button
                      className="tx-pg-btn"
                      onClick={() => setPage((p) => p + 1)}
                      disabled={page === pagination.totalPages}
                    >
                      ›
                    </button>
                    <button
                      className="tx-pg-btn"
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
      </div>

      {/* Modals outside scrollable body */}
      <TransactionModal
        isOpen={modalOpen}
        onClose={closeModal}
        onSubmit={selectedTx ? handleUpdate : handleCreate}
        transaction={selectedTx}
        loading={submitting}
      />

      {deleteConfirm && (
        <div className="tx-modal-overlay">
          <div className="tx-modal-box confirm-box">
            <div className="modal-warning-icon">
              <svg
                width="28"
                height="28"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#f87171"
                strokeWidth="2"
              >
                <polyline points="3 6 5 6 21 6" />
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
              </svg>
            </div>
            <h3 className="confirm-title">Delete Transaction?</h3>
            <p className="confirm-name">"{deleteConfirm.title}"</p>
            <p className="confirm-sub">
              {formatCurrency(deleteConfirm.amount)} · This operation cannot be
              reversed.
            </p>
            <div className="confirm-actions">
              <button
                className="tx-btn-secondary"
                onClick={() => setDeleteConfirm(null)}
              >
                Cancel
              </button>
              <button
                className="tx-btn-danger"
                onClick={() => handleDelete(deleteConfirm._id)}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {detailTx && (
        <div className="tx-modal-overlay" onClick={() => setDetailTx(null)}>
          <div
            className="tx-modal-box detail-box"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="tx-modal-header">
              <h2 className="detail-heading">Transaction Overview</h2>
              <button
                className="tx-btn-close"
                onClick={() => setDetailTx(null)}
              >
                ✕
              </button>
            </div>

            <div
              className={`detail-hero-banner ${detailTx.type === 'income' ? 'hero-income' : 'hero-expense'}`}
            >
              <div className="detail-hero-amount">
                {detailTx.type === 'income' ? '+' : '-'}{' '}
                {formatCurrency(detailTx.amount)}
              </div>
              <div className="detail-hero-title">{detailTx.title}</div>
            </div>

            <div className="detail-specs">
              <DetailRow label="Category" value={detailTx.category} />
              <DetailRow
                label="Type"
                value={
                  <span
                    className={`tx-type-pill ${detailTx.type === 'income' ? 'pill-income' : 'pill-expense'}`}
                  >
                    {detailTx.type}
                  </span>
                }
              />
              <DetailRow label="Date" value={formatDate(detailTx.date)} />
              {detailTx.notes && (
                <DetailRow label="Notes" value={detailTx.notes} />
              )}
            </div>

            <div className="detail-modal-footer">
              <button
                className="tx-btn-secondary"
                onClick={() => setDetailTx(null)}
              >
                Close
              </button>
              <button
                className="btn-add-tx"
                onClick={() => {
                  setDetailTx(null);
                  openEdit(detailTx);
                }}
              >
                Edit Transaction
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const FilterChip = ({ label, onRemove }) => (
  <span className="tx-filter-chip">
    <span>{label}</span>
    <button onClick={onRemove} className="tx-chip-btn">
      ×
    </button>
  </span>
);

const DetailRow = ({ label, value }) => (
  <div className="detail-row">
    <span className="detail-label">{label}</span>
    <span className="detail-value">{value}</span>
  </div>
);

export default TransactionsPage;
