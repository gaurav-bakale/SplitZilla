package com.splitzilla.pattern.strategy;

import org.springframework.stereotype.Component;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Strategy Pattern - Exact Amount Split Implementation
 * Splits expense with exact amounts specified for each member
 */
@Component("exact")
public class ExactAmountSplitStrategy implements ISplitStrategy {
    
    @Override
    public Map<String, Double> split(Double amount, List<String> memberIds, Map<String, Object> params) {
        if (params == null || !params.containsKey("exact_amounts")) {
            throw new IllegalArgumentException("Exact amounts must be provided for exact split");
        }
        
        @SuppressWarnings("unchecked")
        Map<String, Object> rawExact = (Map<String, Object>) params.get("exact_amounts");
        Map<String, Double> exactAmounts = new java.util.HashMap<>();
        rawExact.forEach((k, v) -> exactAmounts.put(k, v instanceof Number ? ((Number) v).doubleValue() : 0.0));

        double totalSplit = exactAmounts.values().stream().mapToDouble(Double::doubleValue).sum();
        if (Math.abs(totalSplit - amount) > 0.01) {
            throw new IllegalArgumentException(
                String.format("Exact amounts must sum to total amount %.2f, got %.2f", amount, totalSplit)
            );
        }
        
        return new HashMap<>(exactAmounts);
    }
}
