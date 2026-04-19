package com.splitzilla.controller;

import com.splitzilla.service.ForbiddenException;
import com.splitzilla.service.GroupService;
import com.splitzilla.service.SettlementService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/settlements")
public class SettlementController {

    @Autowired
    private SettlementService settlementService;

    @Autowired
    private GroupService groupService;

    @GetMapping("/group/{groupId}")
    public ResponseEntity<?> getSettlementOverview(@PathVariable String groupId, Authentication auth) {
        try {
            groupService.requireMember(groupId, auth.getName());
            return ResponseEntity.ok(settlementService.getSettlementOverview(groupId, auth.getName()));
        } catch (ForbiddenException e) {
            return ResponseEntity.status(403).body(Map.of("error", e.getMessage()));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/group/{groupId}/record")
    public ResponseEntity<?> recordSettlement(
            @PathVariable String groupId,
            @RequestBody Map<String, Object> body,
            Authentication auth
    ) {
        try {
            groupService.requireMember(groupId, auth.getName());
            String payerId = (String) body.get("payer_id");
            String payeeId = (String) body.get("payee_id");
            Object rawAmount = body.get("amount");
            if (!(rawAmount instanceof Number)) {
                return ResponseEntity.badRequest().body(Map.of("error", "amount is required"));
            }
            Double amount = ((Number) rawAmount).doubleValue();
            return ResponseEntity.ok(settlementService.recordSettlement(groupId, payerId, payeeId, amount, auth.getName()));
        } catch (ForbiddenException e) {
            return ResponseEntity.status(403).body(Map.of("error", e.getMessage()));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/group/{groupId}/plans")
    public ResponseEntity<?> createSettlementPlan(@PathVariable String groupId, Authentication auth) {
        try {
            groupService.requireMember(groupId, auth.getName());
            return ResponseEntity.ok(settlementService.createSettlementPlan(groupId, auth.getName()));
        } catch (ForbiddenException e) {
            return ResponseEntity.status(403).body(Map.of("error", e.getMessage()));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/group/{groupId}/{settlementId}/payments")
    public ResponseEntity<?> recordPayment(
            @PathVariable String groupId,
            @PathVariable String settlementId,
            @RequestBody Map<String, Object> body,
            Authentication auth
    ) {
        try {
            groupService.requireMember(groupId, auth.getName());
            Object rawAmount = body.get("amount");
            if (!(rawAmount instanceof Number)) {
                return ResponseEntity.badRequest().body(Map.of("error", "amount is required"));
            }
            Double amount = ((Number) rawAmount).doubleValue();
            return ResponseEntity.ok(settlementService.recordPayment(groupId, settlementId, amount, auth.getName()));
        } catch (ForbiddenException e) {
            return ResponseEntity.status(403).body(Map.of("error", e.getMessage()));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}
