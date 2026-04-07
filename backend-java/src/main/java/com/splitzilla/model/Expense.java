package com.splitzilla.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;
import java.util.UUID;

@Entity
@Table(name = "expenses")
public class Expense {

    @Id
    @Column(name = "expense_id")
    private String expenseId = UUID.randomUUID().toString();

    @Column(nullable = false)
    private String description;

    @Column(nullable = false)
    private Double amount;

    @JsonIgnore
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "paid_by_id", nullable = false)
    private User payer;

    @JsonIgnore
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "group_id", nullable = false)
    private Group group;

    @Column(name = "split_type", nullable = false)
    private String splitType;

    @Enumerated(EnumType.STRING)
    @Column(name = "category", nullable = false)
    private ExpenseCategory category = ExpenseCategory.GENERAL;

    @CreationTimestamp
    @Column(name = "date", nullable = false, updatable = false)
    private LocalDateTime date;

    @JsonIgnore
    @OneToMany(mappedBy = "expense", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<ExpenseSplit> splits = new HashSet<>();

    public Expense() {
    }

    public Expense(String expenseId, String description, Double amount, User payer, Group group,
                   String splitType, ExpenseCategory category, LocalDateTime date, Set<ExpenseSplit> splits) {
        this.expenseId = expenseId;
        this.description = description;
        this.amount = amount;
        this.payer = payer;
        this.group = group;
        this.splitType = splitType;
        this.category = category;
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
    }

    public Group getGroup() {
        return group;
    }

    public void setGroup(Group group) {
        this.group = group;
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

    public ExpenseCategory getCategory() {
        return category;
    }

    public void setCategory(ExpenseCategory category) {
        this.category = category;
    }

    public Set<ExpenseSplit> getSplits() {
        return splits;
    }

    public void setSplits(Set<ExpenseSplit> splits) {
        this.splits = splits;
    }
}
