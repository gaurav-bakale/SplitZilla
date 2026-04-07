package com.splitzilla.controller;

import com.splitzilla.service.BudgetService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/budgets")
public class BudgetController {

    @Autowired
    private BudgetService budgetService;

    /**
     * GET /api/budgets/group/{groupId}
     * Returns the current budget status report for a group.
     * Runs the Chain of Responsibility evaluation against live expense data.
     */
    @GetMapping("/group/{groupId}")
    public ResponseEntity<?> getBudgetStatus(@PathVariable String groupId) {
        try {
            return ResponseEntity.ok(budgetService.getBudgetStatus(groupId));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * POST /api/budgets/group/{groupId}
     * Set or update the budget for a group.
     *
     * Body:
     * {
     *   "amount": 1000.00,
     *   "warning_threshold": 0.80   // optional, defaults to 0.80
     * }
     */
    @PostMapping("/group/{groupId}")
    public ResponseEntity<?> setBudget(
            @PathVariable String groupId,
            @RequestBody Map<String, Object> body) {
        try {
            Double amount = body.get("amount") != null
                    ? ((Number) body.get("amount")).doubleValue() : null;
            Double warningThreshold = body.get("warning_threshold") != null
                    ? ((Number) body.get("warning_threshold")).doubleValue() : null;
            return ResponseEntity.ok(budgetService.setBudget(groupId, amount, warningThreshold));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * DELETE /api/budgets/group/{groupId}
     * Remove the budget for a group.
     */
    @DeleteMapping("/group/{groupId}")
    public ResponseEntity<?> deleteBudget(@PathVariable String groupId) {
        try {
            budgetService.deleteBudget(groupId);
            return ResponseEntity.ok(Map.of("message", "Budget removed"));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}
