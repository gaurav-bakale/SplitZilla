package com.splitzilla.service;

import com.splitzilla.model.Group;
import com.splitzilla.model.Settlement;
import com.splitzilla.model.User;
import com.splitzilla.repository.GroupRepository;
import com.splitzilla.repository.SettlementRepository;
import com.splitzilla.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.*;

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

    public Map<String, Object> getSettlementOverview(String groupId, String userEmail) {
        Group group = getAuthorizedGroup(groupId, userEmail);
        Map<String, Object> balanceResult = expenseService.getBalancesForGroup(groupId);

        Map<String, Double> effectiveBalances = new HashMap<>();
        @SuppressWarnings("unchecked")
        List<Map<String, Object>> balances = (List<Map<String, Object>>) balanceResult.get("balances");
        for (Map<String, Object> balance : balances) {
            String userId = (String) balance.get("user_id");
            Double amount = ((Number) balance.get("balance")).doubleValue();
            effectiveBalances.put(userId, amount);
        }

        List<Settlement> completedSettlements = settlementRepository.findByGroupGroupIdOrderBySettledAtDesc(groupId);
        for (Settlement settlement : completedSettlements) {
            effectiveBalances.merge(settlement.getPayer().getUserId(), settlement.getAmount(), Double::sum);
            effectiveBalances.merge(settlement.getPayee().getUserId(), -settlement.getAmount(), Double::sum);
        }

        List<Map<String, Object>> suggestedSettlements = calculateSuggestedSettlements(effectiveBalances, group);

        List<Map<String, Object>> effectiveBalanceList = new ArrayList<>();
        for (User member : group.getMembers()) {
            Map<String, Object> entry = new HashMap<>();
            double balance = roundAmount(effectiveBalances.getOrDefault(member.getUserId(), 0.0));
            entry.put("user_id", member.getUserId());
            entry.put("user_name", member.getName());
            entry.put("balance", balance);
            effectiveBalanceList.add(entry);
        }

        Map<String, Object> result = new HashMap<>();
        result.put("balances", effectiveBalanceList);
        result.put("suggestions", suggestedSettlements);
        result.put("completed_settlements", completedSettlements.stream()
                .map(this::toSettlementResponse)
                .toList());
        return result;
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

        Settlement savedSettlement = settlementRepository.save(settlement);
        return toSettlementResponse(savedSettlement);
    }

    private Group getAuthorizedGroup(String groupId, String userEmail) {
        Group group = groupRepository.findById(groupId)
                .orElseThrow(() -> new RuntimeException("Group not found"));
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
        Map<String, Object> response = new HashMap<>();
        response.put("settlement_id", settlement.getSettlementId());
        response.put("group_id", settlement.getGroup().getGroupId());
        response.put("payer_id", settlement.getPayer().getUserId());
        response.put("payer_name", settlement.getPayer().getName());
        response.put("payee_id", settlement.getPayee().getUserId());
        response.put("payee_name", settlement.getPayee().getName());
        response.put("amount", roundAmount(settlement.getAmount()));
        response.put("settled_at", settlement.getSettledAt());
        return response;
    }

    private double roundAmount(double amount) {
        return Math.round(amount * 100.0) / 100.0;
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
