package com.pizzzshop.pos.service.impl;

import com.pizzzshop.pos.entity.*;
import com.pizzzshop.pos.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class InventoryServiceImpl {

    private final InventoryStockRepository stockRepository;
    private final RecipeRepository recipeRepository;
    private final WasteLogRepository wasteLogRepository;

    @Transactional
    public void deductStockForOrder(Long branchId, List<OrderItem> items) {
        for (OrderItem item : items) {
            if (item.getProduct() == null || item.getSize() == null) continue;

            List<Recipe> recipes = recipeRepository.findByProductIdAndSizeId(
                item.getProduct().getId(), item.getSize().getId());

            for (Recipe recipe : recipes) {
                BigDecimal needed = recipe.getAmountRequired()
                    .multiply(BigDecimal.valueOf(item.getQuantity()));

                stockRepository.findByBranchIdAndIngredientId(branchId, recipe.getIngredient().getId())
                    .ifPresent(stock -> {
                        BigDecimal newQty = stock.getQuantity().subtract(needed);
                        if (newQty.compareTo(BigDecimal.ZERO) < 0) newQty = BigDecimal.ZERO;
                        stock.setQuantity(newQty);
                        stockRepository.save(stock);

                        if (newQty.compareTo(stock.getLowStockThreshold()) <= 0) {
                            log.warn("LOW STOCK ALERT: {} at branch {} - qty: {}",
                                stock.getIngredient().getName(), branchId, newQty);
                        }
                    });
            }
        }
    }

    @Transactional
    public WasteLog logWaste(Long branchId, Long ingredientId, BigDecimal quantity, String reason, User loggedBy) {
        InventoryStock stock = stockRepository.findByBranchIdAndIngredientId(branchId, ingredientId)
            .orElseThrow(() -> new RuntimeException("Stock not found"));

        BigDecimal newQty = stock.getQuantity().subtract(quantity);
        if (newQty.compareTo(BigDecimal.ZERO) < 0) newQty = BigDecimal.ZERO;
        stock.setQuantity(newQty);
        stockRepository.save(stock);

        Ingredient ingredient = new Ingredient();
        ingredient.setId(ingredientId);

        Branch branch = new Branch();
        branch.setId(branchId);

        return wasteLogRepository.save(WasteLog.builder()
            .branch(branch)
            .ingredient(ingredient)
            .quantity(quantity)
            .reason(reason)
            .loggedBy(loggedBy)
            .createdAt(LocalDateTime.now())
            .build());
    }

    public List<InventoryStock> getLowStockAlerts(Long branchId) {
        return stockRepository.findLowStockByBranchId(branchId);
    }

    public List<InventoryStock> getAllStock(Long branchId) {
        return stockRepository.findByBranchId(branchId);
    }
}
