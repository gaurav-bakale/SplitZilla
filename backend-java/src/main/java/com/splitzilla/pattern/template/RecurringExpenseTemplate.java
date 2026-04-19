package com.splitzilla.pattern.template;

import com.splitzilla.model.Expense;
import com.splitzilla.model.RecurringExpense;
import com.splitzilla.repository.RecurringExpenseRepository;
import com.splitzilla.repository.UserRepository;
import com.splitzilla.service.ExpenseService;

import java.time.LocalDateTime;

/**
 * Template Method Pattern - Defines the skeleton of recurring-expense processing.
 * Subclasses only override the scheduling hook (computeNextRunAt).
 */
public abstract class RecurringExpenseTemplate {

    public final Expense process(RecurringExpense rec,
                                 ExpenseService expenseService,
                                 UserRepository userRepository,
                                 RecurringExpenseRepository recurringRepo) {
        if (!shouldRun(rec)) {
            return null;
        }

        Expense expense = materializeExpense(rec, expenseService, userRepository);

        LocalDateTime now = LocalDateTime.now();
        rec.setLastRunAt(now);
        rec.setNextRunAt(computeNextRunAt(rec.getNextRunAt() != null ? rec.getNextRunAt() : now));
        recurringRepo.save(rec);

        return expense;
    }

    protected boolean shouldRun(RecurringExpense rec) {
        if (!rec.isActive() || rec.getNextRunAt() == null) {
            return false;
        }
        return !rec.getNextRunAt().isAfter(LocalDateTime.now());
    }

    protected Expense materializeExpense(RecurringExpense rec,
                                         ExpenseService expenseService,
                                         UserRepository userRepository) {
        String payerEmail = userRepository.findById(rec.getPayerId())
                .orElseThrow(() -> new RuntimeException("Payer not found for recurring expense " + rec.getRecurringId()))
                .getEmail();
        return expenseService.createExpense(
                rec.getDescription(),
                rec.getAmount(),
                rec.getSplitType(),
                rec.getGroupId(),
                payerEmail,
                rec.getCategory() != null ? rec.getCategory().name() : null);
    }

    protected abstract LocalDateTime computeNextRunAt(LocalDateTime from);
}
