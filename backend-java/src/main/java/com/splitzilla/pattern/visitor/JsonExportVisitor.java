package com.splitzilla.pattern.visitor;

import com.splitzilla.model.Expense;
import com.splitzilla.model.Group;

import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import com.fasterxml.jackson.databind.ObjectMapper;

public class JsonExportVisitor implements IExportVisitor {

    private static final DateTimeFormatter FORMATTER = DateTimeFormatter.ISO_LOCAL_DATE_TIME;
    private static final ObjectMapper MAPPER = new ObjectMapper();

    private final Map<String, Object> root = new LinkedHashMap<>();
    private final List<Map<String, Object>> expenseList = new ArrayList<>();

    public JsonExportVisitor() {
        root.put("expenses", expenseList);
    }

    @Override
    public void visitGroup(Group group) {
        root.put("group_id", group.getGroupId());
        root.put("group_name", group.getName());
    }

    @Override
    public void visitExpense(Expense expense) {
        Map<String, Object> e = new LinkedHashMap<>();
        e.put("expense_id", expense.getExpenseId());
        e.put("date", expense.getDate().format(FORMATTER));
        e.put("description", expense.getDescription());
        e.put("amount", expense.getAmount());
        e.put("category", expense.getCategory().name());
        e.put("paid_by", expense.getPayer().getName());
        e.put("split_type", expense.getSplitType());
        e.put("splits", expense.getSplits().stream()
                .map(s -> Map.of(
                        "user", s.getUser().getName(),
                        "amount", s.getAmount()))
                .collect(Collectors.toList()));
        expenseList.add(e);
    }

    @Override
    public String getResult() {
        try {
            return MAPPER.writerWithDefaultPrettyPrinter().writeValueAsString(root);
        } catch (Exception ex) {
            throw new RuntimeException("Failed to serialize JSON export", ex);
        }
    }

    @Override
    public String getContentType() {
        return "application/json";
    }

    @Override
    public String getFileExtension() {
        return "json";
    }
}
