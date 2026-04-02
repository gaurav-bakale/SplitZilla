package com.splitzilla.pattern.state;

import com.splitzilla.model.Settlement;
import com.splitzilla.model.SettlementStatus;

public interface SettlementState {
    SettlementStatus getStatus();
    void applyPayment(Settlement settlement, double paymentAmount);
}
