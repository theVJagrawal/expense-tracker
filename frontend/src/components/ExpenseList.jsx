import { useState, useEffect } from 'react';
import { fetchExpenses } from '../api/expenseApi';
import './ExpenseList.css';

/**
 * Expense list component with filtering and sorting
 * 
 * Features:
 * - Category filter
 * - Date sorting (newest first)
 * - Total calculation for visible expenses
 * - Loading and error states
 */
export default function ExpenseList({ refreshTrigger }) {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [filterCategory, setFilterCategory] = useState('');
  const [sortOrder, setSortOrder] = useState('');

  // Load expenses on mount and when filters/sort change
  useEffect(() => {
    loadExpenses();
  }, [filterCategory, sortOrder, refreshTrigger]);

  const loadExpenses = async () => {
    try {
      setLoading(true);
      setError(null);

      const data = await fetchExpenses({
        category: filterCategory || undefined,
        sort: sortOrder || undefined,
      });

      setExpenses(data);
    } catch (err) {
      console.error('Error loading expenses:', err);
      setError('Failed to load expenses. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const calculateTotal = () => {
    return expenses.reduce((sum, expense) => sum + parseFloat(expense.amount), 0);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="expense-list-card">
        <h2>Expenses</h2>
        <div className="loading">Loading expenses...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="expense-list-card">
        <h2>Expenses</h2>
        <div className="error-state">{error}</div>
        <button onClick={loadExpenses} className="btn btn-secondary">
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="expense-list-card">
      <div className="section-header">
        <h2>Expenses</h2>
        <div className="controls">
          <div className="control-group">
            <label htmlFor="filter-category">Filter:</label>
            <select
              id="filter-category"
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
            >
              <option value="">All Categories</option>
              <option value="Food">Food</option>
              <option value="Transport">Transport</option>
              <option value="Shopping">Shopping</option>
              <option value="Entertainment">Entertainment</option>
              <option value="Healthcare">Healthcare</option>
              <option value="Utilities">Utilities</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div className="control-group">
            <label htmlFor="sort-order">Sort:</label>
            <select
              id="sort-order"
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
            >
              <option value="">Default</option>
              <option value="date_desc">Newest First</option>
            </select>
          </div>
        </div>
      </div>

      <div className="total">
        Total: ₹{calculateTotal().toFixed(2)}
      </div>

      {expenses.length === 0 ? (
        <div className="empty-state">
          No expenses found. Add your first expense above!
        </div>
      ) : (
        <div className="expense-list">
          {expenses.map((expense) => (
            <div key={expense.id} className="expense-item">
              <div className="expense-amount">
                ₹{parseFloat(expense.amount).toFixed(2)}
              </div>
              <div className="expense-category">{expense.category}</div>
              <div className="expense-details">
                {expense.description && (
                  <div className="expense-description">{expense.description}</div>
                )}
                <div className="expense-date">{formatDate(expense.date)}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
