package com.splitzilla.pattern;

import com.splitzilla.pattern.strategy.EqualSplitStrategy;
import com.splitzilla.pattern.strategy.ExactAmountSplitStrategy;
import com.splitzilla.pattern.strategy.ISplitStrategy;
import com.splitzilla.pattern.strategy.PercentageSplitStrategy;
import org.junit.jupiter.api.Test;

import java.util.*;

import static org.junit.jupiter.api.Assertions.*;

public class StrategyPatternTest {

    @Test
    public void testEqualSplitStrategy() {
        ISplitStrategy strategy = new EqualSplitStrategy();
        List<String> members = Arrays.asList("user1", "user2", "user3");
        Map<String, Double> result = strategy.split(300.0, members, new HashMap<>());

        assertEquals(3, result.size());
        assertEquals(100.0, result.get("user1"), 0.01);
        assertEquals(100.0, result.get("user2"), 0.01);
        assertEquals(100.0, result.get("user3"), 0.01);
    }

    @Test
    public void testPercentageSplitStrategy() {
        ISplitStrategy strategy = new PercentageSplitStrategy();
        List<String> members = Arrays.asList("user1", "user2", "user3");
        
        Map<String, Object> params = new HashMap<>();
        Map<String, Double> percentages = new HashMap<>();
        percentages.put("user1", 50.0);
        percentages.put("user2", 30.0);
        percentages.put("user3", 20.0);
        params.put("percentages", percentages);

        Map<String, Double> result = strategy.split(1000.0, members, params);

        assertEquals(3, result.size());
        assertEquals(500.0, result.get("user1"), 0.01);
        assertEquals(300.0, result.get("user2"), 0.01);
        assertEquals(200.0, result.get("user3"), 0.01);
    }

    @Test
    public void testPercentageSplitStrategyInvalidSum() {
        ISplitStrategy strategy = new PercentageSplitStrategy();
        List<String> members = Arrays.asList("user1", "user2");
        
        Map<String, Object> params = new HashMap<>();
        Map<String, Double> percentages = new HashMap<>();
        percentages.put("user1", 50.0);
        percentages.put("user2", 40.0);
        params.put("percentages", percentages);

        assertThrows(IllegalArgumentException.class, () -> {
            strategy.split(1000.0, members, params);
        });
    }

    @Test
    public void testExactAmountSplitStrategy() {
        ISplitStrategy strategy = new ExactAmountSplitStrategy();
        List<String> members = Arrays.asList("user1", "user2", "user3");
        
        Map<String, Object> params = new HashMap<>();
        Map<String, Double> amounts = new HashMap<>();
        amounts.put("user1", 150.0);
        amounts.put("user2", 100.0);
        amounts.put("user3", 50.0);
        params.put("exact_amounts", amounts);

        Map<String, Double> result = strategy.split(300.0, members, params);

        assertEquals(3, result.size());
        assertEquals(150.0, result.get("user1"), 0.01);
        assertEquals(100.0, result.get("user2"), 0.01);
        assertEquals(50.0, result.get("user3"), 0.01);
    }

    @Test
    public void testExactAmountSplitStrategyInvalidSum() {
        ISplitStrategy strategy = new ExactAmountSplitStrategy();
        List<String> members = Arrays.asList("user1", "user2");
        
        Map<String, Object> params = new HashMap<>();
        Map<String, Double> amounts = new HashMap<>();
        amounts.put("user1", 150.0);
        amounts.put("user2", 100.0);
        params.put("exact_amounts", amounts);

        assertThrows(IllegalArgumentException.class, () -> {
            strategy.split(300.0, members, params);
        });
    }
}
