package com.splitzilla.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.Transient;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;
import java.util.UUID;

@Document(collection = "exception_rules")
public class ExceptionRule {

    @Id
    private String ruleId = UUID.randomUUID().toString();

    private String groupId;

    private String name;

    private String description;

    private ExceptionRuleType ruleType;

    private String targetMemberId;

    private ExpenseCategory appliesToCategory;

    private Double value;

    private Integer priority = 100;

    private Boolean active = true;

    private LocalDateTime createdAt = LocalDateTime.now();

    @Transient
    private String targetMemberName;

    public String getRuleId() {
        return ruleId;
    }

    public void setRuleId(String ruleId) {
        this.ruleId = ruleId;
    }

    public String getGroupId() {
        return groupId;
    }

    public void setGroupId(String groupId) {
        this.groupId = groupId;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public ExceptionRuleType getRuleType() {
        return ruleType;
    }

    public void setRuleType(ExceptionRuleType ruleType) {
        this.ruleType = ruleType;
    }

    public String getTargetMemberId() {
        return targetMemberId;
    }

    public void setTargetMemberId(String targetMemberId) {
        this.targetMemberId = targetMemberId;
    }

    public ExpenseCategory getAppliesToCategory() {
        return appliesToCategory;
    }

    public void setAppliesToCategory(ExpenseCategory appliesToCategory) {
        this.appliesToCategory = appliesToCategory;
    }

    public Double getValue() {
        return value;
    }

    public void setValue(Double value) {
        this.value = value;
    }

    public Integer getPriority() {
        return priority;
    }

    public void setPriority(Integer priority) {
        this.priority = priority;
    }

    public Boolean getActive() {
        return active;
    }

    public void setActive(Boolean active) {
        this.active = active;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public String getTargetMemberName() {
        return targetMemberName;
    }

    public void setTargetMemberName(String targetMemberName) {
        this.targetMemberName = targetMemberName;
    }
}
