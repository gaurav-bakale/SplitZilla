package com.splitzilla.controller;

import com.splitzilla.model.ExceptionRule;
import com.splitzilla.service.ExceptionRuleService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/groups/{groupId}/exception-rules")
public class ExceptionRuleController {

    @Autowired
    private ExceptionRuleService exceptionRuleService;

    @GetMapping
    public ResponseEntity<List<ExceptionRule>> getRules(@PathVariable String groupId) {
        return ResponseEntity.ok(exceptionRuleService.getRulesForGroup(groupId));
    }

    @PostMapping
    public ResponseEntity<?> createRule(@PathVariable String groupId, @RequestBody Map<String, Object> body) {
        try {
            ExceptionRule rule = exceptionRuleService.createRule(
                    groupId,
                    (String) body.get("name"),
                    (String) body.get("description"),
                    (String) body.get("rule_type"),
                    (String) body.get("target_member_id"),
                    (String) body.get("applies_to_category"),
                    body.get("value") instanceof Number ? ((Number) body.get("value")).doubleValue() : null,
                    body.get("priority") instanceof Number ? ((Number) body.get("priority")).intValue() : null
            );
            return ResponseEntity.ok(rule);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @DeleteMapping("/{ruleId}")
    public ResponseEntity<?> deleteRule(@PathVariable String groupId, @PathVariable String ruleId) {
        try {
            exceptionRuleService.deleteRule(groupId, ruleId);
            return ResponseEntity.ok(Map.of("message", "Rule deleted"));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}
