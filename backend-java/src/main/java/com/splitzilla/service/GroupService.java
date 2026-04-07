package com.splitzilla.service;

import com.splitzilla.model.Group;
import com.splitzilla.model.User;
import com.splitzilla.repository.GroupRepository;
import com.splitzilla.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Objects;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class GroupService {

    @Autowired
    private GroupRepository groupRepository;

    @Autowired
    private UserRepository userRepository;

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
        return populateMembers(groupRepository.save(group));
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
        return populateMembers(groupRepository.save(group));
    }

    private Group populateMembers(Group group) {
        group.setMembers(group.getMemberIds().stream()
                .map(memberId -> userRepository.findById(memberId).orElse(null))
                .filter(Objects::nonNull)
                .collect(Collectors.toSet()));
        return group;
    }
}
