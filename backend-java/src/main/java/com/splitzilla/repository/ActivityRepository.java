package com.splitzilla.repository;

import com.splitzilla.model.Activity;
import com.splitzilla.model.ActivityType;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ActivityRepository extends JpaRepository<Activity, String> {
    List<Activity> findByGroupIdOrderByCreatedAtDesc(String groupId);
    List<Activity> findByGroupIdAndActivityTypeOrderByCreatedAtDesc(String groupId, ActivityType activityType);
}
