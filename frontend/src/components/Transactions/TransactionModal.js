import { useState, useEffect } from 'react';
import { CATEGORIES, formatDateInput } from '../../utils/api';

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
      className="modal-overlay"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="modal">
        <div className="modal-header">
          <h2 className="modal-title">
            {transaction ? '✏️ Edit Transaction' : '➕ New Transaction'}
          </h2>
          <button className="btn btn-icon btn-secondary" onClick={onClose}>
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Type</label>
            <div style={{ display: 'flex', gap: '8px' }}>
              {['expense', 'income'].map((t) => (
                <button
                  key={t}
                  type="button"
                  className={`btn ${form.type === t ? (t === 'expense' ? 'btn-danger' : 'btn-success') : 'btn-secondary'}`}
                  style={{ flex: 1, justifyContent: 'center' }}
                  onClick={() => setForm((p) => ({ ...p, type: t }))}
                >
                  {t === 'expense' ? '📉 Expense' : '📈 Income'}
                </button>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Title *</label>
            <input
              name="title"
              className={`form-control ${errors.title ? 'error' : ''}`}
              placeholder="e.g. Grocery shopping, Salary..."
              value={form.title}
              onChange={handleChange}
            />
            {errors.title && <span className="form-error">{errors.title}</span>}
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '12px',
            }}
          >
            <div className="form-group">
              <label className="form-label">Amount (₹) *</label>
              <input
                name="amount"
                type="number"
                step="0.01"
                min="0.01"
                className={`form-control ${errors.amount ? 'error' : ''}`}
                placeholder="0.00"
                value={form.amount}
                onChange={handleChange}
              />
              {errors.amount && (
                <span className="form-error">{errors.amount}</span>
              )}
            </div>
            <div className="form-group">
              <label className="form-label">Date *</label>
              <input
                name="date"
                type="date"
                max={TODAY}
                className={`form-control ${errors.date ? 'error' : ''}`}
                value={form.date}
                onChange={handleChange}
              />
              {errors.date && <span className="form-error">{errors.date}</span>}
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Category *</label>
            <select
              name="category"
              className="form-control"
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

          <div className="form-group">
            <label className="form-label">
              Notes{' '}
              <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>
                (optional)
              </span>
            </label>
            <textarea
              name="notes"
              className="form-control"
              rows={3}
              maxLength={500}
              placeholder="Add any additional details..."
              value={form.notes}
              onChange={handleChange}
              style={{ resize: 'vertical', minHeight: '80px' }}
            />
            <div
              style={{
                fontSize: '0.75rem',
                color: 'var(--text-muted)',
                textAlign: 'right',
                marginTop: '4px',
              }}
            >
              {form.notes.length}/500
            </div>
          </div>

          <div className="modal-actions">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? (
                <>
                  <div className="spinner" /> Saving...
                </>
              ) : transaction ? (
                'Update'
              ) : (
                'Add Transaction'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TransactionModal;
