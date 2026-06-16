package com.pizzzshop.pos.repository;

import com.pizzzshop.pos.entity.CashShift;
import com.pizzzshop.pos.constant.ShiftStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface CashShiftRepository extends JpaRepository<CashShift, Long> {
    Optional<CashShift> findFirstByBranchIdAndStatusOrderByOpenedAtDesc(Long branchId, ShiftStatus status);
    List<CashShift> findByBranchIdOrderByOpenedAtDesc(Long branchId);
}
