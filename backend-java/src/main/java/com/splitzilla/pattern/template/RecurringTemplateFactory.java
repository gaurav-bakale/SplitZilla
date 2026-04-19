package com.splitzilla.pattern.template;

import org.springframework.stereotype.Component;

@Component
public class RecurringTemplateFactory {

    public RecurringExpenseTemplate getTemplate(String frequency) {
        if (frequency == null) {
            throw new IllegalArgumentException("Frequency is required");
        }
        switch (frequency.toUpperCase()) {
            case "DAILY":
                return new DailyRecurringTemplate();
            case "WEEKLY":
                return new WeeklyRecurringTemplate();
            case "MONTHLY":
                return new MonthlyRecurringTemplate();
            default:
                throw new IllegalArgumentException("Unknown frequency: " + frequency +
                        ". Valid values: DAILY, WEEKLY, MONTHLY");
        }
    }
}
