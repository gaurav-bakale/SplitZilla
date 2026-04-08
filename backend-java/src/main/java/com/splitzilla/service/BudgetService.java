package com.splitzilla.service;

import com.splitzilla.model.BudgetStatus;
import com.splitzilla.model.GroupBudget;
import com.splitzilla.pattern.builder.BudgetReportBuilder;
import com.splitzilla.pattern.chain.ExceededBudgetHandler;
import com.splitzilla.pattern.chain.OnTrackBudgetHandler;
import com.splitzilla.pattern.chain.WarningBudgetHandler;
import com.splitzilla.repository.GroupBudgetRepository;
import com.splitzilla.repository.GroupRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Map;

@Service
public class BudgetService {

    @Autowired
    private GroupBudgetRepository groupBudgetRepository;

    @Autowired
    private GroupRepository groupRepository;

    @Autowired
    private ExpenseService expenseService;

    // -------------------------------------------------------------------------
    // Public API
    // -------------------------------------------------------------------------

    /**
     * Set or update the budget for a group.
     *
     * @param groupId            target group
     * @param amount             spending cap
     * @param warningThreshold   fraction (0–1) at which to issue a WARNING;
     *                           null defaults to 0.80
     */
    public Map<String, Object> setBudget(String groupId, Double amount, Double warningThreshold) {
        validateGroup(groupId);

        if (amount == null || amount <= 0) {
            throw new RuntimeException("Budget amount must be greater than 0");
        }
        double threshold = (warningThreshold != null) ? warningThreshold : 0.80;
        if (threshold <= 0 || threshold >= 1) {
            throw new RuntimeException("Warning threshold must be between 0 and 1 (exclusive)");
        }

        GroupBudget budget = groupBudgetRepository.findByGroupId(groupId)
                .orElseGet(GroupBudget::new);
        if (budget.getCreatedAt() == null) {
            budget.setCreatedAt(LocalDateTime.now());
        }
        budget.setGroupId(groupId);
        budget.setAmount(amount);
        budget.setWarningThreshold(threshold);
        budget.setUpdatedAt(LocalDateTime.now());
        GroupBudget saved = groupBudgetRepository.save(budget);

        return buildReport(saved, currentSpending(groupId));
    }

    /**
     * Get the current budget status for a group.
     * Runs the full Chain of Responsibility evaluation on every call so the
     * status always reflects live expense data.
     */
    public Map<String, Object> getBudgetStatus(String groupId) {
        validateGroup(groupId);
        GroupBudget budget = groupBudgetRepository.findByGroupId(groupId)
                .orElseThrow(() -> new RuntimeException("No budget set for this group"));
        return buildReport(budget, currentSpending(groupId));
    }

    /**
     * Remove the budget for a group.
     */
    public void deleteBudget(String groupId) {
        validateGroup(groupId);
        if (groupBudgetRepository.findByGroupId(groupId).isEmpty()) {
            throw new RuntimeException("No budget set for this group");
        }
        groupBudgetRepository.deleteByGroupId(groupId);
    }

    // -------------------------------------------------------------------------
    // Internals
    // -------------------------------------------------------------------------

    /**
     * Assemble the Chain of Responsibility and evaluate the current budget health.
     * Chain order: ExceededBudgetHandler → WarningBudgetHandler → OnTrackBudgetHandler
     */
    private BudgetStatus evaluateStatus(double budgetAmount, double totalSpent, double warningThreshold) {
        ExceededBudgetHandler exceeded = new ExceededBudgetHandler();
        WarningBudgetHandler  warning  = new WarningBudgetHandler();
        OnTrackBudgetHandler  onTrack  = new OnTrackBudgetHandler();

        exceeded.setNext(warning).setNext(onTrack);

        return exceeded.handle(budgetAmount, totalSpent, warningThreshold);
    }

    private Map<String, Object> buildReport(GroupBudget budget, double totalSpent) {
        double budgetAmount = budget.getAmount();
        double threshold    = budget.getWarningThreshold();
        double remaining    = budgetAmount - totalSpent;
        double percentUsed  = budgetAmount > 0 ? (totalSpent / budgetAmount) * 100.0 : 0.0;

        BudgetStatus status = evaluateStatus(budgetAmount, totalSpent, threshold);
        String message      = resolveMessage(status, budgetAmount, totalSpent, remaining);

        return new BudgetReportBuilder()
                .withBudgetId(budget.getBudgetId())
                .withGroupId(budget.getGroupId())
                .withBudgetAmount(budgetAmount)
                .withTotalSpent(totalSpent)
                .withRemainingBudget(remaining)
                .withPercentUsed(percentUsed)
                .withWarningThresholdPercent(threshold * 100)
                .withStatus(status)
                .withStatusMessage(message)
                .build();
    }

    private String resolveMessage(BudgetStatus status, double budget, double spent, double remaining) {
        return switch (status) {
            case EXCEEDED -> String.format(
                    "Budget exceeded by $%.2f. Total spent: $%.2f / $%.2f",
                    Math.abs(remaining), spent, budget);
            case WARNING  -> String.format(
                    "Approaching budget limit — $%.2f remaining (%.0f%% used)",
                    remaining, (spent / budget) * 100);
            case ON_TRACK -> String.format(
                    "Spending is on track — $%.2f remaining",
                    remaining);
        };
    }

    /** Sum all expense amounts for the group via the existing ExpenseService. */
    private double currentSpending(String groupId) {
        Map<String, Object> summary = expenseService.getGroupSummary(groupId);
        Object total = summary.get("total_amount");
        return total instanceof Number ? ((Number) total).doubleValue() : 0.0;
    }

    private void validateGroup(String groupId) {
        groupRepository.findById(groupId)
                .orElseThrow(() -> new RuntimeException("Group not found"));
    }
}
