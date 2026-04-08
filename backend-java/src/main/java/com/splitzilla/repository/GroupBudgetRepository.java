package com.splitzilla.repository;

import com.splitzilla.model.GroupBudget;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.Optional;

public interface GroupBudgetRepository extends MongoRepository<GroupBudget, String> {
    Optional<GroupBudget> findByGroupId(String groupId);
    void deleteByGroupId(String groupId);
}
