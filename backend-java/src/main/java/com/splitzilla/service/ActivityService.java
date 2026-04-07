package com.splitzilla.service;

import com.splitzilla.model.Activity;
import com.splitzilla.model.ActivityType;
import com.splitzilla.repository.ActivityRepository;
import com.splitzilla.repository.GroupRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ActivityService {

    @Autowired
    private ActivityRepository activityRepository;

    @Autowired
    private GroupRepository groupRepository;

    public List<Activity> getGroupActivity(String groupId) {
        groupRepository.findById(groupId)
                .orElseThrow(() -> new RuntimeException("Group not found"));
        return activityRepository.findByGroupIdOrderByCreatedAtDesc(groupId);
    }

    public List<Activity> getGroupActivityByType(String groupId, String type) {
        groupRepository.findById(groupId)
                .orElseThrow(() -> new RuntimeException("Group not found"));
        ActivityType activityType;
        try {
            activityType = ActivityType.valueOf(type.toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new RuntimeException("Invalid activity type: " + type +
                    ". Valid values: EXPENSE_ADDED, MEMBER_ADDED, GROUP_CREATED, " +
                    "SETTLEMENT_RECORDED, SETTLEMENT_PLAN_CREATED, PAYMENT_RECORDED");
        }
        return activityRepository.findByGroupIdAndActivityTypeOrderByCreatedAtDesc(groupId, activityType);
    }
}
