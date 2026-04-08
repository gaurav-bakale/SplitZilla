package com.splitzilla.service;

import com.splitzilla.model.ExceptionRule;
import com.splitzilla.model.ExceptionRuleType;
import com.splitzilla.model.ExpenseCategory;
import com.splitzilla.model.Group;
import com.splitzilla.model.User;
import com.splitzilla.repository.ExceptionRuleRepository;
import com.splitzilla.repository.GroupRepository;
import com.splitzilla.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Objects;

@Service
public class ExceptionRuleService {

    @Autowired
    private ExceptionRuleRepository exceptionRuleRepository;

    @Autowired
    private GroupRepository groupRepository;

    @Autowired
    private UserRepository userRepository;

    public List<ExceptionRule> getRulesForGroup(String groupId) {
        Group group = populateGroup(groupRepository.findById(groupId)
                .orElseThrow(() -> new RuntimeException("Group not found")));
        return exceptionRuleRepository.findByGroupIdOrderByPriorityAscCreatedAtAsc(groupId).stream()
                .map(rule -> populateRuleDetails(rule, group))
                .toList();
    }

    public List<ExceptionRule> getActiveRulesForGroup(String groupId) {
        return getRulesForGroup(groupId).stream()
                .filter(rule -> Boolean.TRUE.equals(rule.getActive()))
                .toList();
    }

    public ExceptionRule createRule(String groupId, String name, String description, String ruleType,
                                    String targetMemberId, String category, Double value, Integer priority) {
        Group group = populateGroup(groupRepository.findById(groupId)
                .orElseThrow(() -> new RuntimeException("Group not found")));

        if (name == null || name.isBlank()) {
            throw new RuntimeException("Rule name is required");
        }

        ExceptionRuleType parsedRuleType;
        try {
            parsedRuleType = ExceptionRuleType.valueOf(ruleType.toUpperCase());
        } catch (Exception e) {
            throw new RuntimeException("Invalid rule type");
        }

        User targetMember = group.getMembers().stream()
                .filter(member -> member.getUserId().equals(targetMemberId))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("Target member must belong to the group"));

        ExceptionRule rule = new ExceptionRule();
        rule.setGroupId(groupId);
        rule.setName(name.trim());
        rule.setDescription(description != null ? description.trim() : null);
        rule.setRuleType(parsedRuleType);
        rule.setTargetMemberId(targetMember.getUserId());
        rule.setPriority(priority != null ? priority : 100);
        rule.setValue(validateRuleValue(parsedRuleType, value));

        if (category != null && !category.isBlank()) {
            try {
                rule.setAppliesToCategory(ExpenseCategory.valueOf(category.toUpperCase()));
            } catch (Exception e) {
                throw new RuntimeException("Invalid category");
            }
        }

        return populateRuleDetails(exceptionRuleRepository.save(rule), group);
    }

    public void deleteRule(String groupId, String ruleId) {
        ExceptionRule rule = exceptionRuleRepository.findByRuleIdAndGroupId(ruleId, groupId)
                .orElseThrow(() -> new RuntimeException("Rule not found"));
        exceptionRuleRepository.delete(rule);
    }

    private Double validateRuleValue(ExceptionRuleType ruleType, Double value) {
        return switch (ruleType) {
            case EXCLUDE_MEMBER -> null;
            case FIXED_AMOUNT, CAP_AMOUNT -> {
                if (value == null || value < 0) {
                    throw new RuntimeException("Rule value must be 0 or greater");
                }
                yield value;
            }
            case FIXED_PERCENTAGE -> {
                if (value == null || value < 0 || value > 100) {
                    throw new RuntimeException("Percentage rules must be between 0 and 100");
                }
                yield value;
            }
        };
    }

    private Group populateGroup(Group group) {
        group.setMembers(group.getMemberIds().stream()
                .map(memberId -> userRepository.findById(memberId).orElse(null))
                .filter(Objects::nonNull)
                .collect(java.util.stream.Collectors.toSet()));
        return group;
    }

    private ExceptionRule populateRuleDetails(ExceptionRule rule, Group group) {
        group.getMembers().stream()
                .filter(member -> member.getUserId().equals(rule.getTargetMemberId()))
                .findFirst()
                .ifPresent(member -> rule.setTargetMemberName(member.getName()));
        return rule;
    }
}
