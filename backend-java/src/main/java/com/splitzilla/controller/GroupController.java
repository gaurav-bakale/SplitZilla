package com.splitzilla.controller;

import com.splitzilla.model.Group;
import com.splitzilla.service.ForbiddenException;
import com.splitzilla.service.GroupService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/groups")
public class GroupController {

    @Autowired
    private GroupService groupService;

    @GetMapping("/")
    public ResponseEntity<List<Group>> getGroups(Authentication auth) {
        return ResponseEntity.ok(groupService.getGroupsForUser(auth.getName()));
    }

    @PostMapping("/")
    public ResponseEntity<?> createGroup(@RequestBody Map<String, String> body, Authentication auth) {
        try {
            Group group = groupService.createGroup(body.get("name"), body.get("description"), auth.getName());
            return ResponseEntity.ok(group);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/{groupId}")
    public ResponseEntity<?> getGroup(@PathVariable String groupId, Authentication auth) {
        try {
            groupService.requireMember(groupId, auth.getName());
            return ResponseEntity.ok(groupService.getGroup(groupId));
        } catch (ForbiddenException e) {
            return ResponseEntity.status(403).body(Map.of("error", e.getMessage()));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{groupId}")
    public ResponseEntity<?> deleteGroup(@PathVariable String groupId, Authentication auth) {
        try {
            groupService.deleteGroup(groupId, auth.getName());
            return ResponseEntity.ok(Map.of("message", "Group deleted"));
        } catch (ForbiddenException e) {
            return ResponseEntity.status(403).body(Map.of("error", e.getMessage()));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/{groupId}/members/{memberEmail}")
    public ResponseEntity<?> addMember(@PathVariable String groupId, @PathVariable String memberEmail, Authentication auth) {
        try {
            groupService.requireMember(groupId, auth.getName());
            return ResponseEntity.ok(groupService.addMember(groupId, memberEmail));
        } catch (ForbiddenException e) {
            return ResponseEntity.status(403).body(Map.of("detail", e.getMessage()));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("detail", e.getMessage()));
        }
    }
}
