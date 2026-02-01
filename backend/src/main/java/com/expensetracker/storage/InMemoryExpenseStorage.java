package com.expensetracker.storage;

import com.expensetracker.model.Expense;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Repository;

import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.CopyOnWriteArrayList;
import java.util.stream.Collectors;

/**
 * In-memory implementation of ExpenseStorage
 * 
 * Design decisions:
 * 1. ConcurrentHashMap for thread-safe O(1) idempotency lookups
 * 2. CopyOnWriteArrayList for thread-safe ordered storage
 *    - Safe for concurrent reads (common case)
 *    - Write penalty acceptable for this use case
 * 3. Synchronized save() method for atomicity
 * 
 * Trade-offs:
 * - Data lost on restart (acceptable for timebox)
 * - Memory grows unbounded (acceptable for demo)
 * - CopyOnWriteArrayList has O(n) writes but O(1) reads
 * - No persistence layer (easily replaceable via interface)
 * 
 * Thread safety:
 * - ConcurrentHashMap: thread-safe without external synchronization
 * - CopyOnWriteArrayList: thread-safe for reads, synchronized for writes
 * - save() method synchronized to prevent race conditions between check and insert
 */
@Repository
public class InMemoryExpenseStorage implements ExpenseStorage {
    
    private static final Logger logger = LoggerFactory.getLogger(InMemoryExpenseStorage.class);
    
    // Fast O(1) lookup for idempotency checks
    // ConcurrentHashMap provides thread-safe operations without locking
    private final Map<String, Expense> idempotencyMap = new ConcurrentHashMap<>();
    
    // Ordered list maintaining insertion order
    // CopyOnWriteArrayList is thread-safe and optimized for read-heavy workloads
    private final List<Expense> expenses = new CopyOnWriteArrayList<>();
    
    @Override
    public Optional<Expense> findByClientRequestId(String clientRequestId) {
        return Optional.ofNullable(idempotencyMap.get(clientRequestId));
    }
    
    @Override
    public synchronized Expense save(Expense expense) {
        // Critical section: check-then-act must be atomic
        // synchronized ensures no race condition between check and insert
        
        // Double-check for idempotency (defensive programming)
        Expense existing = idempotencyMap.get(expense.getClientRequestId());
        if (existing != null) {
            logger.debug("Expense with clientRequestId {} already exists, returning existing", 
                        expense.getClientRequestId());
            return existing;
        }
        
        // Store in both data structures
        idempotencyMap.put(expense.getClientRequestId(), expense);
        expenses.add(expense);
        
        logger.info("Created expense: id={}, amount={}, category={}", 
                   expense.getId(), expense.getAmount(), expense.getCategory());
        
        return expense;
    }
    
    @Override
    public List<Expense> findAll(String category) {
        if (category == null || category.isBlank()) {
            // Return copy to prevent external modification
            return new ArrayList<>(expenses);
        }
        
        // Filter by category (case-insensitive)
        return expenses.stream()
                .filter(expense -> expense.getCategory().equalsIgnoreCase(category))
                .collect(Collectors.toList());
    }
    
    @Override
    public long count() {
        return expenses.size();
    }
    
    /**
     * Clear all data - useful for testing
     * Not exposed via interface (implementation-specific)
     */
    public void clear() {
        logger.warn("Clearing all expense data");
        idempotencyMap.clear();
        expenses.clear();
    }
}
