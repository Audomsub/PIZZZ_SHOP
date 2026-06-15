package com.pizzzshop.pos.repository;

import com.pizzzshop.pos.entity.Recipe;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface RecipeRepository extends JpaRepository<Recipe, Long> {
    List<Recipe> findByProductIdAndSizeId(Long productId, Long sizeId);
}
