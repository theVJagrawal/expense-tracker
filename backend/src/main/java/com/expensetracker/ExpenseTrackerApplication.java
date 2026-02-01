package com.expensetracker;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * Main Spring Boot application entry point
 */
@SpringBootApplication
public class ExpenseTrackerApplication {
    
    private static final Logger logger = LoggerFactory.getLogger(ExpenseTrackerApplication.class);
    
    public static void main(String[] args) {
        SpringApplication.run(ExpenseTrackerApplication.class, args);
        
        logger.info("=".repeat(60));
        logger.info("Expense Tracker API Server");
        logger.info("=".repeat(60));
        logger.info("Server running on: http://localhost:8080");
        logger.info("Available endpoints:");
        logger.info("  POST   /expenses     - Create expense (idempotent)");
        logger.info("  GET    /expenses     - List expenses (filter & sort)");
        logger.info("  GET    /expenses/health - Health check");
        logger.info("");
        logger.info("Storage: In-Memory (data lost on restart)");
        logger.info("=".repeat(60));
    }
}
