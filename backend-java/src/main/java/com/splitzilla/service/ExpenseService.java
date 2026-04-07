package com.splitzilla.service;

import com.splitzilla.model.Expense;
import com.splitzilla.model.ExpenseSplit;
import com.splitzilla.model.Group;
import com.splitzilla.model.User;
import com.splitzilla.pattern.strategy.ISplitStrategy;
import com.splitzilla.pattern.strategy.SplitStrategyFactory;
import com.splitzilla.repository.ExpenseRepository;
import com.splitzilla.repository.GroupRepository;
import com.splitzilla.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
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

    public List<Expense> getExpensesForGroup(String groupId) {
        return expenseRepository.findByGroupGroupId(groupId);
    }

    public List<Expense> filterExpenses(String groupId, String searchTerm, String memberId,
                                        LocalDateTime startDate, LocalDateTime endDate,
                                        Double minAmount, Double maxAmount) {
        List<Expense> expenses = expenseRepository.findByGroupGroupId(groupId);

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
                .collect(Collectors.toList());
    }

    public String exportExpensesToCsv(String groupId) {
        groupRepository.findById(groupId)
                .orElseThrow(() -> new RuntimeException("Group not found"));
        List<Expense> expenses = expenseRepository.findByGroupGroupId(groupId);

        StringBuilder csv = new StringBuilder();
        csv.append("Date,Description,Amount,Paid By,Split Type,Members\n");

        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

        for (Expense expense : expenses) {
            csv.append(expense.getDate().format(formatter)).append(",");
            csv.append("\"").append(expense.getDescription().replace("\"", "\"\"")).append("\"").append(",");
            csv.append(expense.getAmount()).append(",");
            csv.append("\"").append(expense.getPayer().getName()).append("\"").append(",");
            csv.append(expense.getSplitType()).append(",");

            String members = expense.getSplits().stream()
                    .map(split -> split.getUser().getName() + " ($" + 
                          String.format("%.2f", split.getAmount()) + ")")
                    .collect(Collectors.joining("; "));
            csv.append("\"").append(members).append("\"");
            csv.append("\n");
        }

        return csv.toString();
    }

    public Map<String, Object> getGroupSummary(String groupId) {
        Group group = groupRepository.findById(groupId)
                .orElseThrow(() -> new RuntimeException("Group not found"));
        List<Expense> expenses = expenseRepository.findByGroupGroupId(groupId);

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

        return summary;
    }

    public Expense createExpense(String description, Double amount, String splitType,
                                  String groupId, String payerEmail) {
        Group group = groupRepository.findById(groupId)
                .orElseThrow(() -> new RuntimeException("Group not found"));
        User payer = userRepository.findByEmail(payerEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Expense expense = new Expense();
        expense.setDescription(description);
        expense.setAmount(amount);
        expense.setSplitType(splitType);
        expense.setPayer(payer);
        expense.setGroup(group);

        List<String> memberIds = group.getMembers().stream()
                .map(User::getUserId)
                .collect(Collectors.toList());

        ISplitStrategy strategy = splitStrategyFactory.getStrategy(splitType);
        Map<String, Double> splits = strategy.split(amount, memberIds, new HashMap<>());

        Set<ExpenseSplit> expenseSplits = new HashSet<>();
        for (Map.Entry<String, Double> entry : splits.entrySet()) {
            userRepository.findById(entry.getKey()).ifPresent(user -> {
                ExpenseSplit split = new ExpenseSplit();
                split.setExpense(expense);
                split.setUser(user);
                split.setAmount(entry.getValue());
                expenseSplits.add(split);
            });
        }
        expense.setSplits(expenseSplits);

        return expenseRepository.save(expense);
    }

    public Map<String, Object> getBalancesForGroup(String groupId) {
        Group group = groupRepository.findById(groupId)
                .orElseThrow(() -> new RuntimeException("Group not found"));
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
        List<Expense> expenses = expenseRepository.findByGroupGroupId(groupId);
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
}
