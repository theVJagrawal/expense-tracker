import { useState } from 'react';
import ExpenseForm from './components/ExpenseForm';
import ExpenseList from './components/ExpenseList';
import './App.css';

/**
 * Main App component
 *
 * Coordinates:
 * - ExpenseForm for adding expenses
 * - ExpenseList for displaying expenses
 *
 * Uses refreshTrigger to reload list after creating expense
 */
function App() {
    const [refreshTrigger, setRefreshTrigger] = useState(0);
    const [showExpenses, setShowExpenses] = useState(true);

    const handleExpenseCreated = () => {
        // Trigger list refresh by incrementing counter
        setRefreshTrigger(prev => prev + 1);

        // Optional UX: auto-show list after adding expense
        setShowExpenses(true);
    };

    const toggleExpenses = () => {
        setShowExpenses(prev => !prev);
    };

    return (
        <div className="container">
            <header>
                <h1>Expense Tracker</h1>
                <p className="subtitle">Production-minded expense management App</p>
            </header>

            <main>
                <ExpenseForm onExpenseCreated={handleExpenseCreated} />

                <div style={{ margin: '16px 0' }}>
                    <button
                        type="submit"
                        className="btn btn-primary"
                        onClick={toggleExpenses}>
                        {showExpenses ? 'Hide Expenses' : 'Show Expenses'}
                    </button>
                </div>

                {showExpenses && (
                    <ExpenseList refreshTrigger={refreshTrigger} />
                )}
            </main>

            <footer>
                <p>Data stored in memory - will be lost on server restart</p>
            </footer>
        </div>
    );
}

export default App;
