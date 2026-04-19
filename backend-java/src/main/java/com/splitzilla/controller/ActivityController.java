package com.splitzilla.controller;

import com.splitzilla.model.Activity;
import com.splitzilla.service.ActivityService;
import com.splitzilla.service.ForbiddenException;
import com.splitzilla.service.GroupService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/activity")
public class ActivityController {

    @Autowired
    private ActivityService activityService;

    @Autowired
    private GroupService groupService;

    @GetMapping("/group/{groupId}")
    public ResponseEntity<?> getGroupActivity(
            @PathVariable String groupId,
            @RequestParam(required = false) String type,
            Authentication auth) {
        try {
            groupService.requireMember(groupId, auth.getName());
            List<Activity> activities = (type != null && !type.isEmpty())
                    ? activityService.getGroupActivityByType(groupId, type)
                    : activityService.getGroupActivity(groupId);
            return ResponseEntity.ok(activities);
        } catch (ForbiddenException e) {
            return ResponseEntity.status(403).body(Map.of("error", e.getMessage()));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}
