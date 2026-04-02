package com.splitzilla.repository;

import com.splitzilla.model.Settlement;
import com.splitzilla.model.SettlementStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

public interface SettlementRepository extends JpaRepository<Settlement, String> {
    List<Settlement> findByGroupGroupIdOrderBySettledAtDesc(String groupId);
    List<Settlement> findByGroupGroupIdAndStatusInOrderByCreatedAtAsc(String groupId, Collection<SettlementStatus> statuses);
    List<Settlement> findByGroupGroupIdAndStatusOrderBySettledAtDesc(String groupId, SettlementStatus status);
    Optional<Settlement> findBySettlementIdAndGroupGroupId(String settlementId, String groupId);
}
