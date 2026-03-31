package com.splitzilla.repository;

import com.splitzilla.model.Expense;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ExpenseRepository extends JpaRepository<Expense, String> {
    List<Expense> findByGroupGroupId(String groupId);
}
