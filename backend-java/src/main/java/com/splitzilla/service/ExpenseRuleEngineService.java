package com.splitzilla.service;

import com.splitzilla.model.ExceptionRule;
import com.splitzilla.model.ExceptionRuleType;
import com.splitzilla.model.ExpenseCategory;
import com.splitzilla.model.Group;
import com.splitzilla.model.User;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class ExpenseRuleEngineService {

    public RuleApplicationResult applyRules(Double amount, Group group, Map<String, Double> baseSplits,
                                            ExpenseCategory category, List<ExceptionRule> rules) {
        Map<String, Double> adjustedSplits = new LinkedHashMap<>(baseSplits);
        Map<String, String> memberNameMap = group.getMembers().stream()
                .collect(Collectors.toMap(User::getUserId, User::getName));

        List<String> appliedRuleSummaries = new ArrayList<>();

        rules.stream()
                .filter(rule -> Boolean.TRUE.equals(rule.getActive()))
                .filter(rule -> rule.getAppliesToCategory() == null || rule.getAppliesToCategory() == category)
                .sorted(Comparator.comparing(ExceptionRule::getPriority).thenComparing(ExceptionRule::getCreatedAt))
                .forEach(rule -> {
                    String targetMemberId = rule.getTargetMemberId();
                    if (!adjustedSplits.containsKey(targetMemberId)) {
                        return;
                    }
                    String targetMemberName = memberNameMap.getOrDefault(targetMemberId, "Member");

                    switch (rule.getRuleType()) {
                        case EXCLUDE_MEMBER -> {
                            double currentShare = adjustedSplits.getOrDefault(targetMemberId, 0.0);
                            if (currentShare <= 0.0) {
                                return;
                            }
                            applyTargetShare(adjustedSplits, targetMemberId, 0.0);
                            appliedRuleSummaries.add(rule.getName() + ": excluded " + targetMemberName + " from this expense");
                        }
                        case FIXED_AMOUNT -> {
                            double desiredShare = Math.min(rule.getValue(), amount);
                            applyTargetShare(adjustedSplits, targetMemberId, desiredShare);
                            appliedRuleSummaries.add(rule.getName() + ": set " + targetMemberName + "'s share to $" + formatAmount(desiredShare));
                        }
                        case FIXED_PERCENTAGE -> {
                            double desiredShare = roundAmount(amount * (rule.getValue() / 100.0));
                            applyTargetShare(adjustedSplits, targetMemberId, desiredShare);
                            appliedRuleSummaries.add(rule.getName() + ": set " + targetMemberName + "'s share to " + roundAmount(rule.getValue()) + "%");
                        }
                        case CAP_AMOUNT -> {
                            double currentShare = adjustedSplits.getOrDefault(targetMemberId, 0.0);
                            double desiredShare = Math.min(currentShare, rule.getValue());
                            if (desiredShare != currentShare) {
                                applyTargetShare(adjustedSplits, targetMemberId, desiredShare);
                                appliedRuleSummaries.add(rule.getName() + ": capped " + targetMemberName + " at $" + formatAmount(desiredShare));
                            }
                        }
                    }
                });

        normalizeToTotal(adjustedSplits, amount);
        return new RuleApplicationResult(adjustedSplits, appliedRuleSummaries);
    }

    private void applyTargetShare(Map<String, Double> splits, String targetMemberId, double desiredShare) {
        double currentShare = splits.getOrDefault(targetMemberId, 0.0);
        double delta = roundAmount(desiredShare - currentShare);
        if (Math.abs(delta) < 0.009) {
            return;
        }

        Set<String> otherMembers = splits.keySet().stream()
                .filter(memberId -> !Objects.equals(memberId, targetMemberId))
                .collect(Collectors.toSet());

        if (otherMembers.isEmpty()) {
            splits.put(targetMemberId, roundAmount(desiredShare));
            return;
        }

        if (delta > 0) {
            double available = otherMembers.stream()
                    .mapToDouble(memberId -> splits.getOrDefault(memberId, 0.0))
                    .sum();
            if (available + 0.009 < delta) {
                throw new RuntimeException("Exception rule cannot be applied because there is not enough share to redistribute");
            }
            redistributeFromOthers(splits, otherMembers, delta);
        } else {
            redistributeToOthers(splits, otherMembers, -delta);
        }

        splits.put(targetMemberId, roundAmount(desiredShare));
    }

    private void redistributeFromOthers(Map<String, Double> splits, Set<String> memberIds, double amountToTake) {
        double total = memberIds.stream().mapToDouble(memberId -> splits.getOrDefault(memberId, 0.0)).sum();
        if (total <= 0.0) {
            throw new RuntimeException("Exception rule cannot be applied because no remaining share is available");
        }
        for (String memberId : memberIds) {
            double current = splits.getOrDefault(memberId, 0.0);
            double deduction = roundAmount(amountToTake * (current / total));
            splits.put(memberId, roundAmount(Math.max(0.0, current - deduction)));
        }
    }

    private void redistributeToOthers(Map<String, Double> splits, Set<String> memberIds, double amountToAdd) {
        double total = memberIds.stream().mapToDouble(memberId -> splits.getOrDefault(memberId, 0.0)).sum();
        if (total <= 0.0) {
            double equalShare = roundAmount(amountToAdd / memberIds.size());
            memberIds.forEach(memberId -> splits.put(memberId, roundAmount(splits.getOrDefault(memberId, 0.0) + equalShare)));
            return;
        }
        for (String memberId : memberIds) {
            double current = splits.getOrDefault(memberId, 0.0);
            double addition = roundAmount(amountToAdd * (current / total));
            splits.put(memberId, roundAmount(current + addition));
        }
    }

    private void normalizeToTotal(Map<String, Double> splits, double targetTotal) {
        Map<String, Double> rounded = new LinkedHashMap<>();
        splits.forEach((memberId, amount) -> rounded.put(memberId, roundAmount(amount)));

        double currentTotal = rounded.values().stream().mapToDouble(Double::doubleValue).sum();
        double difference = roundAmount(targetTotal - currentTotal);
        if (Math.abs(difference) < 0.009) {
            splits.clear();
            splits.putAll(rounded);
            return;
        }

        String adjustMember = rounded.entrySet().stream()
                .max(Map.Entry.comparingByValue())
                .map(Map.Entry::getKey)
                .orElse(null);
        if (adjustMember != null) {
            rounded.put(adjustMember, roundAmount(rounded.get(adjustMember) + difference));
        }

        splits.clear();
        splits.putAll(rounded);
    }

    private double roundAmount(double amount) {
        return Math.round(amount * 100.0) / 100.0;
    }

    private String formatAmount(double amount) {
        return String.format("%.2f", roundAmount(amount));
    }

    public static class RuleApplicationResult {
        private final Map<String, Double> adjustedSplits;
        private final List<String> appliedRuleSummaries;

        public RuleApplicationResult(Map<String, Double> adjustedSplits, List<String> appliedRuleSummaries) {
            this.adjustedSplits = adjustedSplits;
            this.appliedRuleSummaries = appliedRuleSummaries;
        }

        public Map<String, Double> getAdjustedSplits() {
            return adjustedSplits;
        }

        public List<String> getAppliedRuleSummaries() {
            return appliedRuleSummaries;
        }
    }
}
