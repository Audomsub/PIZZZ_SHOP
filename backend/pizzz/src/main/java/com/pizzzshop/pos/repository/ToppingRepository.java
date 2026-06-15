package com.pizzzshop.pos.repository;

import com.pizzzshop.pos.entity.Topping;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ToppingRepository extends JpaRepository<Topping, Long> {
    List<Topping> findAll();
}
