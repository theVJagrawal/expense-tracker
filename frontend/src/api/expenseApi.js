/**
 * API service for communicating with the backend
 * 
 * Centralizes all HTTP calls for:
 * - Consistency
 * - Error handling
 * - Easy testing/mocking
 */

const API_BASE_URL = 'http://localhost:8080';

/**
 * Create a new expense (idempotent)
 * 
 * @param {Object} expenseData - { amount, category, description, date, clientRequestId }
 * @returns {Promise<Object>} Created expense
 * @throws {Error} If request fails
 */
export async function createExpense(expenseData) {
  const response = await fetch(`${API_BASE_URL}/expenses`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(expenseData),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to create expense');
  }

  return response.json();
}

/**
 * Fetch expenses with optional filters
 * 
 * @param {Object} params - { category?, sort? }
 * @returns {Promise<Array>} List of expenses
 * @throws {Error} If request fails
 */
export async function fetchExpenses({ category, sort } = {}) {
  const params = new URLSearchParams();
  
  if (category) {
    params.append('category', category);
  }
  
  if (sort) {
    params.append('sort', sort);
  }

  const url = `${API_BASE_URL}/expenses${params.toString() ? '?' + params.toString() : ''}`;
  
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error('Failed to fetch expenses');
  }

  return response.json();
}
