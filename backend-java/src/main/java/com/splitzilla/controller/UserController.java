package com.splitzilla.controller;

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
}
