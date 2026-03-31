package com.splitzilla.repository;

import com.splitzilla.model.Group;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface GroupRepository extends JpaRepository<Group, String> {
    @Query("SELECT g FROM Group g JOIN g.members m WHERE m.userId = :userId")
    List<Group> findByMembersUserId(@Param("userId") String userId);
}
