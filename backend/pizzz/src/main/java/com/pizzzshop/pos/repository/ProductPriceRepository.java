package com.pizzzshop.pos.repository;

import com.pizzzshop.pos.entity.ProductPrice;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface ProductPriceRepository extends JpaRepository<ProductPrice, Long> {
    List<ProductPrice> findByProductId(Long productId);
    Optional<ProductPrice> findByProductIdAndSizeIdAndCrustId(Long productId, Long sizeId, Long crustId);
}
