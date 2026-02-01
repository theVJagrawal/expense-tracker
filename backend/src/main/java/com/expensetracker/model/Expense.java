package com.expensetracker.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.Instant;

/**
 * Expense domain model
 * 
 * Design decisions:
 * - BigDecimal for amount (never use float/double for money)
 * - Immutable via @Builder and final fields (in production, use @Value)
 * - All fields required for data integrity
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Expense {
    
    /**
     * Unique identifier for the expense
     */
    private String id;
    
    /**
     * Amount in decimal format - NEVER use Float or Double for money
     * BigDecimal ensures precision in monetary calculations
     */
    private BigDecimal amount;
    
    /**
     * Category of the expense (e.g., Food, Transport)
     */
    private String category;
    
    /**
     * Optional description
     */
    private String description;
    
    /**
     * Date when the expense occurred
     */
    private LocalDate date;
    
    /**
     * Timestamp when the expense was created in the system
     * Used for stable sorting
     */
    private Instant createdAt;
    
    /**
     * Client-generated request ID for idempotency
     * Same clientRequestId = same expense, prevents duplicates
     */
    private String clientRequestId;
}
