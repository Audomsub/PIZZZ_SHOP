package com.pizzzshop.pos.repository;

import com.pizzzshop.pos.entity.OrderItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.time.LocalDateTime;
import java.util.List;

public interface OrderItemRepository extends JpaRepository<OrderItem, Long> {
    List<OrderItem> findByOrderId(Long orderId);

    @Query("SELECT oi.product.id, oi.product.name, SUM(oi.quantity) as totalQty " +
           "FROM OrderItem oi JOIN oi.order o " +
           "WHERE o.branch.id = :branchId AND o.createdAt BETWEEN :start AND :end AND o.status != 'VOIDED' " +
           "GROUP BY oi.product.id, oi.product.name ORDER BY totalQty DESC")
    List<Object[]> findTopProducts(@Param("branchId") Long branchId,
                                    @Param("start") LocalDateTime start,
                                    @Param("end") LocalDateTime end);
}
