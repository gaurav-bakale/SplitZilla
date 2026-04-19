package com.splitzilla.repository;

import com.splitzilla.model.RecurringExpense;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.time.LocalDateTime;
import java.util.List;

public interface RecurringExpenseRepository extends MongoRepository<RecurringExpense, String> {
    List<RecurringExpense> findByGroupId(String groupId);
    List<RecurringExpense> findByActiveTrueAndNextRunAtBefore(LocalDateTime cutoff);
}
