package com.splitzilla.repository;

import com.splitzilla.model.Activity;
import com.splitzilla.model.ActivityType;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface ActivityRepository extends MongoRepository<Activity, String> {
    List<Activity> findByGroupIdOrderByCreatedAtDesc(String groupId);
    List<Activity> findByGroupIdAndActivityTypeOrderByCreatedAtDesc(String groupId, ActivityType activityType);
}
