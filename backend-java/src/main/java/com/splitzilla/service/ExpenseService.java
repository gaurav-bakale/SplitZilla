package com.splitzilla.service;

import com.splitzilla.model.Expense;
import com.splitzilla.model.ExpenseCategory;
import com.splitzilla.model.ExpenseSplit;
import com.splitzilla.model.Group;
import com.splitzilla.model.User;
import com.splitzilla.pattern.builder.CategorySummaryBuilder;
import com.splitzilla.pattern.observer.NotificationService;
import com.splitzilla.pattern.strategy.ISplitStrategy;
import com.splitzilla.pattern.strategy.SplitStrategyFactory;
import com.splitzilla.pattern.visitor.ExportVisitorFactory;
import com.splitzilla.pattern.visitor.IExportVisitor;
import com.splitzilla.repository.ExpenseRepository;
import com.splitzilla.repository.GroupRepository;
import com.splitzilla.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class ExpenseService {

    @Autowired
    private ExpenseRepository expenseRepository;

    @Autowired
    private GroupRepository groupRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private SplitStrategyFactory splitStrategyFactory;

    @Autowired
    private NotificationService notificationService;

    @Autowired
    private ExceptionRuleService exceptionRuleService;

    @Autowired
    private ExpenseRuleEngineService expenseRuleEngineService;

    @Autowired
    private ExportVisitorFactory exportVisitorFactory;

    public List<Expense> getExpensesForGroup(String groupId) {
        return expenseRepository.findByGroupId(groupId).stream()
                .map(this::populateExpenseReferences)
                .toList();
    }

    public List<Expense> filterExpenses(String groupId, String searchTerm, String memberId,
                                        LocalDateTime startDate, LocalDateTime endDate,
                                        Double minAmount, Double maxAmount, String category) {
        List<Expense> expenses = getExpensesForGroup(groupId);

        return expenses.stream()
                .filter(expense -> {
                    if (searchTerm != null && !searchTerm.isEmpty()) {
                        return expense.getDescription().toLowerCase().contains(searchTerm.toLowerCase());
                    }
                    return true;
                })
                .filter(expense -> {
                    if (memberId != null && !memberId.isEmpty()) {
                        return expense.getPayer().getUserId().equals(memberId) ||
                                expense.getSplits().stream()
                                        .anyMatch(split -> split.getUser().getUserId().equals(memberId));
                    }
                    return true;
                })
                .filter(expense -> {
                    if (startDate != null) {
                        return expense.getDate().isAfter(startDate) || expense.getDate().isEqual(startDate);
                    }
                    return true;
                })
                .filter(expense -> {
                    if (endDate != null) {
                        return expense.getDate().isBefore(endDate) || expense.getDate().isEqual(endDate);
                    }
                    return true;
                })
                .filter(expense -> {
                    if (minAmount != null) {
                        return expense.getAmount() >= minAmount;
                    }
                    return true;
                })
                .filter(expense -> {
                    if (maxAmount != null) {
                        return expense.getAmount() <= maxAmount;
                    }
                    return true;
                })
                .filter(expense -> {
                    if (category != null && !category.isEmpty()) {
                        try {
                            ExpenseCategory cat = ExpenseCategory.valueOf(category.toUpperCase());
                            return expense.getCategory() == cat;
                        } catch (IllegalArgumentException e) {
                            return false;
                        }
                    }
                    return true;
                })
                .collect(Collectors.toList());
    }

    public IExportVisitor exportExpenses(String groupId, String format) {
        Group group = populateGroup(groupRepository.findById(groupId)
                .orElseThrow(() -> new RuntimeException("Group not found")));
        List<Expense> expenses = getExpensesForGroup(groupId);

        IExportVisitor visitor = exportVisitorFactory.getVisitor(format);
        visitor.visitGroup(group);
        for (Expense expense : expenses) {
            visitor.visitExpense(expense);
        }
        return visitor;
    }

    public Map<String, Object> getGroupSummary(String groupId) {
        Group group = populateGroup(groupRepository.findById(groupId)
                .orElseThrow(() -> new RuntimeException("Group not found")));
        List<Expense> expenses = getExpensesForGroup(groupId);

        Map<String, Object> summary = new LinkedHashMap<>();
        summary.put("group_name", group.getName());
        summary.put("group_description", group.getDescription());
        summary.put("total_expenses", expenses.size());
        summary.put("total_amount", expenses.stream()
                .mapToDouble(Expense::getAmount)
                .sum());
        summary.put("member_count", group.getMembers().size());

        Map<String, Double> memberExpenses = new HashMap<>();
        for (Expense expense : expenses) {
            String payerName = expense.getPayer().getName();
            memberExpenses.merge(payerName, expense.getAmount(), Double::sum);
        }
        summary.put("expenses_by_member", memberExpenses);

        Map<String, Integer> expensesBySplitType = expenses.stream()
                .collect(Collectors.groupingBy(
                        Expense::getSplitType,
                        Collectors.collectingAndThen(Collectors.counting(), Long::intValue)
                ));
        summary.put("expenses_by_split_type", expensesBySplitType);

        Map<ExpenseCategory, Double> categoryTotals = new LinkedHashMap<>();
        Map<ExpenseCategory, Integer> categoryCounts = new LinkedHashMap<>();
        for (Expense expense : expenses) {
            ExpenseCategory cat = expense.getCategory();
            categoryTotals.merge(cat, expense.getAmount(), Double::sum);
            categoryCounts.merge(cat, 1, Integer::sum);
        }

        ExpenseCategory topCategory = categoryTotals.entrySet().stream()
                .max(Map.Entry.comparingByValue())
                .map(Map.Entry::getKey)
                .orElse(null);
        Double topAmount = topCategory != null ? categoryTotals.get(topCategory) : 0.0;

        Map<String, Object> categoryBreakdown = new CategorySummaryBuilder()
                .withCategoryTotals(categoryTotals)
                .withCategoryCounts(categoryCounts)
                .withTopCategory(topCategory != null ? topCategory.name() : null, topAmount)
                .build();
        summary.put("category_breakdown", categoryBreakdown);

        return summary;
    }

    public Expense createExpense(String description, Double amount, String splitType,
                                 String groupId, String payerEmail, String categoryStr) {
        Group group = populateGroup(groupRepository.findById(groupId)
                .orElseThrow(() -> new RuntimeException("Group not found")));
        User payer = userRepository.findByEmail(payerEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));

        ExpenseCategory category = ExpenseCategory.GENERAL;
        if (categoryStr != null && !categoryStr.isEmpty()) {
            try {
                category = ExpenseCategory.valueOf(categoryStr.toUpperCase());
            } catch (IllegalArgumentException e) {
                throw new RuntimeException("Invalid category: " + categoryStr +
                        ". Valid values: FOOD, ACCOMMODATION, TRANSPORT, ENTERTAINMENT, UTILITIES, SHOPPING, GENERAL");
            }
        }

        Expense expense = new Expense();
        expense.setDescription(description);
        expense.setAmount(amount);
        expense.setSplitType(splitType);
        expense.setPayer(payer);
        expense.setGroup(group);
        expense.setCategory(category);

        List<String> memberIds = new ArrayList<>(group.getMemberIds());

        ISplitStrategy strategy = splitStrategyFactory.getStrategy(splitType);
        Map<String, Double> splits = strategy.split(amount, memberIds, new HashMap<>());
        ExpenseRuleEngineService.RuleApplicationResult ruleResult = expenseRuleEngineService.applyRules(
                amount,
                group,
                splits,
                category,
                exceptionRuleService.getActiveRulesForGroup(groupId)
        );

        Set<ExpenseSplit> expenseSplits = new HashSet<>();
        for (Map.Entry<String, Double> entry : ruleResult.getAdjustedSplits().entrySet()) {
            userRepository.findById(entry.getKey()).ifPresent(user -> {
                ExpenseSplit split = new ExpenseSplit();
                split.setExpense(expense);
                split.setUser(user);
                split.setAmount(entry.getValue());
                expenseSplits.add(split);
            });
        }
        expense.setSplits(expenseSplits);
        expense.setAppliedRuleSummaries(ruleResult.getAppliedRuleSummaries());

        Expense saved = expenseRepository.save(expense);

        // Fire observer event after the expense is persisted
        List<String> groupMemberIds = group.getMembers().stream()
                .map(User::getUserId)
                .collect(Collectors.toList());

        Map<String, Object> event = new HashMap<>();
        event.put("type", "expense_added");
        event.put("group_id", groupId);
        event.put("payer_id", payer.getUserId());
        event.put("payer_name", payer.getName());
        event.put("expense_description", description);
        event.put("amount", amount);
        event.put("category", category.name());
        event.put("group_members", groupMemberIds);
        notificationService.notifyObservers(event);

        return populateExpenseReferences(saved);
    }

    public Map<String, Object> getBalancesForGroup(String groupId) {
        Group group = populateGroup(groupRepository.findById(groupId)
                .orElseThrow(() -> new RuntimeException("Group not found")));
        Map<String, Double> balanceMap = calculateBalanceMap(groupId, group);
        Map<String, String> nameMap = new HashMap<>();

        for (User member : group.getMembers()) {
            nameMap.put(member.getUserId(), member.getName());
        }

        List<Map<String, Object>> balances = new ArrayList<>();
        for (Map.Entry<String, Double> entry : balanceMap.entrySet()) {
            Map<String, Object> balanceEntry = new HashMap<>();
            balanceEntry.put("user_id", entry.getKey());
            balanceEntry.put("user_name", nameMap.get(entry.getKey()));
            balanceEntry.put("balance", Math.round(entry.getValue() * 100.0) / 100.0);
            balances.add(balanceEntry);
        }

        Map<String, Object> result = new HashMap<>();
        result.put("balances", balances);
        return result;
    }

    private Map<String, Double> calculateBalanceMap(String groupId, Group group) {
        List<Expense> expenses = getExpensesForGroup(groupId);
        Map<String, Double> balanceMap = new HashMap<>();

        for (User member : group.getMembers()) {
            balanceMap.put(member.getUserId(), 0.0);
        }

        for (Expense expense : expenses) {
            String payerId = expense.getPayer().getUserId();
            balanceMap.merge(payerId, expense.getAmount(), Double::sum);

            for (ExpenseSplit split : expense.getSplits()) {
                String userId = split.getUser().getUserId();
                balanceMap.merge(userId, -split.getAmount(), Double::sum);
            }
        }

        return balanceMap;
    }

    private Group populateGroup(Group group) {
        group.setMembers(group.getMemberIds().stream()
                .map(memberId -> userRepository.findById(memberId).orElse(null))
                .filter(Objects::nonNull)
                .collect(Collectors.toSet()));
        return group;
    }

    private Expense populateExpenseReferences(Expense expense) {
        if (expense.getPayerId() != null) {
            userRepository.findById(expense.getPayerId()).ifPresent(expense::setPayer);
        }
        if (expense.getGroupId() != null) {
            groupRepository.findById(expense.getGroupId())
                    .map(this::populateGroup)
                    .ifPresent(expense::setGroup);
        }
        if (expense.getSplits() != null) {
            expense.getSplits().forEach(split -> {
                split.setExpense(expense);
                if (split.getUserId() != null) {
                    userRepository.findById(split.getUserId()).ifPresent(split::setUser);
                }
            });
        }
        return expense;
    }
}
