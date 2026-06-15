package com.pizzzshop.pos.repository;

import com.pizzzshop.pos.entity.ToppingPrice;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface ToppingPriceRepository extends JpaRepository<ToppingPrice, Long> {
    Optional<ToppingPrice> findByToppingIdAndSizeId(Long toppingId, Long sizeId);
    List<ToppingPrice> findByToppingId(Long toppingId);
}
