package com.pizzzshop.pos.repository;

import com.pizzzshop.pos.entity.Supplier;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SupplierRepository extends JpaRepository<Supplier, Long> {
}
