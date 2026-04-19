package com.splitzilla.controller;

import com.splitzilla.model.RecurringExpense;
import com.splitzilla.service.RecurringExpenseService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/expenses/recurring")
public class RecurringExpenseController {

    @Autowired
    private RecurringExpenseService recurringService;

    @PostMapping("/")
    public ResponseEntity<?> create(@RequestBody Map<String, Object> body, Authentication auth) {
        try {
            String description = (String) body.get("description");
            Double amount = ((Number) body.get("amount")).doubleValue();
            String splitType = (String) body.get("split_type");
            String groupId = (String) body.get("group_id");
            String category = (String) body.get("category");
            String frequency = (String) body.get("frequency");
            boolean runImmediately = Boolean.TRUE.equals(body.get("run_immediately"));
            RecurringExpense rec = recurringService.create(description, amount, splitType,
                    groupId, auth.getName(), category, frequency, runImmediately);
            return ResponseEntity.ok(rec);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/group/{groupId}")
    public ResponseEntity<List<RecurringExpense>> list(@PathVariable String groupId) {
        return ResponseEntity.ok(recurringService.getForGroup(groupId));
    }

    @DeleteMapping("/{recurringId}")
    public ResponseEntity<?> cancel(@PathVariable String recurringId) {
        try {
            recurringService.cancel(recurringId);
            return ResponseEntity.ok(Map.of("status", "cancelled"));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}
