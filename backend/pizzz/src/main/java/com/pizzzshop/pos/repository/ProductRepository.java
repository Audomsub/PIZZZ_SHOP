package com.pizzzshop.pos.repository;

import com.pizzzshop.pos.entity.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ProductRepository extends JpaRepository<Product, Long> {
    List<Product> findByIsAvailableTrue();
    List<Product> findByCategoryIdAndIsAvailableTrue(Long categoryId);
    List<Product> findByIsPizzaTrue();
}
