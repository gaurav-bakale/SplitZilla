package com.splitzilla.pattern.template;

import java.time.LocalDateTime;

public class DailyRecurringTemplate extends RecurringExpenseTemplate {
    @Override
    protected LocalDateTime computeNextRunAt(LocalDateTime from) {
        return from.plusDays(1);
    }
}
