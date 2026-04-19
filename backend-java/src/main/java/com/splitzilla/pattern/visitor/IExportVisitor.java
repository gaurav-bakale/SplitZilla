package com.splitzilla.pattern.visitor;

import com.splitzilla.model.Expense;
import com.splitzilla.model.Group;

/**
 * Visitor Pattern - Exports expenses to different formats.
 * Concrete visitors build up their output as they visit each expense,
 * then return it via getResult().
 */
public interface IExportVisitor {
    void visitGroup(Group group);

    void visitExpense(Expense expense);

    String getResult();

    String getContentType();

    String getFileExtension();
}
