package com.splitzilla.repository;

import com.splitzilla.model.FriendRequest;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;
import java.util.Optional;

public interface FriendRequestRepository extends MongoRepository<FriendRequest, String> {
    List<FriendRequest> findByToUserIdAndStatusOrderByCreatedAtDesc(String toUserId, FriendRequest.Status status);
    List<FriendRequest> findByFromUserIdAndStatusOrderByCreatedAtDesc(String fromUserId, FriendRequest.Status status);
    Optional<FriendRequest> findByFromUserIdAndToUserIdAndStatus(String fromUserId, String toUserId, FriendRequest.Status status);
}
