package com.pizzzshop.pos.repository;

import com.pizzzshop.pos.entity.TimeClock;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface TimeClockRepository extends JpaRepository<TimeClock, Long> {
    Optional<TimeClock> findFirstByUserIdAndClockOutIsNullOrderByClockInDesc(Long userId);
}
