package com.splitzilla.pattern.chain;

import com.splitzilla.model.BudgetStatus;

/**
 * Chain of Responsibility Pattern — Abstract Handler.
 *
 * Each concrete handler receives the budget amount, the current total spending,
 * and the configured warning threshold. If the handler's condition is met it
 * returns the appropriate {@link BudgetStatus}; otherwise it delegates to the
 * next handler in the chain.
 */
public abstract class BudgetCheckHandler {

    private BudgetCheckHandler next;

    /**
     * Fluent setter — returns {@code next} so chains can be composed inline:
     * <pre>
     *   exceeded.setNext(warning).setNext(onTrack);
     * </pre>
     */
    public BudgetCheckHandler setNext(BudgetCheckHandler next) {
        this.next = next;
        return next;
    }

    /**
     * Evaluate the budget situation and return a {@link BudgetStatus}.
     *
     * @param budgetAmount     the cap set for the group
     * @param totalSpent       sum of all expense amounts in the group
     * @param warningThreshold fraction (0–1) at which a warning should fire
     */
    public abstract BudgetStatus handle(double budgetAmount, double totalSpent, double warningThreshold);

    /**
     * Passes control to the next handler, or returns ON_TRACK as the terminal default.
     */
    protected BudgetStatus passToNext(double budgetAmount, double totalSpent, double warningThreshold) {
        if (next != null) {
            return next.handle(budgetAmount, totalSpent, warningThreshold);
        }
        return BudgetStatus.ON_TRACK;
    }
}
