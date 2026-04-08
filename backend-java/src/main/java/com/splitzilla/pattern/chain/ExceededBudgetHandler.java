package com.splitzilla.pattern.chain;

import com.splitzilla.model.BudgetStatus;

/**
 * Chain of Responsibility — first handler in the chain.
 * Returns EXCEEDED when total spending is at or above the full budget amount.
 */
public class ExceededBudgetHandler extends BudgetCheckHandler {

    @Override
    public BudgetStatus handle(double budgetAmount, double totalSpent, double warningThreshold) {
        if (totalSpent >= budgetAmount) {
            return BudgetStatus.EXCEEDED;
        }
        return passToNext(budgetAmount, totalSpent, warningThreshold);
    }
}
