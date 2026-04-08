package com.splitzilla.pattern.observer;

import com.splitzilla.model.Activity;
import com.splitzilla.model.ActivityType;
import com.splitzilla.repository.ActivityRepository;
import org.springframework.stereotype.Component;

import java.util.Map;

/**
 * Observer Pattern - Concrete Observer for Activity Feed.
 * Listens on the same event bus as NotificationObserver and persists
 * a human-readable audit log entry for every significant group action.
 */
@Component
public class ActivityObserver implements IObserver {

    private final ActivityRepository activityRepository;

    public ActivityObserver(ActivityRepository activityRepository) {
        this.activityRepository = activityRepository;
    }

    @Override
    public void update(Map<String, Object> event) {
        String eventType = (String) event.get("type");
        String groupId   = (String) event.get("group_id");
        if (groupId == null) return;

        switch (eventType) {
            case "expense_added"           -> recordExpenseAdded(event, groupId);
            case "member_added"            -> recordMemberAdded(event, groupId);
            case "group_created"           -> recordGroupCreated(event, groupId);
            case "settlement_recorded"     -> recordSettlementRecorded(event, groupId);
            case "settlement_plan_created" -> recordSettlementPlanCreated(event, groupId);
            case "payment_recorded"        -> recordPaymentRecorded(event, groupId);
        }
    }

    private void recordExpenseAdded(Map<String, Object> event, String groupId) {
        String payerName  = (String) event.get("payer_name");
        String payerId    = (String) event.get("payer_id");
        String desc       = (String) event.get("expense_description");
        Double amount     = (Double) event.get("amount");
        String category   = (String) event.get("category");

        String message = String.format("%s added expense \"%s\" ($%.2f) [%s]",
                payerName, desc, amount, category != null ? category : "GENERAL");
        save(groupId, payerId, payerName, ActivityType.EXPENSE_ADDED, message, amount);
    }

    private void recordMemberAdded(Map<String, Object> event, String groupId) {
        String userId    = (String) event.get("user_id");
        String userName  = (String) event.get("user_name");
        String groupName = (String) event.get("group_name");

        String message = String.format("%s joined group \"%s\"", userName, groupName);
        save(groupId, userId, userName, ActivityType.MEMBER_ADDED, message, null);
    }

    private void recordGroupCreated(Map<String, Object> event, String groupId) {
        String creatorId   = (String) event.get("creator_id");
        String creatorName = (String) event.get("creator_name");
        String groupName   = (String) event.get("group_name");

        String message = String.format("%s created group \"%s\"", creatorName, groupName);
        save(groupId, creatorId, creatorName, ActivityType.GROUP_CREATED, message, null);
    }

    private void recordSettlementRecorded(Map<String, Object> event, String groupId) {
        String payerName = (String) event.get("payer_name");
        String payeeName = (String) event.get("payee_name");
        Double amount    = (Double) event.get("amount");

        String message = String.format("%s settled $%.2f with %s", payerName, amount, payeeName);
        save(groupId, null, payerName, ActivityType.SETTLEMENT_RECORDED, message, amount);
    }

    private void recordSettlementPlanCreated(Map<String, Object> event, String groupId) {
        Integer count = (Integer) event.get("settlement_count");
        String message = String.format("A new settlement plan was created with %d transfer(s)", count);
        save(groupId, null, null, ActivityType.SETTLEMENT_PLAN_CREATED, message, null);
    }

    private void recordPaymentRecorded(Map<String, Object> event, String groupId) {
        String payerName = (String) event.get("payer_name");
        Double amount    = (Double) event.get("amount");
        String status    = (String) event.get("status");

        String message = String.format("%s recorded a payment of $%.2f (status: %s)",
                payerName, amount, status);
        save(groupId, null, payerName, ActivityType.PAYMENT_RECORDED, message, amount);
    }

    private void save(String groupId, String userId, String userName,
                      ActivityType type, String description, Double amount) {
        Activity activity = new Activity();
        activity.setGroupId(groupId);
        activity.setUserId(userId);
        activity.setUserName(userName);
        activity.setActivityType(type);
        activity.setDescription(description);
        activity.setAmount(amount);
        activityRepository.save(activity);
    }
}
