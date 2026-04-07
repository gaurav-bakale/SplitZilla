package com.splitzilla.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.Transient;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;
import java.util.UUID;

@Document(collection = "expenses")
public class Expense {

    @Id
    private String expenseId = UUID.randomUUID().toString();

    private String description;

    private Double amount;

    @JsonIgnore
    private String payerId;

    @Transient
    @JsonIgnore
    private User payer;

    @JsonIgnore
    private String groupId;

    @Transient
    @JsonIgnore
    private Group group;

    private String splitType;

    private LocalDateTime date = LocalDateTime.now();

    @JsonIgnore
    private Set<ExpenseSplit> splits = new HashSet<>();

    public Expense() {
    }

    public Expense(String expenseId, String description, Double amount, User payer, Group group,
                   String splitType, LocalDateTime date, Set<ExpenseSplit> splits) {
        this.expenseId = expenseId;
        this.description = description;
        this.amount = amount;
        setPayer(payer);
        setGroup(group);
        this.splitType = splitType;
        this.date = date;
        this.splits = splits;
    }

    public String getExpenseId() {
        return expenseId;
    }

    public void setExpenseId(String expenseId) {
        this.expenseId = expenseId;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public Double getAmount() {
        return amount;
    }

    public void setAmount(Double amount) {
        this.amount = amount;
    }

    public User getPayer() {
        return payer;
    }

    public void setPayer(User payer) {
        this.payer = payer;
        this.payerId = payer != null ? payer.getUserId() : null;
    }

    public Group getGroup() {
        return group;
    }

    public void setGroup(Group group) {
        this.group = group;
        this.groupId = group != null ? group.getGroupId() : null;
    }

    public String getSplitType() {
        return splitType;
    }

    public void setSplitType(String splitType) {
        this.splitType = splitType;
    }

    public LocalDateTime getDate() {
        return date;
    }

    public void setDate(LocalDateTime date) {
        this.date = date;
    }

    public Set<ExpenseSplit> getSplits() {
        return splits;
    }

    public void setSplits(Set<ExpenseSplit> splits) {
        this.splits = splits;
    }

    public String getPayerId() {
        return payerId;
    }

    public void setPayerId(String payerId) {
        this.payerId = payerId;
    }

    public String getGroupId() {
        return groupId;
    }

    public void setGroupId(String groupId) {
        this.groupId = groupId;
    }
}
