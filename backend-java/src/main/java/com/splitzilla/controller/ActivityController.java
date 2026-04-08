package com.splitzilla.controller;

import com.splitzilla.model.Activity;
import com.splitzilla.service.ActivityService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/activity")
public class ActivityController {

    @Autowired
    private ActivityService activityService;

    /**
     * GET /api/activity/group/{groupId}
     * Returns the full activity feed for a group, newest first.
     *
     * Optional query param:
     *   ?type=EXPENSE_ADDED  — filter to a specific ActivityType
     */
    @GetMapping("/group/{groupId}")
    public ResponseEntity<?> getGroupActivity(
            @PathVariable String groupId,
            @RequestParam(required = false) String type) {
        try {
            List<Activity> activities = (type != null && !type.isEmpty())
                    ? activityService.getGroupActivityByType(groupId, type)
                    : activityService.getGroupActivity(groupId);
            return ResponseEntity.ok(activities);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}
