package com.splitzilla.pattern.builder;

import com.splitzilla.model.BudgetStatus;

import java.util.LinkedHashMap;
import java.util.Map;

/**
 * Builder Pattern — constructs the budget status report returned by the API.
 * Follows the same fluent convention as SettlementOverviewBuilder and
 * CategorySummaryBuilder.
 */
public class BudgetReportBuilder {

    private final Map<String, Object> report = new LinkedHashMap<>();

    public BudgetReportBuilder withBudgetId(String budgetId) {
        report.put("budget_id", budgetId);
        return this;
    }

    public BudgetReportBuilder withGroupId(String groupId) {
        report.put("group_id", groupId);
        return this;
    }

    public BudgetReportBuilder withBudgetAmount(double amount) {
        report.put("budget_amount", round(amount));
        return this;
    }

    public BudgetReportBuilder withTotalSpent(double totalSpent) {
        report.put("total_spent", round(totalSpent));
        return this;
    }

    public BudgetReportBuilder withRemainingBudget(double remaining) {
        report.put("remaining_budget", round(remaining));
        return this;
    }

    public BudgetReportBuilder withPercentUsed(double percentUsed) {
        report.put("percent_used", round(percentUsed));
        return this;
    }

    public BudgetReportBuilder withWarningThresholdPercent(double thresholdPercent) {
        report.put("warning_threshold_percent", round(thresholdPercent));
        return this;
    }

    public BudgetReportBuilder withStatus(BudgetStatus status) {
        report.put("status", status.name());
        return this;
    }

    public BudgetReportBuilder withStatusMessage(String message) {
        report.put("status_message", message);
        return this;
    }

    public Map<String, Object> build() {
        return report;
    }

    private double round(double value) {
        return Math.round(value * 100.0) / 100.0;
    }
}
