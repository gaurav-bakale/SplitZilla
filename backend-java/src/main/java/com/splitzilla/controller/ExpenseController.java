package com.splitzilla.controller;

import com.splitzilla.model.Expense;
import com.splitzilla.pattern.visitor.IExportVisitor;
import com.splitzilla.service.ExpenseService;
import com.splitzilla.service.ForbiddenException;
import com.splitzilla.service.GroupService;
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

    @Autowired
    private GroupService groupService;

    @GetMapping("/group/{groupId}")
    public ResponseEntity<?> getExpenses(@PathVariable String groupId, Authentication auth) {
        try {
            groupService.requireMember(groupId, auth.getName());
            return ResponseEntity.ok(expenseService.getExpensesForGroup(groupId));
        } catch (ForbiddenException e) {
            return ResponseEntity.status(403).body(Map.of("error", e.getMessage()));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/")
    public ResponseEntity<?> createExpense(@RequestBody Map<String, Object> body, Authentication auth) {
        try {
            String description = (String) body.get("description");
            Object rawAmount = body.get("amount");
            if (!(rawAmount instanceof Number)) {
                return ResponseEntity.badRequest().body(Map.of("error", "amount is required"));
            }
            Double amount = ((Number) rawAmount).doubleValue();
            String splitType = body.get("split_type") != null ? (String) body.get("split_type") : "equal";
            String groupId = (String) body.get("group_id");
            String category = body.get("category") != null ? (String) body.get("category") : "GENERAL";
            if (groupId == null) {
                return ResponseEntity.badRequest().body(Map.of("error", "group_id is required"));
            }
            groupService.requireMember(groupId, auth.getName());
            Map<String, Object> splitParams = new java.util.HashMap<>();
            if ("percentage".equals(splitType) && body.containsKey("percentages")) {
                splitParams.put("percentages", body.get("percentages"));
            } else if ("exact".equals(splitType) && body.containsKey("exact_amounts")) {
                splitParams.put("exact_amounts", body.get("exact_amounts"));
            }
            Expense expense = expenseService.createExpense(description, amount, splitType, groupId, auth.getName(), category, splitParams);
            return ResponseEntity.ok(expense);
        } catch (ForbiddenException e) {
            return ResponseEntity.status(403).body(Map.of("error", e.getMessage()));
        } catch (RuntimeException e) {
            String msg = e.getMessage() != null ? e.getMessage() : "Failed to create expense";
            return ResponseEntity.badRequest().body(Map.of("error", msg));
        }
    }

    @GetMapping("/balances/group/{groupId}")
    public ResponseEntity<?> getBalances(@PathVariable String groupId, Authentication auth) {
        try {
            groupService.requireMember(groupId, auth.getName());
            return ResponseEntity.ok(expenseService.getBalancesForGroup(groupId));
        } catch (ForbiddenException e) {
            return ResponseEntity.status(403).body(Map.of("error", e.getMessage()));
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
            @RequestParam(required = false) String category,
            Authentication auth
    ) {
        try {
            groupService.requireMember(groupId, auth.getName());
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
        } catch (ForbiddenException e) {
            return ResponseEntity.status(403).body(Map.of("error", e.getMessage()));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/group/{groupId}/export")
    public ResponseEntity<?> exportExpenses(
            @PathVariable String groupId,
            @RequestParam(defaultValue = "csv") String format,
            Authentication auth) {
        try {
            groupService.requireMember(groupId, auth.getName());
            IExportVisitor visitor = expenseService.exportExpenses(groupId, format);
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.parseMediaType(visitor.getContentType()));
            headers.setContentDispositionFormData("attachment",
                    "expenses_" + groupId + "." + visitor.getFileExtension());
            return ResponseEntity.ok().headers(headers).body(visitor.getResult());
        } catch (ForbiddenException e) {
            return ResponseEntity.status(403).body(Map.of("error", e.getMessage()));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/group/{groupId}/summary")
    public ResponseEntity<?> getGroupSummary(@PathVariable String groupId, Authentication auth) {
        try {
            groupService.requireMember(groupId, auth.getName());
            return ResponseEntity.ok(expenseService.getGroupSummary(groupId));
        } catch (ForbiddenException e) {
            return ResponseEntity.status(403).body(Map.of("error", e.getMessage()));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}
