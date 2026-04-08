package com.splitzilla.service;

import com.splitzilla.model.Group;
import com.splitzilla.model.Settlement;
import com.splitzilla.model.SettlementStatus;
import com.splitzilla.model.User;
import com.splitzilla.pattern.builder.SettlementOverviewBuilder;
import com.splitzilla.pattern.builder.SettlementResponseBuilder;
import com.splitzilla.pattern.observer.NotificationService;
import com.splitzilla.pattern.state.SettlementStateFactory;
import com.splitzilla.repository.GroupRepository;
import com.splitzilla.repository.SettlementRepository;
import com.splitzilla.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class SettlementService {

    @Autowired
    private GroupRepository groupRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private SettlementRepository settlementRepository;

    @Autowired
    private ExpenseService expenseService;

    @Autowired
    private SettlementStateFactory settlementStateFactory;

    @Autowired
    private NotificationService notificationService;

    public Map<String, Object> getSettlementOverview(String groupId, String userEmail) {
        Group group = getAuthorizedGroup(groupId, userEmail);
        Map<String, Double> baseBalances = extractBalances(expenseService.getBalancesForGroup(groupId));
        List<Settlement> activeSettlements = settlementRepository.findByGroupIdAndStatusInOrderByCreatedAtAsc(
                groupId, List.of(SettlementStatus.PENDING, SettlementStatus.PARTIAL)
        ).stream().map(this::populateSettlementReferences).toList();
        List<Settlement> completedSettlements = settlementRepository.findByGroupIdAndStatusOrderBySettledAtDesc(
                groupId, SettlementStatus.COMPLETED
        ).stream().map(this::populateSettlementReferences).toList();

        Map<String, Double> effectiveBalances = new HashMap<>(baseBalances);
        applyPaidAmounts(effectiveBalances, activeSettlements);
        applyPaidAmounts(effectiveBalances, completedSettlements);

        Map<String, Double> planningBalances = new HashMap<>(effectiveBalances);
        applyOutstandingAmounts(planningBalances, activeSettlements);

        List<Map<String, Object>> effectiveBalanceList = createBalanceList(group, effectiveBalances);
        List<Map<String, Object>> recommendedPlan = calculateSuggestedSettlements(planningBalances, group);
        List<Map<String, Object>> activeSettlementResponses = activeSettlements.stream()
                .map(this::toSettlementResponse)
                .toList();
        List<Map<String, Object>> completedSettlementResponses = completedSettlements.stream()
                .map(this::toSettlementResponse)
                .toList();

        Map<String, Object> metrics = new LinkedHashMap<>();
        metrics.put("total_outstanding", roundAmount(activeSettlements.stream()
                .mapToDouble(settlement -> settlement.getAmount() - settlement.getPaidAmount())
                .sum()));
        metrics.put("total_paid", roundAmount(activeSettlements.stream()
                .mapToDouble(Settlement::getPaidAmount)
                .sum() + completedSettlements.stream().mapToDouble(Settlement::getPaidAmount).sum()));
        metrics.put("open_transfers", activeSettlements.size());
        metrics.put("completed_transfers", completedSettlements.size());

        return new SettlementOverviewBuilder()
                .withBalances(effectiveBalanceList)
                .withRecommendedPlan(recommendedPlan)
                .withActiveSettlements(activeSettlementResponses)
                .withCompletedSettlements(completedSettlementResponses)
                .withMetrics(metrics)
                .build();
    }

    public Map<String, Object> recordSettlement(String groupId, String payerId, String payeeId, Double amount, String userEmail) {
        Group group = getAuthorizedGroup(groupId, userEmail);

        if (amount == null || amount <= 0) {
            throw new RuntimeException("Settlement amount must be greater than 0");
        }
        if (payerId == null || payeeId == null || payerId.equals(payeeId)) {
            throw new RuntimeException("Settlement must be between two different group members");
        }

        User payer = userRepository.findById(payerId)
                .orElseThrow(() -> new RuntimeException("Payer not found"));
        User payee = userRepository.findById(payeeId)
                .orElseThrow(() -> new RuntimeException("Payee not found"));

        if (!isGroupMember(group, payer.getUserId()) || !isGroupMember(group, payee.getUserId())) {
            throw new RuntimeException("Settlement users must belong to the group");
        }

        Settlement settlement = new Settlement();
        settlement.setGroup(group);
        settlement.setPayer(payer);
        settlement.setPayee(payee);
        settlement.setAmount(roundAmount(amount));
        settlement.setPaidAmount(roundAmount(amount));
        settlement.setStatus(SettlementStatus.COMPLETED);
        settlement.setLastPaymentAt(java.time.LocalDateTime.now());
        settlement.setSettledAt(java.time.LocalDateTime.now());

Settlement savedSettlement = populateSettlementReferences(settlementRepository.save(settlement));

Map<String, Object> event = new HashMap<>();
event.put("type", "settlement_recorded");
event.put("group_id", groupId);
event.put("payer_name", payer.getName());
event.put("payee_name", payee.getName());
event.put("amount", roundAmount(amount));
notificationService.notifyObservers(event);

        return toSettlementResponse(savedSettlement);
    }

    public Map<String, Object> createSettlementPlan(String groupId, String userEmail) {
        Group group = getAuthorizedGroup(groupId, userEmail);
        List<Settlement> activeSettlements = settlementRepository.findByGroupIdAndStatusInOrderByCreatedAtAsc(
                groupId, List.of(SettlementStatus.PENDING, SettlementStatus.PARTIAL)
        ).stream().map(this::populateSettlementReferences).toList();

        if (!activeSettlements.isEmpty()) {
            throw new RuntimeException("Finish the current active settlement plan before generating another one");
        }

        Map<String, Double> effectiveBalances = extractBalances(expenseService.getBalancesForGroup(groupId));
        List<Settlement> completedSettlements = settlementRepository.findByGroupIdAndStatusOrderBySettledAtDesc(
                groupId, SettlementStatus.COMPLETED
        ).stream().map(this::populateSettlementReferences).toList();
        applyPaidAmounts(effectiveBalances, completedSettlements);

        List<Map<String, Object>> suggestions = calculateSuggestedSettlements(effectiveBalances, group);
        if (suggestions.isEmpty()) {
            throw new RuntimeException("This group is already fully settled");
        }

        List<Map<String, Object>> createdSettlements = new ArrayList<>();
        for (Map<String, Object> suggestion : suggestions) {
            Settlement settlement = new Settlement();
            settlement.setGroup(group);
            settlement.setPayer(getMemberFromGroup(group, (String) suggestion.get("payer_id")));
            settlement.setPayee(getMemberFromGroup(group, (String) suggestion.get("payee_id")));
            settlement.setAmount(roundAmount(((Number) suggestion.get("amount")).doubleValue()));
            settlement.setPaidAmount(0.0);
            settlement.setStatus(SettlementStatus.PENDING);
            createdSettlements.add(toSettlementResponse(
                    populateSettlementReferences(settlementRepository.save(settlement))
            ));
        }

        Map<String, Object> event = new HashMap<>();
        event.put("type", "settlement_plan_created");
        event.put("group_id", groupId);
        event.put("settlement_count", createdSettlements.size());
        notificationService.notifyObservers(event);

        Map<String, Object> response = new LinkedHashMap<>();
        response.put("message", "Settlement plan created");
        response.put("created_settlements", createdSettlements);
        return response;
    }

    public Map<String, Object> recordPayment(String groupId, String settlementId, Double amount, String userEmail) {
        getAuthorizedGroup(groupId, userEmail);
        Settlement settlement = populateSettlementReferences(
                settlementRepository.findBySettlementIdAndGroupId(settlementId, groupId)
                        .orElseThrow(() -> new RuntimeException("Settlement plan not found"))
        );

        settlementStateFactory.getState(settlement.getStatus()).applyPayment(settlement, roundAmount(amount));
Settlement savedSettlement = populateSettlementReferences(settlementRepository.save(settlement));

Map<String, Object> event = new HashMap<>();
event.put("type", "payment_recorded");
event.put("group_id", groupId);
event.put("payer_name", savedSettlement.getPayer().getName());
event.put("amount", roundAmount(amount));
event.put("status", savedSettlement.getStatus().name().toLowerCase());
notificationService.notifyObservers(event);

        return toSettlementResponse(savedSettlement);
    }

    private Group getAuthorizedGroup(String groupId, String userEmail) {
        Group group = populateGroup(groupRepository.findById(groupId)
                .orElseThrow(() -> new RuntimeException("Group not found")));
        User currentUser = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (!isGroupMember(group, currentUser.getUserId())) {
            throw new RuntimeException("You are not a member of this group");
        }

        return group;
    }

    private boolean isGroupMember(Group group, String userId) {
        return group.getMembers().stream().anyMatch(member -> member.getUserId().equals(userId));
    }

    private User getMemberFromGroup(Group group, String userId) {
        return group.getMembers().stream()
                .filter(member -> member.getUserId().equals(userId))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("User does not belong to this group"));
    }

    private Map<String, Double> extractBalances(Map<String, Object> balanceResult) {
        Map<String, Double> balances = new HashMap<>();
        @SuppressWarnings("unchecked")
        List<Map<String, Object>> entries = (List<Map<String, Object>>) balanceResult.get("balances");
        for (Map<String, Object> balance : entries) {
            String userId = (String) balance.get("user_id");
            Double amount = ((Number) balance.get("balance")).doubleValue();
            balances.put(userId, amount);
        }
        return balances;
    }

    private void applyPaidAmounts(Map<String, Double> balances, List<Settlement> settlements) {
        for (Settlement settlement : settlements) {
            double paidAmount = roundAmount(settlement.getPaidAmount());
            if (paidAmount <= 0.009) {
                continue;
            }
            balances.merge(settlement.getPayer().getUserId(), paidAmount, Double::sum);
            balances.merge(settlement.getPayee().getUserId(), -paidAmount, Double::sum);
        }
    }

    private void applyOutstandingAmounts(Map<String, Double> balances, List<Settlement> settlements) {
        for (Settlement settlement : settlements) {
            double outstandingAmount = roundAmount(settlement.getAmount() - settlement.getPaidAmount());
            if (outstandingAmount <= 0.009) {
                continue;
            }
            balances.merge(settlement.getPayer().getUserId(), outstandingAmount, Double::sum);
            balances.merge(settlement.getPayee().getUserId(), -outstandingAmount, Double::sum);
        }
    }

    private List<Map<String, Object>> createBalanceList(Group group, Map<String, Double> balances) {
        List<Map<String, Object>> result = new ArrayList<>();
        for (User member : group.getMembers()) {
            Map<String, Object> entry = new LinkedHashMap<>();
            entry.put("user_id", member.getUserId());
            entry.put("user_name", member.getName());
            entry.put("balance", roundAmount(balances.getOrDefault(member.getUserId(), 0.0)));
            result.add(entry);
        }
        return result;
    }

    private List<Map<String, Object>> calculateSuggestedSettlements(Map<String, Double> balances, Group group) {
        Map<String, String> nameMap = new HashMap<>();
        for (User member : group.getMembers()) {
            nameMap.put(member.getUserId(), member.getName());
        }

        List<SettlementParty> creditors = new ArrayList<>();
        List<SettlementParty> debtors = new ArrayList<>();

        for (Map.Entry<String, Double> entry : balances.entrySet()) {
            double roundedBalance = roundAmount(entry.getValue());
            if (roundedBalance > 0.009) {
                creditors.add(new SettlementParty(entry.getKey(), roundedBalance));
            } else if (roundedBalance < -0.009) {
                debtors.add(new SettlementParty(entry.getKey(), Math.abs(roundedBalance)));
            }
        }

        creditors.sort((left, right) -> Double.compare(right.remainingAmount, left.remainingAmount));
        debtors.sort((left, right) -> Double.compare(right.remainingAmount, left.remainingAmount));

        List<Map<String, Object>> suggestions = new ArrayList<>();
        int debtorIndex = 0;
        int creditorIndex = 0;

        while (debtorIndex < debtors.size() && creditorIndex < creditors.size()) {
            SettlementParty debtor = debtors.get(debtorIndex);
            SettlementParty creditor = creditors.get(creditorIndex);

            double amount = roundAmount(Math.min(debtor.remainingAmount, creditor.remainingAmount));
            if (amount <= 0.009) {
                break;
            }

            Map<String, Object> suggestion = new HashMap<>();
            suggestion.put("payer_id", debtor.userId);
            suggestion.put("payer_name", nameMap.get(debtor.userId));
            suggestion.put("payee_id", creditor.userId);
            suggestion.put("payee_name", nameMap.get(creditor.userId));
            suggestion.put("amount", amount);
            suggestions.add(suggestion);

            debtor.remainingAmount = roundAmount(debtor.remainingAmount - amount);
            creditor.remainingAmount = roundAmount(creditor.remainingAmount - amount);

            if (debtor.remainingAmount <= 0.009) {
                debtorIndex++;
            }
            if (creditor.remainingAmount <= 0.009) {
                creditorIndex++;
            }
        }

        return suggestions;
    }

    private Map<String, Object> toSettlementResponse(Settlement settlement) {
        return new SettlementResponseBuilder()
                .fromSettlement(settlement)
                .build();
    }

    private double roundAmount(double amount) {
        return Math.round(amount * 100.0) / 100.0;
    }

    private Group populateGroup(Group group) {
        group.setMembers(group.getMemberIds().stream()
                .map(memberId -> userRepository.findById(memberId).orElse(null))
                .filter(Objects::nonNull)
                .collect(Collectors.toSet()));
        return group;
    }

    private Settlement populateSettlementReferences(Settlement settlement) {
        if (settlement.getGroupId() != null) {
            groupRepository.findById(settlement.getGroupId())
                    .map(this::populateGroup)
                    .ifPresent(settlement::setGroup);
        }
        if (settlement.getPayerId() != null) {
            userRepository.findById(settlement.getPayerId()).ifPresent(settlement::setPayer);
        }
        if (settlement.getPayeeId() != null) {
            userRepository.findById(settlement.getPayeeId()).ifPresent(settlement::setPayee);
        }
        return settlement;
    }

    private static class SettlementParty {
        private final String userId;
        private double remainingAmount;

        private SettlementParty(String userId, double remainingAmount) {
            this.userId = userId;
            this.remainingAmount = remainingAmount;
        }
    }
}
