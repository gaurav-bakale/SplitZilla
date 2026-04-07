package com.splitzilla.repository;

import com.splitzilla.model.Settlement;
import com.splitzilla.model.SettlementStatus;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

public interface SettlementRepository extends MongoRepository<Settlement, String> {
    List<Settlement> findByGroupIdOrderBySettledAtDesc(String groupId);
    List<Settlement> findByGroupIdAndStatusInOrderByCreatedAtAsc(String groupId, Collection<SettlementStatus> statuses);
    List<Settlement> findByGroupIdAndStatusOrderBySettledAtDesc(String groupId, SettlementStatus status);
    Optional<Settlement> findBySettlementIdAndGroupId(String settlementId, String groupId);
}
