import { useState, useRef } from 'react';
import { createExpense } from '../api/expenseApi';
import { generateClientRequestId } from '../utils/idGenerator';
import './ExpenseForm.css';

/**
 * Expense form component with idempotent submission
 * 
 * Critical behavior:
 * - Generates clientRequestId once per logical submission
 * - Prevents duplicate submissions during processing
 * - Safe against retries and refreshes
 * - Shows loading and error states
 */
export default function ExpenseForm({ onExpenseCreated }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });
  
  // Use ref to store clientRequestId - persists across renders
  // This ensures same ID is used for retries of the same form state
  const clientRequestIdRef = useRef(null);
  
  const getTodayDate = () => {
    return new Date().toISOString().split('T')[0];
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Prevent double submission
    if (isSubmitting) {
      console.log('Submission already in progress');
      return;
    }

    // Generate new ID if this is a fresh submission
    if (!clientRequestIdRef.current) {
      clientRequestIdRef.current = generateClientRequestId();
    }

    const formData = new FormData(e.target);
    
    const expenseData = {
      amount: parseFloat(formData.get('amount')),
      category: formData.get('category'),
      description: formData.get('description') || '',
      date: formData.get('date'),
      clientRequestId: clientRequestIdRef.current,
    };

    try {
      setIsSubmitting(true);
      setMessage({ text: '', type: '' });

      const expense = await createExpense(expenseData);

      // Success
      setMessage({ text: 'Expense added successfully!', type: 'success' });
      
      // Reset form
      e.target.reset();
      e.target.elements.date.value = getTodayDate();
      
      // Clear request ID for next submission
      clientRequestIdRef.current = null;
      
      // Notify parent to reload expenses
      if (onExpenseCreated) {
        onExpenseCreated(expense);
      }

      // Clear success message after 3 seconds
      setTimeout(() => {
        setMessage({ text: '', type: '' });
      }, 3000);

    } catch (error) {
      console.error('Error creating expense:', error);
      setMessage({ text: `Error: ${error.message}`, type: 'error' });
      
      // Keep clientRequestId for retry with same ID
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="expense-form-card">
      <h2>Add Expense</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="amount">Amount (₹)</label>
          <input
            type="number"
            id="amount"
            name="amount"
            step="0.01"
            min="0.01"
            placeholder="100.00"
            required
            disabled={isSubmitting}
          />
        </div>

        <div className="form-group">
          <label htmlFor="category">Category</label>
          <select
            id="category"
            name="category"
            required
            disabled={isSubmitting}
          >
            <option value="">Select category...</option>
            <option value="Food">Food</option>
            <option value="Transport">Transport</option>
            <option value="Shopping">Shopping</option>
            <option value="Entertainment">Entertainment</option>
            <option value="Healthcare">Healthcare</option>
            <option value="Utilities">Utilities</option>
            <option value="Other">Other</option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="description">Description (optional)</label>
          <input
            type="text"
            id="description"
            name="description"
            placeholder="Coffee at cafe"
            maxLength="500"
            disabled={isSubmitting}
          />
        </div>

        <div className="form-group">
          <label htmlFor="date">Date</label>
          <input
            type="date"
            id="date"
            name="date"
            defaultValue={getTodayDate()}
            required
            disabled={isSubmitting}
          />
        </div>

        <div className="form-actions">
          <button
            type="submit"
            className="btn btn-primary"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Adding...' : 'Add Expense'}
          </button>
        </div>

        {message.text && (
          <div className={`message ${message.type}`}>
            {message.text}
          </div>
        )}
      </form>
    </div>
  );
}
