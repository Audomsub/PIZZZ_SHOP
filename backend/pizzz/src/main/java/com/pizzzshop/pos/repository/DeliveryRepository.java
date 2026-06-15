package com.pizzzshop.pos.repository;

import com.pizzzshop.pos.entity.Delivery;
import com.pizzzshop.pos.constant.DeliveryStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface DeliveryRepository extends JpaRepository<Delivery, Long> {
    List<Delivery> findByRiderIdAndStatus(Long riderId, DeliveryStatus status);
}
