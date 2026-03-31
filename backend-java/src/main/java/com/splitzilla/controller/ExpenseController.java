package com.splitzilla.controller;

import com.splitzilla.model.Expense;
import com.splitzilla.service.ExpenseService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/expenses")
public class ExpenseController {

    @Autowired
    private ExpenseService expenseService;

    @GetMapping("/group/{groupId}")
    public ResponseEntity<List<Expense>> getExpenses(@PathVariable String groupId) {
        return ResponseEntity.ok(expenseService.getExpensesForGroup(groupId));
    }

    @PostMapping("/")
    public ResponseEntity<?> createExpense(@RequestBody Map<String, Object> body, Authentication auth) {
        try {
            String description = (String) body.get("description");
            Double amount = ((Number) body.get("amount")).doubleValue();
            String splitType = (String) body.get("split_type");
            String groupId = (String) body.get("group_id");
            Expense expense = expenseService.createExpense(description, amount, splitType, groupId, auth.getName());
            return ResponseEntity.ok(expense);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/balances/group/{groupId}")
    public ResponseEntity<?> getBalances(@PathVariable String groupId) {
        try {
            return ResponseEntity.ok(expenseService.getBalancesForGroup(groupId));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}
