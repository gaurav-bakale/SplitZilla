package com.splitzilla.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.Transient;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;
import java.util.UUID;

@Document(collection = "settlements")
public class Settlement {

    @Id
    private String settlementId = UUID.randomUUID().toString();

    @JsonIgnore
    private String groupId;

    @Transient
    @JsonIgnore
    private Group group;

    @JsonIgnore
    private String payerId;

    @Transient
    @JsonIgnore
    private User payer;

    @JsonIgnore
    private String payeeId;

    @Transient
    @JsonIgnore
    private User payee;

    private Double amount;

    private Double paidAmount = 0.0;

    private SettlementStatus status = SettlementStatus.PENDING;

    private LocalDateTime createdAt = LocalDateTime.now();

    private LocalDateTime lastPaymentAt;

    private LocalDateTime settledAt;

    public Settlement() {
    }

    public String getSettlementId() {
        return settlementId;
    }

    public void setSettlementId(String settlementId) {
        this.settlementId = settlementId;
    }

    public Group getGroup() {
        return group;
    }

    public void setGroup(Group group) {
        this.group = group;
        this.groupId = group != null ? group.getGroupId() : null;
    }

    public User getPayer() {
        return payer;
    }

    public void setPayer(User payer) {
        this.payer = payer;
        this.payerId = payer != null ? payer.getUserId() : null;
    }

    public User getPayee() {
        return payee;
    }

    public void setPayee(User payee) {
        this.payee = payee;
        this.payeeId = payee != null ? payee.getUserId() : null;
    }

    public Double getAmount() {
        return amount;
    }

    public void setAmount(Double amount) {
        this.amount = amount;
    }

    public Double getPaidAmount() {
        return paidAmount;
    }

    public void setPaidAmount(Double paidAmount) {
        this.paidAmount = paidAmount;
    }

    public SettlementStatus getStatus() {
        return status;
    }

    public void setStatus(SettlementStatus status) {
        this.status = status;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getLastPaymentAt() {
        return lastPaymentAt;
    }

    public void setLastPaymentAt(LocalDateTime lastPaymentAt) {
        this.lastPaymentAt = lastPaymentAt;
    }

    public LocalDateTime getSettledAt() {
        return settledAt;
    }

    public void setSettledAt(LocalDateTime settledAt) {
        this.settledAt = settledAt;
    }

    public String getGroupId() {
        return groupId;
    }

    public void setGroupId(String groupId) {
        this.groupId = groupId;
    }

    public String getPayerId() {
        return payerId;
    }

    public void setPayerId(String payerId) {
        this.payerId = payerId;
    }

    public String getPayeeId() {
        return payeeId;
    }

    public void setPayeeId(String payeeId) {
        this.payeeId = payeeId;
    }
}
