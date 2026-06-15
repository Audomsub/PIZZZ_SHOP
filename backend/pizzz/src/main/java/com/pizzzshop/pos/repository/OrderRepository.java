package com.pizzzshop.pos.repository;

import com.pizzzshop.pos.entity.Order;
import com.pizzzshop.pos.constant.OrderStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.repository.query.Param;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public interface OrderRepository extends JpaRepository<Order, Long> {
    
    @EntityGraph(attributePaths = {"items"})
    List<Order> findByBranchIdAndStatusInOrderByCreatedAtAsc(Long branchId, List<OrderStatus> statuses);

    @EntityGraph(attributePaths = {"items"})
    List<Order> findByBranchIdAndIsHeldTrue(Long branchId);
    
    List<Order> findByBranchIdAndCreatedAtBetween(Long branchId, LocalDateTime start, LocalDateTime end);

    @Query("SELECT o FROM Order o WHERE o.branch.id = :branchId AND o.createdAt BETWEEN :start AND :end AND o.status != 'VOIDED'")
    List<Order> findCompletedOrdersInRange(@Param("branchId") Long branchId,
                                            @Param("start") LocalDateTime start,
                                            @Param("end") LocalDateTime end);

    @Query("SELECT HOUR(o.createdAt) as hour, COUNT(o) as count FROM Order o WHERE o.branch.id = :branchId AND o.createdAt BETWEEN :start AND :end GROUP BY HOUR(o.createdAt)")
    List<Object[]> findPeakHours(@Param("branchId") Long branchId,
                                  @Param("start") LocalDateTime start,
                                  @Param("end") LocalDateTime end);

    @EntityGraph(attributePaths = {"items"})
    List<Order> findByBranchIdAndCreatedAtBetweenOrderByCreatedAtDesc(Long branchId, LocalDateTime start, LocalDateTime end);

    @Query("SELECT COALESCE(SUM(o.finalAmount), 0) FROM Order o WHERE o.cashShift.id = :shiftId AND o.paymentMethod = 'CASH' AND o.paymentStatus = 'PAID'")
    BigDecimal sumCashSalesByCashShiftId(@Param("shiftId") Long shiftId);

    @Query("SELECT COALESCE(SUM(o.finalAmount), 0) FROM Order o WHERE o.cashShift.id = :shiftId AND o.paymentStatus = 'PAID'")
    BigDecimal sumTotalSalesByCashShiftId(@Param("shiftId") Long shiftId);

    @Query("SELECT COUNT(o) FROM Order o WHERE o.cashShift.id = :shiftId AND o.paymentStatus = 'PAID'")
    long countPaidOrdersByCashShiftId(@Param("shiftId") Long shiftId);
}
