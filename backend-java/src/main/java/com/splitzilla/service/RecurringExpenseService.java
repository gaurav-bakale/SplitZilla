package com.splitzilla.service;

import com.splitzilla.model.Expense;
import com.splitzilla.model.ExpenseCategory;
import com.splitzilla.model.RecurringExpense;
import com.splitzilla.model.User;
import com.splitzilla.pattern.template.RecurringExpenseTemplate;
import com.splitzilla.pattern.template.RecurringTemplateFactory;
import com.splitzilla.repository.RecurringExpenseRepository;
import com.splitzilla.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class RecurringExpenseService {

    private static final Logger log = LoggerFactory.getLogger(RecurringExpenseService.class);

    @Autowired
    private RecurringExpenseRepository recurringRepo;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ExpenseService expenseService;

    @Autowired
    private RecurringTemplateFactory templateFactory;

    public RecurringExpense create(String description, Double amount, String splitType,
                                   String groupId, String payerEmail, String categoryStr,
                                   String frequency, boolean runImmediately) {
        User payer = userRepository.findByEmail(payerEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Validate frequency early — factory throws on unknown values.
        templateFactory.getTemplate(frequency);

        ExpenseCategory category = ExpenseCategory.GENERAL;
        if (categoryStr != null && !categoryStr.isEmpty()) {
            try {
                category = ExpenseCategory.valueOf(categoryStr.toUpperCase());
            } catch (IllegalArgumentException e) {
                throw new RuntimeException("Invalid category: " + categoryStr);
            }
        }

        RecurringExpense rec = new RecurringExpense();
        rec.setDescription(description);
        rec.setAmount(amount);
        rec.setSplitType(splitType);
        rec.setGroupId(groupId);
        rec.setPayerId(payer.getUserId());
        rec.setCategory(category);
        rec.setFrequency(frequency.toUpperCase());
        rec.setNextRunAt(LocalDateTime.now());
        rec.setActive(true);

        rec = recurringRepo.save(rec);

        if (runImmediately) {
            runOnce(rec);
        }
        return rec;
    }

    public List<RecurringExpense> getForGroup(String groupId) {
        return recurringRepo.findByGroupId(groupId);
    }

    public void cancel(String recurringId) {
        RecurringExpense rec = recurringRepo.findById(recurringId)
                .orElseThrow(() -> new RuntimeException("Recurring expense not found"));
        rec.setActive(false);
        recurringRepo.save(rec);
    }

    @Scheduled(fixedRate = 60_000)
    public void processDue() {
        List<RecurringExpense> due = recurringRepo.findByActiveTrueAndNextRunAtBefore(LocalDateTime.now().plusSeconds(1));
        if (due.isEmpty()) {
            return;
        }
        log.info("Processing {} due recurring expenses", due.size());
        for (RecurringExpense rec : due) {
            try {
                runOnce(rec);
            } catch (Exception e) {
                log.error("Failed to process recurring expense {}: {}", rec.getRecurringId(), e.getMessage());
            }
        }
    }

    private Expense runOnce(RecurringExpense rec) {
        RecurringExpenseTemplate template = templateFactory.getTemplate(rec.getFrequency());
        return template.process(rec, expenseService, userRepository, recurringRepo);
    }
}
