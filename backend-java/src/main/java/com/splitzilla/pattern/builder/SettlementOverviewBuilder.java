package com.splitzilla.pattern.builder;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

public class SettlementOverviewBuilder {

    private final Map<String, Object> response = new LinkedHashMap<>();

    public SettlementOverviewBuilder withBalances(List<Map<String, Object>> balances) {
        response.put("balances", balances);
        return this;
    }

    public SettlementOverviewBuilder withRecommendedPlan(List<Map<String, Object>> plan) {
        response.put("recommended_plan", plan);
        response.put("suggestions", plan);
        return this;
    }

    public SettlementOverviewBuilder withActiveSettlements(List<Map<String, Object>> settlements) {
        response.put("active_settlements", settlements);
        return this;
    }

    public SettlementOverviewBuilder withCompletedSettlements(List<Map<String, Object>> settlements) {
        response.put("completed_settlements", settlements);
        return this;
    }

    public SettlementOverviewBuilder withMetrics(Map<String, Object> metrics) {
        response.put("metrics", metrics);
        return this;
    }

    public Map<String, Object> build() {
        return response;
    }
}
