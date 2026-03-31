package com.splitzilla.repository;

import com.splitzilla.model.Notification;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface NotificationRepository extends JpaRepository<Notification, String> {
    List<Notification> findByUserUserIdOrderByCreatedAtDesc(String userId);
}
