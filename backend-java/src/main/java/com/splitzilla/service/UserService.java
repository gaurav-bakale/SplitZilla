package com.splitzilla.service;

import com.splitzilla.model.User;
import com.splitzilla.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    public Map<String, Object> getUserProfile(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Map<String, Object> profile = new HashMap<>();
        profile.put("user_id", user.getUserId());
        profile.put("name", user.getName());
        profile.put("email", user.getEmail());
        profile.put("created_at", user.getCreatedAt());
        return profile;
    }

    public Map<String, Object> updateUserProfile(String currentEmail, String newName, String newEmail) {
        User user = userRepository.findByEmail(currentEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (newName != null && !newName.trim().isEmpty()) {
            user.setName(newName.trim());
        }

        if (newEmail != null && !newEmail.trim().isEmpty() && !newEmail.equals(currentEmail)) {
            if (userRepository.findByEmail(newEmail).isPresent()) {
                throw new RuntimeException("Email already in use");
            }
            user.setEmail(newEmail.trim());
        }

        User updatedUser = userRepository.save(user);

        Map<String, Object> profile = new HashMap<>();
        profile.put("user_id", updatedUser.getUserId());
        profile.put("name", updatedUser.getName());
        profile.put("email", updatedUser.getEmail());
        profile.put("created_at", updatedUser.getCreatedAt());
        return profile;
    }

    public void changePassword(String email, String currentPassword, String newPassword) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (!passwordEncoder.matches(currentPassword, user.getPassword())) {
            throw new RuntimeException("Current password is incorrect");
        }

        if (newPassword == null || newPassword.length() < 6) {
            throw new RuntimeException("New password must be at least 6 characters long");
        }

        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);
    }
}
