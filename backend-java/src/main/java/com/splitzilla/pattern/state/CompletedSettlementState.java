package com.splitzilla.pattern.state;

import com.splitzilla.model.Settlement;
import com.splitzilla.model.SettlementStatus;

public class CompletedSettlementState implements SettlementState {

    @Override
    public SettlementStatus getStatus() {
        return SettlementStatus.COMPLETED;
    }

    @Override
    public void applyPayment(Settlement settlement, double paymentAmount) {
        throw new RuntimeException("This settlement has already been completed");
    }
}
