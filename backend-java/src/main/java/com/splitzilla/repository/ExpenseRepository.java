package com.splitzilla.repository;

import com.splitzilla.model.Expense;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface ExpenseRepository extends MongoRepository<Expense, String> {
    List<Expense> findByGroupId(String groupId);
}
