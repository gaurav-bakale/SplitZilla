package com.splitzilla.pattern.state;

import com.splitzilla.model.SettlementStatus;

public class PendingSettlementState extends AbstractActiveSettlementState {

    @Override
    public SettlementStatus getStatus() {
        return SettlementStatus.PENDING;
    }
}
