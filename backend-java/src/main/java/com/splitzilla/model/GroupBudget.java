package com.splitzilla.model;

import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * A spending cap set for a group.
 * One budget per group — update replaces the existing record.
 */
@Entity
@Table(name = "group_budgets")
public class GroupBudget {

    @Id
    @Column(name = "budget_id")
    private String budgetId = UUID.randomUUID().toString();

    @Column(name = "group_id", nullable = false, unique = true)
    private String groupId;

    @Column(name = "amount", nullable = false)
    private Double amount;

    /**
     * Fraction (0–1) of the budget at which a WARNING is issued.
     * Default: 0.80 (warn when 80 % is spent).
     */
    @Column(name = "warning_threshold", nullable = false)
    private Double warningThreshold = 0.80;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    public GroupBudget() {
    }

    public String getBudgetId() {
        return budgetId;
    }

    public void setBudgetId(String budgetId) {
        this.budgetId = budgetId;
    }

    public String getGroupId() {
        return groupId;
    }

    public void setGroupId(String groupId) {
        this.groupId = groupId;
    }

    public Double getAmount() {
        return amount;
    }

    public void setAmount(Double amount) {
        this.amount = amount;
    }

    public Double getWarningThreshold() {
        return warningThreshold;
    }

    public void setWarningThreshold(Double warningThreshold) {
        this.warningThreshold = warningThreshold;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
}
