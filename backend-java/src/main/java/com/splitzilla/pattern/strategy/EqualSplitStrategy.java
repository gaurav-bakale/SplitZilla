package com.splitzilla.pattern.strategy;

import org.springframework.stereotype.Component;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Strategy Pattern - Equal Split Implementation
 * Divides the expense equally among all members
 */
@Component("equal")
public class EqualSplitStrategy implements ISplitStrategy {
    
    @Override
    public Map<String, Double> split(Double amount, List<String> memberIds, Map<String, Object> params) {
        if (memberIds == null || memberIds.isEmpty()) {
            return new HashMap<>();
        }
        
        double perPerson = amount / memberIds.size();
        Map<String, Double> splits = new HashMap<>();
        
        for (String memberId : memberIds) {
            splits.put(memberId, perPerson);
        }
        
        return splits;
    }
}
