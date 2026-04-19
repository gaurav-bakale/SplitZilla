package com.splitzilla.service;

import com.splitzilla.model.FriendRequest;
import com.splitzilla.model.User;
import com.splitzilla.pattern.observer.NotificationService;
import com.splitzilla.repository.FriendRequestRepository;
import com.splitzilla.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private FriendRequestRepository friendRequestRepository;

    @Autowired
    private NotificationService notificationService;

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

    public List<Map<String, Object>> listFriends(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        List<Map<String, Object>> out = new ArrayList<>();
        for (String friendId : user.getFriends()) {
            userRepository.findById(friendId).ifPresent(f -> {
                Map<String, Object> m = new HashMap<>();
                m.put("user_id", f.getUserId());
                m.put("name", f.getName());
                m.put("email", f.getEmail());
                out.add(m);
            });
        }
        return out;
    }

    public Map<String, Object> sendFriendRequest(String email, String friendEmail) {
        if (friendEmail == null || friendEmail.trim().isEmpty()) {
            throw new RuntimeException("Friend email is required");
        }
        if (email.equalsIgnoreCase(friendEmail.trim())) {
            throw new RuntimeException("You cannot add yourself as a friend");
        }
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        User friend = userRepository.findByEmail(friendEmail.trim())
                .orElseThrow(() -> new RuntimeException("No user with that email"));
        if (user.getFriends().contains(friend.getUserId())) {
            throw new RuntimeException("Already in your friends list");
        }
        if (friendRequestRepository.findByFromUserIdAndToUserIdAndStatus(
                user.getUserId(), friend.getUserId(), FriendRequest.Status.PENDING).isPresent()) {
            throw new RuntimeException("Request already pending");
        }
        friendRequestRepository.findByFromUserIdAndToUserIdAndStatus(
                friend.getUserId(), user.getUserId(), FriendRequest.Status.PENDING)
                .ifPresent(existing -> {
                    throw new RuntimeException(friend.getName() + " already sent you a request — accept it from your inbox");
                });

        FriendRequest req = new FriendRequest(user.getUserId(), friend.getUserId());
        FriendRequest saved = friendRequestRepository.save(req);

        Map<String, Object> event = new HashMap<>();
        event.put("type", "friend_request_sent");
        event.put("to_user_id", friend.getUserId());
        event.put("from_user_name", user.getName());
        notificationService.notifyObservers(event);

        Map<String, Object> out = new HashMap<>();
        out.put("request_id", saved.getRequestId());
        out.put("to_user_id", friend.getUserId());
        out.put("to_name", friend.getName());
        out.put("to_email", friend.getEmail());
        out.put("status", saved.getStatus().name());
        out.put("created_at", saved.getCreatedAt());
        return out;
    }

    public Map<String, List<Map<String, Object>>> listFriendRequests(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        List<Map<String, Object>> incoming = new ArrayList<>();
        for (FriendRequest r : friendRequestRepository.findByToUserIdAndStatusOrderByCreatedAtDesc(
                user.getUserId(), FriendRequest.Status.PENDING)) {
            userRepository.findById(r.getFromUserId()).ifPresent(from -> {
                Map<String, Object> m = new HashMap<>();
                m.put("request_id", r.getRequestId());
                m.put("from_user_id", from.getUserId());
                m.put("from_name", from.getName());
                m.put("from_email", from.getEmail());
                m.put("created_at", r.getCreatedAt());
                incoming.add(m);
            });
        }

        List<Map<String, Object>> outgoing = new ArrayList<>();
        for (FriendRequest r : friendRequestRepository.findByFromUserIdAndStatusOrderByCreatedAtDesc(
                user.getUserId(), FriendRequest.Status.PENDING)) {
            userRepository.findById(r.getToUserId()).ifPresent(to -> {
                Map<String, Object> m = new HashMap<>();
                m.put("request_id", r.getRequestId());
                m.put("to_user_id", to.getUserId());
                m.put("to_name", to.getName());
                m.put("to_email", to.getEmail());
                m.put("created_at", r.getCreatedAt());
                outgoing.add(m);
            });
        }

        Map<String, List<Map<String, Object>>> out = new HashMap<>();
        out.put("incoming", incoming);
        out.put("outgoing", outgoing);
        return out;
    }

    public Map<String, Object> acceptFriendRequest(String email, String requestId) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        FriendRequest req = friendRequestRepository.findById(requestId)
                .orElseThrow(() -> new RuntimeException("Request not found"));
        if (!user.getUserId().equals(req.getToUserId())) {
            throw new ForbiddenException("Not your request to accept");
        }
        if (req.getStatus() != FriendRequest.Status.PENDING) {
            throw new RuntimeException("Request is no longer pending");
        }
        User fromUser = userRepository.findById(req.getFromUserId())
                .orElseThrow(() -> new RuntimeException("Requester no longer exists"));

        user.getFriends().add(fromUser.getUserId());
        fromUser.getFriends().add(user.getUserId());
        userRepository.save(user);
        userRepository.save(fromUser);

        req.setStatus(FriendRequest.Status.ACCEPTED);
        req.setResolvedAt(LocalDateTime.now());
        friendRequestRepository.save(req);

        Map<String, Object> event = new HashMap<>();
        event.put("type", "friend_request_accepted");
        event.put("to_user_id", fromUser.getUserId());
        event.put("accepter_name", user.getName());
        notificationService.notifyObservers(event);

        Map<String, Object> out = new HashMap<>();
        out.put("user_id", fromUser.getUserId());
        out.put("name", fromUser.getName());
        out.put("email", fromUser.getEmail());
        return out;
    }

    public void rejectFriendRequest(String email, String requestId) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        FriendRequest req = friendRequestRepository.findById(requestId)
                .orElseThrow(() -> new RuntimeException("Request not found"));
        if (!user.getUserId().equals(req.getToUserId())) {
            throw new ForbiddenException("Not your request to reject");
        }
        if (req.getStatus() != FriendRequest.Status.PENDING) {
            throw new RuntimeException("Request is no longer pending");
        }
        req.setStatus(FriendRequest.Status.REJECTED);
        req.setResolvedAt(LocalDateTime.now());
        friendRequestRepository.save(req);
    }

    public void cancelFriendRequest(String email, String requestId) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        FriendRequest req = friendRequestRepository.findById(requestId)
                .orElseThrow(() -> new RuntimeException("Request not found"));
        if (!user.getUserId().equals(req.getFromUserId())) {
            throw new ForbiddenException("Not your request to cancel");
        }
        if (req.getStatus() != FriendRequest.Status.PENDING) {
            throw new RuntimeException("Request is no longer pending");
        }
        req.setStatus(FriendRequest.Status.CANCELED);
        req.setResolvedAt(LocalDateTime.now());
        friendRequestRepository.save(req);
    }

    public void removeFriend(String email, String friendUserId) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        if (!user.getFriends().remove(friendUserId)) {
            throw new RuntimeException("Not in your friends list");
        }
        userRepository.save(user);
        userRepository.findById(friendUserId).ifPresent(other -> {
            other.getFriends().remove(user.getUserId());
            userRepository.save(other);
        });
    }
}
