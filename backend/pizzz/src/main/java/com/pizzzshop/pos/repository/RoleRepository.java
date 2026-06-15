package com.pizzzshop.pos.repository;

import com.pizzzshop.pos.entity.Role;
import com.pizzzshop.pos.constant.RoleType;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface RoleRepository extends JpaRepository<Role, Long> {
    Optional<Role> findByName(RoleType name);
}
