package com.splitzilla.repository;

import com.splitzilla.model.ExceptionRule;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;
import java.util.Optional;

public interface ExceptionRuleRepository extends MongoRepository<ExceptionRule, String> {
    List<ExceptionRule> findByGroupIdOrderByPriorityAscCreatedAtAsc(String groupId);
    Optional<ExceptionRule> findByRuleIdAndGroupId(String ruleId, String groupId);
}
