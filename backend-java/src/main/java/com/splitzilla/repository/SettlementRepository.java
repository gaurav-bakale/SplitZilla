package com.splitzilla.repository;

import com.splitzilla.model.Settlement;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface SettlementRepository extends JpaRepository<Settlement, String> {
    List<Settlement> findByGroupGroupIdOrderBySettledAtDesc(String groupId);
}
