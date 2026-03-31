package com.splitzilla.pattern.strategy;

import org.springframework.stereotype.Component;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Strategy Pattern - Percentage Split Implementation
 * Splits expense based on custom percentages for each member
 */
@Component("percentage")
public class PercentageSplitStrategy implements ISplitStrategy {
    
    @Override
    public Map<String, Double> split(Double amount, List<String> memberIds, Map<String, Object> params) {
        if (params == null || !params.containsKey("percentages")) {
            throw new IllegalArgumentException("Percentages must be provided for percentage split");
        }
        
        @SuppressWarnings("unchecked")
        Map<String, Double> percentages = (Map<String, Double>) params.get("percentages");
        
        double totalPercentage = percentages.values().stream().mapToDouble(Double::doubleValue).sum();
        if (Math.abs(totalPercentage - 100.0) > 0.01) {
            throw new IllegalArgumentException("Percentages must sum to 100, got " + totalPercentage);
        }
        
        Map<String, Double> splits = new HashMap<>();
        for (String memberId : memberIds) {
            double percentage = percentages.getOrDefault(memberId, 0.0);
            splits.put(memberId, amount * percentage / 100.0);
        }
        
        return splits;
    }
}
