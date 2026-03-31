package com.splitzilla.pattern.strategy;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import java.util.Map;

/**
 * Factory for Strategy Pattern
 * Returns appropriate splitting strategy based on split type
 */
@Component
public class SplitStrategyFactory {
    
    private final Map<String, ISplitStrategy> strategies;
    
    @Autowired
    public SplitStrategyFactory(Map<String, ISplitStrategy> strategies) {
        this.strategies = strategies;
    }
    
    public ISplitStrategy getStrategy(String splitType) {
        ISplitStrategy strategy = strategies.get(splitType.toLowerCase());
        if (strategy == null) {
            throw new IllegalArgumentException("Unknown split type: " + splitType);
        }
        return strategy;
    }
}
