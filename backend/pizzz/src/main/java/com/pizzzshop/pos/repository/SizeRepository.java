package com.pizzzshop.pos.repository;

import com.pizzzshop.pos.entity.Size;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface SizeRepository extends JpaRepository<Size, Long> {
    Optional<Size> findByName(String name);
}
