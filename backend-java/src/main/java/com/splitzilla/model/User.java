package com.splitzilla.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.Transient;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;
import java.util.UUID;

@Document(collection = "users")
public class User {

    @Id
    private String userId = UUID.randomUUID().toString();

    private String name;

    @Indexed(unique = true)
    private String email;

    private String password;

    private LocalDateTime createdAt = LocalDateTime.now();

    private Set<String> friends = new HashSet<>();

    @Transient
    @JsonIgnore
    private Set<Group> groups = new HashSet<>();

    @Transient
    @JsonIgnore
    private Set<Expense> expensesPaid = new HashSet<>();

    @Transient
    @JsonIgnore
    private Set<Notification> notifications = new HashSet<>();

    public User() {
    }

    public User(String userId, String name, String email, String password, LocalDateTime createdAt,
                Set<Group> groups, Set<Expense> expensesPaid, Set<Notification> notifications) {
        this.userId = userId;
        this.name = name;
        this.email = email;
        this.password = password;
        this.createdAt = createdAt;
        this.groups = groups;
        this.expensesPaid = expensesPaid;
        this.notifications = notifications;
    }

    public String getUserId() {
        return userId;
    }

    public void setUserId(String userId) {
        this.userId = userId;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public Set<Group> getGroups() {
        return groups;
    }

    public void setGroups(Set<Group> groups) {
        this.groups = groups;
    }

    public Set<Expense> getExpensesPaid() {
        return expensesPaid;
    }

    public void setExpensesPaid(Set<Expense> expensesPaid) {
        this.expensesPaid = expensesPaid;
    }

    public Set<Notification> getNotifications() {
        return notifications;
    }

    public void setNotifications(Set<Notification> notifications) {
        this.notifications = notifications;
    }

    public Set<String> getFriends() {
        if (friends == null) friends = new HashSet<>();
        return friends;
    }

    public void setFriends(Set<String> friends) {
        this.friends = friends;
    }
}
