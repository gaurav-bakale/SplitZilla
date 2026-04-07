package com.splitzilla.pattern;

import com.splitzilla.model.Settlement;
import com.splitzilla.model.SettlementStatus;
import com.splitzilla.pattern.state.SettlementState;
import com.splitzilla.pattern.state.SettlementStateFactory;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
public class StatePatternTest {

    private SettlementStateFactory stateFactory;

    @BeforeEach
    public void setup() {
        stateFactory = new SettlementStateFactory();
    }

    @Test
    public void testPendingStateTransition() {
        Settlement settlement = new Settlement();
        settlement.setAmount(100.0);
        settlement.setPaidAmount(0.0);
        settlement.setStatus(SettlementStatus.PENDING);

        SettlementState state = stateFactory.getState(SettlementStatus.PENDING);
        state.applyPayment(settlement, 50.0);

        assertEquals(50.0, settlement.getPaidAmount());
        assertEquals(SettlementStatus.PARTIAL, settlement.getStatus());
    }

    @Test
    public void testPendingStateFullPayment() {
        Settlement settlement = new Settlement();
        settlement.setAmount(100.0);
        settlement.setPaidAmount(0.0);
        settlement.setStatus(SettlementStatus.PENDING);

        SettlementState state = stateFactory.getState(SettlementStatus.PENDING);
        state.applyPayment(settlement, 100.0);

        assertEquals(100.0, settlement.getPaidAmount());
        assertEquals(SettlementStatus.COMPLETED, settlement.getStatus());
    }

    @Test
    public void testPartialStateTransition() {
        Settlement settlement = new Settlement();
        settlement.setAmount(100.0);
        settlement.setPaidAmount(30.0);
        settlement.setStatus(SettlementStatus.PARTIAL);

        SettlementState state = stateFactory.getState(SettlementStatus.PARTIAL);
        state.applyPayment(settlement, 70.0);

        assertEquals(100.0, settlement.getPaidAmount());
        assertEquals(SettlementStatus.COMPLETED, settlement.getStatus());
    }

    @Test
    public void testPartialStateRemainsPartial() {
        Settlement settlement = new Settlement();
        settlement.setAmount(100.0);
        settlement.setPaidAmount(30.0);
        settlement.setStatus(SettlementStatus.PARTIAL);

        SettlementState state = stateFactory.getState(SettlementStatus.PARTIAL);
        state.applyPayment(settlement, 20.0);

        assertEquals(50.0, settlement.getPaidAmount());
        assertEquals(SettlementStatus.PARTIAL, settlement.getStatus());
    }

    @Test
    public void testCompletedStateRejectsPayment() {
        Settlement settlement = new Settlement();
        settlement.setAmount(100.0);
        settlement.setPaidAmount(100.0);
        settlement.setStatus(SettlementStatus.COMPLETED);

        SettlementState state = stateFactory.getState(SettlementStatus.COMPLETED);

        assertThrows(RuntimeException.class, () -> {
            state.applyPayment(settlement, 10.0);
        });
    }

    @Test
    public void testInvalidPaymentAmount() {
        Settlement settlement = new Settlement();
        settlement.setAmount(100.0);
        settlement.setPaidAmount(0.0);
        settlement.setStatus(SettlementStatus.PENDING);

        SettlementState state = stateFactory.getState(SettlementStatus.PENDING);

        assertThrows(RuntimeException.class, () -> {
            state.applyPayment(settlement, -10.0);
        });
    }

    @Test
    public void testOverpaymentPrevention() {
        Settlement settlement = new Settlement();
        settlement.setAmount(100.0);
        settlement.setPaidAmount(90.0);
        settlement.setStatus(SettlementStatus.PARTIAL);

        SettlementState state = stateFactory.getState(SettlementStatus.PARTIAL);

        assertThrows(RuntimeException.class, () -> {
            state.applyPayment(settlement, 20.0);
        });
    }
}
