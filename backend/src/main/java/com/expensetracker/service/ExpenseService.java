package com.expensetracker.service;

import com.expensetracker.dto.CreateExpenseRequest;
import com.expensetracker.model.Expense;
import com.expensetracker.storage.ExpenseStorage;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.Comparator;
import java.util.List;
import java.util.UUID;

/**
 * Expense service - contains all business logic
 * 
 * Responsibilities:
 * - Coordinate expense creation with idempotency
 * - Apply business rules and validation
 * - Handle sorting logic
 * 
 * Separated from controller for:
 * - Testability (can unit test without HTTP layer)
 * - Reusability (can be called from multiple controllers)
 * - Clarity (single responsibility principle)
 */
@Service
public class ExpenseService {
    
    private static final Logger logger = LoggerFactory.getLogger(ExpenseService.class);
    
    private final ExpenseStorage storage;
    
    public ExpenseService(ExpenseStorage storage) {
        this.storage = storage;
    }
    
    /**
     * Create a new expense with idempotency guarantee
     * 
     * Critical behavior:
     * - If clientRequestId already exists, return the existing expense
     * - This handles: retries, duplicate clicks, page refreshes
     * 
     * @param request validated expense creation request
     * @return created or existing expense
     */
    public Expense createExpense(CreateExpenseRequest request) {
        // Check for existing expense (idempotency)
        return storage.findByClientRequestId(request.getClientRequestId())
                .orElseGet(() -> {
                    // Create new expense
                    Expense expense = Expense.builder()
                            .id(UUID.randomUUID().toString())
                            .amount(request.getAmount())
                            .category(request.getCategory().trim())
                            .description(request.getDescription() != null ? 
                                       request.getDescription().trim() : "")
                            .date(request.getDate())
                            .createdAt(Instant.now())
                            .clientRequestId(request.getClientRequestId())
                            .build();
                    
                    return storage.save(expense);
                });
    }
    
    /**
     * Get expenses with optional filtering and sorting
     * 
     * @param category optional category filter
     * @param sort optional sort parameter ("date_desc" for newest first)
     * @return list of expenses
     */
    public List<Expense> getExpenses(String category, String sort) {
        List<Expense> expenses = storage.findAll(category);
        
        // Apply sorting if requested
        if ("date_desc".equals(sort)) {
            expenses = sortByDateDescending(expenses);
        }
        
        return expenses;
    }
    
    /**
     * Sort expenses by date descending (newest first)
     * 
     * Stable sort using createdAt as tiebreaker:
     * - Primary: date descending
     * - Secondary: createdAt descending (ensures deterministic order)
     * 
     * This ensures that expenses on the same date always appear
     * in the same order across multiple requests.
     */
    private List<Expense> sortByDateDescending(List<Expense> expenses) {
        return expenses.stream()
                .sorted(Comparator
                        .comparing(Expense::getDate).reversed()
                        .thenComparing(Comparator.comparing(Expense::getCreatedAt).reversed()))
                .toList();
    }
    
    /**
     * Get total count of expenses
     * Useful for monitoring
     */
    public long getCount() {
        return storage.count();
    }
}
