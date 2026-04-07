package com.splitzilla.repository;

import com.splitzilla.model.GroupBudget;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface GroupBudgetRepository extends JpaRepository<GroupBudget, String> {
    Optional<GroupBudget> findByGroupId(String groupId);
    void deleteByGroupId(String groupId);
}
