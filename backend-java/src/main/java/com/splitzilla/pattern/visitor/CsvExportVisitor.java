package com.splitzilla.pattern.visitor;

import com.splitzilla.model.Expense;
import com.splitzilla.model.ExpenseSplit;
import com.splitzilla.model.Group;

import java.time.format.DateTimeFormatter;
import java.util.stream.Collectors;

public class CsvExportVisitor implements IExportVisitor {

    private static final DateTimeFormatter FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

    private final StringBuilder out = new StringBuilder();

    public CsvExportVisitor() {
        out.append("Date,Description,Amount,Category,Paid By,Split Type,Members\n");
    }

    @Override
    public void visitGroup(Group group) {
        // CSV is flat — group info is implicit in the filename.
    }

    @Override
    public void visitExpense(Expense expense) {
        out.append(expense.getDate().format(FORMATTER)).append(",");
        out.append("\"").append(expense.getDescription().replace("\"", "\"\"")).append("\",");
        out.append(expense.getAmount()).append(",");
        out.append(expense.getCategory().name()).append(",");
        out.append("\"").append(expense.getPayer().getName()).append("\",");
        out.append(expense.getSplitType()).append(",");

        String members = expense.getSplits().stream()
                .map(s -> s.getUser().getName() + " ($" + String.format("%.2f", s.getAmount()) + ")")
                .collect(Collectors.joining("; "));
        out.append("\"").append(members).append("\"\n");
    }

    @Override
    public String getResult() {
        return out.toString();
    }

    @Override
    public String getContentType() {
        return "text/csv";
    }

    @Override
    public String getFileExtension() {
        return "csv";
    }
}
