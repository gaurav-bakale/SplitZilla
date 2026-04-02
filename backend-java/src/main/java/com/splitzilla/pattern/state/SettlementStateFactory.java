package com.splitzilla.pattern.state;

import com.splitzilla.model.SettlementStatus;
import org.springframework.stereotype.Component;

import java.util.EnumMap;
import java.util.Map;

@Component
public class SettlementStateFactory {

    private final Map<SettlementStatus, SettlementState> states = new EnumMap<>(SettlementStatus.class);

    public SettlementStateFactory() {
        register(new PendingSettlementState());
        register(new PartialSettlementState());
        register(new CompletedSettlementState());
    }

    public SettlementState getState(SettlementStatus status) {
        SettlementState settlementState = states.get(status);
        if (settlementState == null) {
            throw new RuntimeException("Unsupported settlement status: " + status);
        }
        return settlementState;
    }

    private void register(SettlementState state) {
        states.put(state.getStatus(), state);
    }
}
