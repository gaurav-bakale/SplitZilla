package com.splitzilla.pattern.chain;

import com.splitzilla.model.BudgetStatus;

/**
 * Chain of Responsibility — second handler in the chain.
 * Returns WARNING when spending has crossed the configured warning threshold
 * but has not yet reached the full budget.
 */
public class WarningBudgetHandler extends BudgetCheckHandler {

    @Override
    public BudgetStatus handle(double budgetAmount, double totalSpent, double warningThreshold) {
        if (totalSpent >= budgetAmount * warningThreshold) {
            return BudgetStatus.WARNING;
        }
        return passToNext(budgetAmount, totalSpent, warningThreshold);
    }
}
