package com.splitzilla.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;
import java.util.UUID;

@Entity
@Table(name = "groups")
public class Group {

    @Id
    @Column(name = "group_id")
    private String groupId = UUID.randomUUID().toString();

    @Column(nullable = false)
    private String name;

    @Column
    private String description;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @ManyToMany(cascade = {CascadeType.PERSIST, CascadeType.MERGE})
    @JoinTable(
        name = "group_members",
        joinColumns = @JoinColumn(name = "group_id"),
        inverseJoinColumns = @JoinColumn(name = "user_id")
    )
    private Set<User> members = new HashSet<>();

    @JsonIgnore
    @OneToMany(mappedBy = "group", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<Expense> expenses = new HashSet<>();

    public Group() {
    }

    public Group(String groupId, String name, String description, LocalDateTime createdAt,
                 Set<User> members, Set<Expense> expenses) {
        this.groupId = groupId; 
        this.name = name; 
        this.description = description; 
        this.createdAt = createdAt; 
        this.members = members; 
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
        this.members = members;
    }

    public Set<Expense> getExpenses() {
        return expenses;
    }
 
    public void setExpenses(Set<Expense> expenses) {
        this.expenses = expenses;
    } 
}
  