package com.splitzilla.pattern.builder;

import com.splitzilla.model.ExpenseCategory;

import java.util.LinkedHashMap;
import java.util.Map;

/**
 * Builder Pattern - Constructs a structured category summary report.
 * Follows the same fluent-builder convention as SettlementOverviewBuilder.
 */
public class CategorySummaryBuilder {

    private final Map<String, Object> summary = new LinkedHashMap<>();

    public CategorySummaryBuilder withCategoryTotals(Map<ExpenseCategory, Double> totals) {
        Map<String, Double> rounded = new LinkedHashMap<>();
        totals.forEach((k, v) -> rounded.put(k.name(), Math.round(v * 100.0) / 100.0));
        summary.put("totals_by_category", rounded);
        return this;
    }

    public CategorySummaryBuilder withCategoryCounts(Map<ExpenseCategory, Integer> counts) {
        Map<String, Integer> out = new LinkedHashMap<>();
        counts.forEach((k, v) -> out.put(k.name(), v));
        summary.put("count_by_category", out);
        return this;
    }

    public CategorySummaryBuilder withTopCategory(String topCategory, Double topAmount) {
        summary.put("top_category", topCategory);
        summary.put("top_category_amount", Math.round(topAmount * 100.0) / 100.0);
        return this;
    }

    public Map<String, Object> build() {
        return summary;
    }
}
