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
