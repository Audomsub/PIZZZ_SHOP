package com.pizzzshop.pos.repository;

import com.pizzzshop.pos.entity.Ingredient;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface IngredientRepository extends JpaRepository<Ingredient, Long> {
    List<Ingredient> findByIsAllergenTrue();
}
