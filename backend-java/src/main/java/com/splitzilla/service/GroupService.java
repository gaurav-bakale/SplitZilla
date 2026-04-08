package com.splitzilla.service;

import com.splitzilla.model.Group;
import com.splitzilla.model.User;
import com.splitzilla.pattern.observer.NotificationService;
import com.splitzilla.repository.GroupRepository;
import com.splitzilla.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class GroupService {

    @Autowired
    private GroupRepository groupRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private NotificationService notificationService;

    public List<Group> getGroupsForUser(String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return groupRepository.findByMemberIdsContaining(user.getUserId()).stream()
                .map(this::populateMembers)
                .toList();
    }

    public Group createGroup(String name, String description, String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));
        Group group = new Group();
        group.setName(name);
        group.setDescription(description);
        group.setMemberIds(Set.of(user.getUserId()));
        Group saved = groupRepository.save(group);

        Map<String, Object> event = new HashMap<>();
        event.put("type", "group_created");
        event.put("group_id", saved.getGroupId());
        event.put("group_name", saved.getName());
        event.put("creator_id", user.getUserId());
        event.put("creator_name", user.getName());
        notificationService.notifyObservers(event);

        return populateMembers(saved);
    }

    public Group getGroup(String groupId) {
        return populateMembers(groupRepository.findById(groupId)
                .orElseThrow(() -> new RuntimeException("Group not found")));
    }

    public Group addMember(String groupId, String memberEmail) {
        Group group = groupRepository.findById(groupId)
                .orElseThrow(() -> new RuntimeException("Group not found"));
        User user = userRepository.findByEmail(memberEmail)
                .orElseThrow(() -> new RuntimeException("User not found with email: " + memberEmail));

        Set<String> memberIds = group.getMemberIds();
        memberIds.add(user.getUserId());
        group.setMemberIds(memberIds);
        Group saved = groupRepository.save(group);

        Map<String, Object> event = new HashMap<>();
        event.put("type", "member_added");
        event.put("group_id", groupId);
        event.put("group_name", group.getName());
        event.put("user_id", user.getUserId());
        event.put("user_name", user.getName());
        notificationService.notifyObservers(event);

        return populateMembers(saved);
    }

    private Group populateMembers(Group group) {
        group.setMembers(group.getMemberIds().stream()
                .map(memberId -> userRepository.findById(memberId).orElse(null))
                .filter(Objects::nonNull)
                .collect(Collectors.toSet()));
        return group;
    }
}
