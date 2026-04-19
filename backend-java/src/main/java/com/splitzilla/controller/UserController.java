package com.splitzilla.controller;

import com.splitzilla.service.ForbiddenException;
import com.splitzilla.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/users")
public class UserController {

    @Autowired
    private UserService userService;

    @GetMapping("/profile")
    public ResponseEntity<?> getProfile(Authentication auth) {
        try {
            return ResponseEntity.ok(userService.getUserProfile(auth.getName()));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PutMapping("/profile")
    public ResponseEntity<?> updateProfile(@RequestBody Map<String, Object> body, Authentication auth) {
        try {
            String name = (String) body.get("name");
            String email = (String) body.get("email");
            return ResponseEntity.ok(userService.updateUserProfile(auth.getName(), name, email));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PutMapping("/profile/password")
    public ResponseEntity<?> changePassword(@RequestBody Map<String, Object> body, Authentication auth) {
        try {
            String currentPassword = (String) body.get("current_password");
            String newPassword = (String) body.get("new_password");
            userService.changePassword(auth.getName(), currentPassword, newPassword);
            return ResponseEntity.ok(Map.of("message", "Password changed successfully"));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/friends")
    public ResponseEntity<?> listFriends(Authentication auth) {
        try {
            return ResponseEntity.ok(userService.listFriends(auth.getName()));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/friends")
    public ResponseEntity<?> sendFriendRequest(@RequestBody Map<String, Object> body, Authentication auth) {
        try {
            String email = (String) body.get("email");
            return ResponseEntity.ok(userService.sendFriendRequest(auth.getName(), email));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @DeleteMapping("/friends/{friendId}")
    public ResponseEntity<?> removeFriend(@PathVariable String friendId, Authentication auth) {
        try {
            userService.removeFriend(auth.getName(), friendId);
            return ResponseEntity.ok(Map.of("message", "Removed"));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/friend-requests")
    public ResponseEntity<?> listFriendRequests(Authentication auth) {
        try {
            return ResponseEntity.ok(userService.listFriendRequests(auth.getName()));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/friend-requests/{requestId}/accept")
    public ResponseEntity<?> acceptFriendRequest(@PathVariable String requestId, Authentication auth) {
        try {
            return ResponseEntity.ok(userService.acceptFriendRequest(auth.getName(), requestId));
        } catch (ForbiddenException e) {
            return ResponseEntity.status(403).body(Map.of("error", e.getMessage()));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/friend-requests/{requestId}/reject")
    public ResponseEntity<?> rejectFriendRequest(@PathVariable String requestId, Authentication auth) {
        try {
            userService.rejectFriendRequest(auth.getName(), requestId);
            return ResponseEntity.ok(Map.of("message", "Rejected"));
        } catch (ForbiddenException e) {
            return ResponseEntity.status(403).body(Map.of("error", e.getMessage()));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @DeleteMapping("/friend-requests/{requestId}")
    public ResponseEntity<?> cancelFriendRequest(@PathVariable String requestId, Authentication auth) {
        try {
            userService.cancelFriendRequest(auth.getName(), requestId);
            return ResponseEntity.ok(Map.of("message", "Canceled"));
        } catch (ForbiddenException e) {
            return ResponseEntity.status(403).body(Map.of("error", e.getMessage()));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}
