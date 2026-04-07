package com.splitzilla.pattern;

import com.splitzilla.pattern.builder.SettlementOverviewBuilder;
import com.splitzilla.pattern.builder.SettlementResponseBuilder;
import com.splitzilla.model.Settlement;
import com.splitzilla.model.SettlementStatus;
import com.splitzilla.model.User;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;

import java.util.*;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
public class BuilderPatternTest {

    @Test
    public void testSettlementOverviewBuilder() {
        List<Map<String, Object>> balances = new ArrayList<>();
        Map<String, Object> balance = new HashMap<>();
        balance.put("user_id", "user1");
        balance.put("balance", 50.0);
        balances.add(balance);

        List<Map<String, Object>> plan = new ArrayList<>();
        Map<String, Object> suggestion = new HashMap<>();
        suggestion.put("payer_id", "user1");
        suggestion.put("payee_id", "user2");
        suggestion.put("amount", 50.0);
        plan.add(suggestion);

        Map<String, Object> metrics = new HashMap<>();
        metrics.put("total_outstanding", 100.0);

        Map<String, Object> result = new SettlementOverviewBuilder()
                .withBalances(balances)
                .withRecommendedPlan(plan)
                .withMetrics(metrics)
                .build();

        assertNotNull(result);
        assertEquals(balances, result.get("balances"));
        assertEquals(plan, result.get("recommended_plan"));
        assertEquals(metrics, result.get("metrics"));
    }

    @Test
    public void testSettlementResponseBuilder() {
        User payer = new User();
        payer.setUserId("user1");
        payer.setName("Alice");

        User payee = new User();
        payee.setUserId("user2");
        payee.setName("Bob");

        com.splitzilla.model.Group group = new com.splitzilla.model.Group();
        group.setGroupId("group1");

        Settlement settlement = new Settlement();
        settlement.setSettlementId("settlement1");
        settlement.setPayer(payer);
        settlement.setPayee(payee);
        settlement.setGroup(group);
        settlement.setAmount(100.0);
        settlement.setPaidAmount(50.0);
        settlement.setStatus(SettlementStatus.PARTIAL);

        Map<String, Object> result = new SettlementResponseBuilder()
                .fromSettlement(settlement)
                .build();

        assertNotNull(result);
        assertEquals("settlement1", result.get("settlement_id"));
        assertEquals("user1", result.get("payer_id"));
        assertEquals("Alice", result.get("payer_name"));
        assertEquals("user2", result.get("payee_id"));
        assertEquals("Bob", result.get("payee_name"));
        assertEquals(100.0, result.get("amount"));
        assertEquals(50.0, result.get("paid_amount"));
        assertEquals(50.0, result.get("outstanding_amount"));
        assertEquals("partial", result.get("status"));
    }

    @Test
    public void testBuilderChaining() {
        Map<String, Object> result = new SettlementOverviewBuilder()
                .withBalances(new ArrayList<>())
                .withRecommendedPlan(new ArrayList<>())
                .withActiveSettlements(new ArrayList<>())
                .withCompletedSettlements(new ArrayList<>())
                .withMetrics(new HashMap<>())
                .build();

        assertNotNull(result);
        assertTrue(result.containsKey("balances"));
        assertTrue(result.containsKey("recommended_plan"));
        assertTrue(result.containsKey("active_settlements"));
        assertTrue(result.containsKey("completed_settlements"));
        assertTrue(result.containsKey("metrics"));
    }
}
