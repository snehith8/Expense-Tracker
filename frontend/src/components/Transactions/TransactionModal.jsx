import { useState, useEffect } from 'react';
import { CATEGORIES, formatDateInput } from '../../utils/api';
import '../../CSS/TransactionModal.css';
const TODAY = formatDateInput(new Date());

const DEFAULT_FORM = {
  title: '',
  amount: '',
  category: 'Food & Dining',
  date: TODAY,
  notes: '',
  type: 'expense',
};

const TransactionModal = ({
  isOpen,
  onClose,
  onSubmit,
  transaction,
  loading,
}) => {
  const [form, setForm] = useState(DEFAULT_FORM);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    setForm(
      transaction
        ? {
            title: transaction.title || '',
            amount: transaction.amount?.toString() || '',
            category: transaction.category || 'Food & Dining',
            date: formatDateInput(transaction.date) || TODAY,
            notes: transaction.notes || '',
            type: transaction.type || 'expense',
          }
        : DEFAULT_FORM,
    );
    setErrors({});
  }, [transaction, isOpen]);

  const validate = () => {
    const e = {};
    if (!form.title.trim()) e.title = 'Title is required';
    if (!form.amount || isNaN(form.amount) || parseFloat(form.amount) <= 0)
      e.amount = 'Valid amount required';
    if (!form.date) e.date = 'Date is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleChange = ({ target: { name, value } }) => {
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) onSubmit({ ...form, amount: parseFloat(form.amount) });
  };

  if (!isOpen) return null;

  return (
    <div
      className="tx-modal-backdrop"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="tx-modal-window">
        {/* Modal Header */}
        <div className="tx-modal-top">
          <div className="tx-modal-title-wrap">
            <div className="tx-modal-icon-badge">
              {transaction ? (
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
                >
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                </svg>
              ) : (
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
                >
                  <line x1="12" y1="5" x2="12" y2="19" />
                  <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
              )}
            </div>
            <div>
              <h2 className="tx-modal-heading">
                {transaction ? 'Edit Transaction' : 'New Transaction'}
              </h2>
              <p className="tx-modal-subheading">
                {transaction
                  ? 'Update existing ledger record'
                  : 'Add a new expense or income item'}
              </p>
            </div>
          </div>
          <button
            className="tx-modal-dismiss-btn"
            onClick={onClose}
            aria-label="Close modal"
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="tx-modal-form">
          {/* Type Toggle */}
          <div className="tx-form-field">
            <label className="tx-field-label">Transaction Type</label>
            <div className="tx-type-selector">
              <button
                type="button"
                className={`tx-type-choice expense ${form.type === 'expense' ? 'selected' : ''}`}
                onClick={() => setForm((p) => ({ ...p, type: 'expense' }))}
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
                >
                  <polyline points="23 18 13.5 8.5 8.5 13.5 1 6" />
                  <polyline points="17 18 23 18 23 12" />
                </svg>
                Expense
              </button>
              <button
                type="button"
                className={`tx-type-choice income ${form.type === 'income' ? 'selected' : ''}`}
                onClick={() => setForm((p) => ({ ...p, type: 'income' }))}
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
                >
                  <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
                  <polyline points="17 6 23 6 23 12" />
                </svg>
                Income
              </button>
            </div>
          </div>

          {/* Title */}
          <div className="tx-form-field">
            <label className="tx-field-label">Title *</label>
            <input
              name="title"
              className={`tx-modal-input ${errors.title ? 'field-error' : ''}`}
              placeholder="e.g. Grocery shopping, Salary, Cloud subscription..."
              value={form.title}
              onChange={handleChange}
            />
            {errors.title && (
              <span className="tx-error-hint">{errors.title}</span>
            )}
          </div>

          {/* Amount & Date */}
          <div className="tx-form-row">
            <div className="tx-form-field">
              <label className="tx-field-label">Amount (₹) *</label>
              <div className="tx-input-prefix-box">
                <span className="tx-currency-symbol">₹</span>
                <input
                  name="amount"
                  type="number"
                  step="0.01"
                  min="0.01"
                  className={`tx-modal-input prefixed ${errors.amount ? 'field-error' : ''}`}
                  placeholder="0.00"
                  value={form.amount}
                  onChange={handleChange}
                />
              </div>
              {errors.amount && (
                <span className="tx-error-hint">{errors.amount}</span>
              )}
            </div>

            <div className="tx-form-field">
              <label className="tx-field-label">Date *</label>
              <input
                name="date"
                type="date"
                max={TODAY}
                className={`tx-modal-input tx-date-picker ${errors.date ? 'field-error' : ''}`}
                value={form.date}
                onChange={handleChange}
              />
              {errors.date && (
                <span className="tx-error-hint">{errors.date}</span>
              )}
            </div>
          </div>

          {/* Category */}
          <div className="tx-form-field">
            <label className="tx-field-label">Category *</label>
            <select
              name="category"
              className="tx-modal-select"
              value={form.category}
              onChange={handleChange}
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          {/* Notes */}
          <div className="tx-form-field">
            <div className="tx-label-counter-row">
              <label className="tx-field-label">
                Notes <span className="tx-optional-tag">(optional)</span>
              </label>
              <span className="tx-char-counter">{form.notes.length}/500</span>
            </div>
            <textarea
              name="notes"
              className="tx-modal-textarea"
              rows={3}
              maxLength={500}
              placeholder="Add payment method, vendor name, or additional details..."
              value={form.notes}
              onChange={handleChange}
            />
          </div>

          {/* Action Buttons */}
          <div className="tx-modal-actions">
            <button type="button" className="tx-btn-cancel" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="tx-btn-save" disabled={loading}>
              {loading ? (
                <>
                  <span className="tx-save-spinner" />
                  Saving...
                </>
              ) : transaction ? (
                'Save Changes'
              ) : (
                'Add Record'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TransactionModal;
