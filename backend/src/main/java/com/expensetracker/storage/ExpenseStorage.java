package com.expensetracker.storage;

import com.expensetracker.model.Expense;

import java.util.List;
import java.util.Optional;

/**
 * Storage interface for expense persistence
 * 
 * Design principle: Abstraction for easy replacement
 * 
 * This interface defines the contract for expense storage.
 * The in-memory implementation can be replaced with a database
 * implementation (JPA, JDBC, etc.) without changing any business logic.
 * 
 * Trade-off: Using an interface adds a layer of indirection but provides
 * flexibility and follows the Dependency Inversion Principle.
 */
public interface ExpenseStorage {
    
    /**
     * Find expense by client request ID
     * Critical for idempotency - check if request already processed
     * 
     * @param clientRequestId unique client-generated ID
     * @return Optional containing expense if found
     */
    Optional<Expense> findByClientRequestId(String clientRequestId);
    
    /**
     * Save a new expense
     * Must be thread-safe to handle concurrent requests
     * 
     * @param expense expense to save
     * @return saved expense
     */
    Expense save(Expense expense);
    
    /**
     * Find all expenses, optionally filtered by category
     * 
     * @param category optional category filter (null = no filter)
     * @return list of expenses
     */
    List<Expense> findAll(String category);
    
    /**
     * Get total count of expenses
     * Useful for monitoring and health checks
     * 
     * @return total number of expenses
     */
    long count();
}
