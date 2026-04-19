package com.splitzilla.pattern.visitor;

import com.splitzilla.model.Expense;
import com.splitzilla.model.Group;

import java.time.format.DateTimeFormatter;
import java.util.stream.Collectors;

public class MarkdownExportVisitor implements IExportVisitor {

    private static final DateTimeFormatter FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd");

    private final StringBuilder out = new StringBuilder();
    private double runningTotal = 0.0;
    private int count = 0;

    @Override
    public void visitGroup(Group group) {
        out.append("# Expense Report: ").append(group.getName()).append("\n\n");
        if (group.getDescription() != null && !group.getDescription().isEmpty()) {
            out.append("> ").append(group.getDescription()).append("\n\n");
        }
        out.append("| Date | Description | Amount | Category | Paid By | Members |\n");
        out.append("|------|-------------|--------|----------|---------|---------|\n");
    }

    @Override
    public void visitExpense(Expense expense) {
        String members = expense.getSplits().stream()
                .map(s -> s.getUser().getName() + " ($" + String.format("%.2f", s.getAmount()) + ")")
                .collect(Collectors.joining(", "));
        out.append("| ").append(expense.getDate().format(FORMATTER))
                .append(" | ").append(expense.getDescription())
                .append(" | $").append(String.format("%.2f", expense.getAmount()))
                .append(" | ").append(expense.getCategory().name())
                .append(" | ").append(expense.getPayer().getName())
                .append(" | ").append(members)
                .append(" |\n");
        runningTotal += expense.getAmount();
        count++;
    }

    @Override
    public String getResult() {
        out.append("\n**Total:** $").append(String.format("%.2f", runningTotal))
                .append(" across ").append(count).append(" expenses.\n");
        return out.toString();
    }

    @Override
    public String getContentType() {
        return "text/markdown";
    }

    @Override
    public String getFileExtension() {
        return "md";
    }
}
