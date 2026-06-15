package com.pizzzshop.pos.repository;

import com.pizzzshop.pos.entity.InventoryStock;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;
import java.util.Optional;

public interface InventoryStockRepository extends JpaRepository<InventoryStock, Long> {
    List<InventoryStock> findByBranchId(Long branchId);
    Optional<InventoryStock> findByBranchIdAndIngredientId(Long branchId, Long ingredientId);

    @Query("SELECT s FROM InventoryStock s WHERE s.branch.id = :branchId AND s.quantity <= s.lowStockThreshold")
    List<InventoryStock> findLowStockByBranchId(@Param("branchId") Long branchId);
}
