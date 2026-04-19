package com.splitzilla.pattern.template;

import java.time.LocalDateTime;

public class WeeklyRecurringTemplate extends RecurringExpenseTemplate {
    @Override
    protected LocalDateTime computeNextRunAt(LocalDateTime from) {
        return from.plusWeeks(1);
    }
}
