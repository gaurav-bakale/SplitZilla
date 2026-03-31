package com.splitzilla.pattern.observer;

import com.splitzilla.model.Notification;
import com.splitzilla.model.User;
import com.splitzilla.repository.NotificationRepository;
import com.splitzilla.repository.UserRepository;
import org.springframework.stereotype.Component;
import java.util.List;
import java.util.Map;

/**
 * Observer Pattern - Concrete Observer for Notifications
 */
@Component
public class NotificationObserver implements IObserver {
    
    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;
    
    public NotificationObserver(NotificationRepository notificationRepository, 
                               UserRepository userRepository) {
        this.notificationRepository = notificationRepository;
        this.userRepository = userRepository;
    }
    
    @Override
    public void update(Map<String, Object> event) {
        String eventType = (String) event.get("type");
        
        switch (eventType) {
            case "expense_added":
                handleExpenseAdded(event);
                break;
            case "member_added":
                handleMemberAdded(event);
                break;
            case "group_created":
                handleGroupCreated(event);
                break;
        }
    }
    
    @SuppressWarnings("unchecked")
    private void handleExpenseAdded(Map<String, Object> event) {
        List<String> groupMembers = (List<String>) event.get("group_members");
        String expenseDesc = (String) event.get("expense_description");
        String payerName = (String) event.get("payer_name");
        Double amount = (Double) event.get("amount");
        
        for (String memberId : groupMembers) {
            userRepository.findById(memberId).ifPresent(user -> {
                Notification notification = new Notification();
                notification.setUser(user);
                notification.setMessage(String.format("%s added expense '%s' for $%.2f", 
                    payerName, expenseDesc, amount));
                notification.setIsRead(false);
                notificationRepository.save(notification);
            });
        }
    }
    
    private void handleMemberAdded(Map<String, Object> event) {
        String userId = (String) event.get("user_id");
        String groupName = (String) event.get("group_name");
        
        userRepository.findById(userId).ifPresent(user -> {
            Notification notification = new Notification();
            notification.setUser(user);
            notification.setMessage(String.format("You were added to group '%s'", groupName));
            notification.setIsRead(false);
            notificationRepository.save(notification);
        });
    }
    
    private void handleGroupCreated(Map<String, Object> event) {
        String creatorId = (String) event.get("creator_id");
        String groupName = (String) event.get("group_name");
        
        userRepository.findById(creatorId).ifPresent(user -> {
            Notification notification = new Notification();
            notification.setUser(user);
            notification.setMessage(String.format("Group '%s' created successfully", groupName));
            notification.setIsRead(false);
            notificationRepository.save(notification);
        });
    }
}
