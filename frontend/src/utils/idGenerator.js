/**
 * Generate a unique client request ID for idempotency
 * 
 * Format: timestamp-randomString
 * 
 * This ensures:
 * - Uniqueness across page refreshes (timestamp)
 * - Collision resistance (random component)
 * - Sortability (timestamp prefix)
 * 
 * @returns {string} Unique client request ID
 */
export function generateClientRequestId() {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 11);
  return `${timestamp}-${random}`;
}
