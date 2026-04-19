package com.splitzilla.pattern.template;

import java.time.LocalDateTime;

public class MonthlyRecurringTemplate extends RecurringExpenseTemplate {
    @Override
    protected LocalDateTime computeNextRunAt(LocalDateTime from) {
        return from.plusMonths(1);
    }
}
