package com.splitzilla.controller;

import com.splitzilla.model.Expense;
import com.splitzilla.pattern.visitor.IExportVisitor;
import com.splitzilla.service.ExpenseService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.time.format.DateTimeParseException;
import java.util.List;
import java.util.Map;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;

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
            String category = (String) body.get("category");
            Expense expense = expenseService.createExpense(description, amount, splitType, groupId, auth.getName(), category);
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

    @GetMapping("/group/{groupId}/filter")
    public ResponseEntity<?> filterExpenses(
            @PathVariable String groupId,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String memberId,
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate,
            @RequestParam(required = false) Double minAmount,
            @RequestParam(required = false) Double maxAmount,
            @RequestParam(required = false) String category
    ) {
        try {
            LocalDateTime start = null;
            LocalDateTime end = null;

            if (startDate != null && !startDate.isEmpty()) {
                try {
                    start = LocalDateTime.parse(startDate);
                } catch (DateTimeParseException e) {
                    return ResponseEntity.badRequest().body(Map.of("error", "Invalid start date format"));
                }
            }

            if (endDate != null && !endDate.isEmpty()) {
                try {
                    end = LocalDateTime.parse(endDate);
                } catch (DateTimeParseException e) {
                    return ResponseEntity.badRequest().body(Map.of("error", "Invalid end date format"));
                }
            }

            List<Expense> expenses = expenseService.filterExpenses(
                    groupId, search, memberId, start, end, minAmount, maxAmount, category
            );
            return ResponseEntity.ok(expenses);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/group/{groupId}/export")
    public ResponseEntity<?> exportExpenses(
            @PathVariable String groupId,
            @RequestParam(defaultValue = "csv") String format) {
        try {
            IExportVisitor visitor = expenseService.exportExpenses(groupId, format);
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.parseMediaType(visitor.getContentType()));
            headers.setContentDispositionFormData("attachment",
                    "expenses_" + groupId + "." + visitor.getFileExtension());
            return ResponseEntity.ok().headers(headers).body(visitor.getResult());
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/group/{groupId}/summary")
    public ResponseEntity<?> getGroupSummary(@PathVariable String groupId) {
        try {
            return ResponseEntity.ok(expenseService.getGroupSummary(groupId));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}
