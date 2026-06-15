package com.pizzzshop.pos.repository;

import com.pizzzshop.pos.entity.OrderItemModifier;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface OrderItemModifierRepository extends JpaRepository<OrderItemModifier, Long> {
    List<OrderItemModifier> findByOrderItemId(Long orderItemId);
}
