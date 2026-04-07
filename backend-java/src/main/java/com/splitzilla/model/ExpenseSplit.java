package com.splitzilla.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import org.springframework.data.annotation.Transient;

import java.util.UUID;

public class ExpenseSplit {

    private String splitId = UUID.randomUUID().toString();

    @Transient
    @JsonIgnore
    private Expense expense;

    @JsonIgnore
    private String userId;

    @Transient
    private User user;

    private Double amount;

    public ExpenseSplit() {
    }

    public ExpenseSplit(String splitId, Expense expense, User user, Double amount) {
        this.splitId = splitId;
        this.expense = expense;
        setUser(user);
        this.amount = amount;
    }

    public String getSplitId() {
        return splitId;
    }

    public void setSplitId(String splitId) {
        this.splitId = splitId;
    }

    public Expense getExpense() {
        return expense;
    }

    public void setExpense(Expense expense) {
        this.expense = expense;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
        this.userId = user != null ? user.getUserId() : null;
    }

    public Double getAmount() {
        return amount;
    }

    public void setAmount(Double amount) {
        this.amount = amount;
    }

    public String getUserId() {
        return userId;
    }

    public void setUserId(String userId) {
        this.userId = userId;
    }
}
