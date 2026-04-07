package com.splitzilla.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.Transient;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;
import java.util.UUID;

@Document(collection = "groups")
public class Group {

    @Id
    private String groupId = UUID.randomUUID().toString();

    private String name;

    private String description;

    private LocalDateTime createdAt = LocalDateTime.now();

    @JsonIgnore
    private Set<String> memberIds = new HashSet<>();

    @Transient
    private Set<User> members = new HashSet<>();

    @Transient
    @JsonIgnore
    private Set<Expense> expenses = new HashSet<>();

    public Group() {
    }

    public Group(String groupId, String name, String description, LocalDateTime createdAt,
                 Set<User> members, Set<Expense> expenses) {
        this.groupId = groupId;
        this.name = name;
        this.description = description;
        this.createdAt = createdAt;
        setMembers(members);
        this.expenses = expenses;
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

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public Set<User> getMembers() {
        return members;
    }

    public void setMembers(Set<User> members) {
        this.members = members != null ? members : new HashSet<>();
        this.memberIds = new HashSet<>();
        for (User member : this.members) {
            if (member != null && member.getUserId() != null) {
                this.memberIds.add(member.getUserId());
            }
        }
    }

    public Set<String> getMemberIds() {
        return memberIds;
    }

    public void setMemberIds(Set<String> memberIds) {
        this.memberIds = memberIds != null ? new HashSet<>(memberIds) : new HashSet<>();
    }

    public Set<Expense> getExpenses() {
        return expenses;
    }

    public void setExpenses(Set<Expense> expenses) {
        this.expenses = expenses;
    }
}
