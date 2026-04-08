package com.splitzilla.pattern.chain;

import com.splitzilla.model.BudgetStatus;

/**
 * Chain of Responsibility — terminal handler in the chain.
 * Reached only when neither the exceeded nor the warning threshold was triggered.
 * Always returns ON_TRACK.
 */
public class OnTrackBudgetHandler extends BudgetCheckHandler {

    @Override
    public BudgetStatus handle(double budgetAmount, double totalSpent, double warningThreshold) {
        return BudgetStatus.ON_TRACK;
    }
}
