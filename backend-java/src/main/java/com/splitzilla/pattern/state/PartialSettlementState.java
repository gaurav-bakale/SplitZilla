package com.splitzilla.pattern.state;

import com.splitzilla.model.SettlementStatus;

public class PartialSettlementState extends AbstractActiveSettlementState {

    @Override
    public SettlementStatus getStatus() {
        return SettlementStatus.PARTIAL;
    }
}
