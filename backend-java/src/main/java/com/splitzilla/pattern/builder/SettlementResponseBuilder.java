package com.splitzilla.pattern.builder;

import com.splitzilla.model.Settlement;

import java.util.LinkedHashMap;
import java.util.Map;

public class SettlementResponseBuilder {

    private final Map<String, Object> response = new LinkedHashMap<>();

    public SettlementResponseBuilder fromSettlement(Settlement settlement) {
        double amount = roundAmount(settlement.getAmount());
        double paidAmount = roundAmount(settlement.getPaidAmount());
        double outstandingAmount = roundAmount(amount - paidAmount);
        double progress = amount <= 0 ? 100.0 : roundAmount((paidAmount / amount) * 100.0);

        response.put("settlement_id", settlement.getSettlementId());
        response.put("group_id", settlement.getGroup().getGroupId());
        response.put("payer_id", settlement.getPayer().getUserId());
        response.put("payer_name", settlement.getPayer().getName());
        response.put("payee_id", settlement.getPayee().getUserId());
        response.put("payee_name", settlement.getPayee().getName());
        response.put("amount", amount);
        response.put("paid_amount", paidAmount);
        response.put("outstanding_amount", outstandingAmount);
        response.put("status", settlement.getStatus().name().toLowerCase());
        response.put("progress_percent", progress);
        response.put("created_at", settlement.getCreatedAt());
        response.put("last_payment_at", settlement.getLastPaymentAt());
        response.put("settled_at", settlement.getSettledAt());
        return this;
    }

    public Map<String, Object> build() {
        return response;
    }

    private double roundAmount(double amount) {
        return Math.round(amount * 100.0) / 100.0;
    }
}
