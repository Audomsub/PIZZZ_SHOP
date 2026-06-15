package com.pizzzshop.pos.repository;

import com.pizzzshop.pos.entity.Crust;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface CrustRepository extends JpaRepository<Crust, Long> {
    Optional<Crust> findByName(String name);
}
