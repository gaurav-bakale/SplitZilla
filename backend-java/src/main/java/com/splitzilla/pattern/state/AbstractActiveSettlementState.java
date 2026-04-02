package com.splitzilla.pattern.state;

import com.splitzilla.model.Settlement;
import com.splitzilla.model.SettlementStatus;

import java.time.LocalDateTime;

abstract class AbstractActiveSettlementState implements SettlementState {

    @Override
    public void applyPayment(Settlement settlement, double paymentAmount) {
        if (paymentAmount <= 0) {
            throw new RuntimeException("Payment amount must be greater than 0");
        }

        double outstandingAmount = roundAmount(settlement.getAmount() - settlement.getPaidAmount());
        if (paymentAmount - outstandingAmount > 0.009) {
            throw new RuntimeException("Payment amount cannot exceed the outstanding balance");
        }

        double nextPaidAmount = roundAmount(settlement.getPaidAmount() + paymentAmount);
        settlement.setPaidAmount(nextPaidAmount);
        settlement.setLastPaymentAt(LocalDateTime.now());

        if (roundAmount(settlement.getAmount() - nextPaidAmount) <= 0.009) {
            settlement.setPaidAmount(roundAmount(settlement.getAmount()));
            settlement.setStatus(SettlementStatus.COMPLETED);
            settlement.setSettledAt(LocalDateTime.now());
        } else {
            settlement.setStatus(SettlementStatus.PARTIAL);
            settlement.setSettledAt(null);
        }
    }

    protected double roundAmount(double amount) {
        return Math.round(amount * 100.0) / 100.0;
    }
}
