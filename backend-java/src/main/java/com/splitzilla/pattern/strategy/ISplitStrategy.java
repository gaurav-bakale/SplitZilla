package com.splitzilla.pattern.strategy;

import java.util.List;
import java.util.Map;

/**
 * Strategy Pattern - Interface for different expense splitting strategies
 */
public interface ISplitStrategy {
    Map<String, Double> split(Double amount, List<String> memberIds, Map<String, Object> params);
}
