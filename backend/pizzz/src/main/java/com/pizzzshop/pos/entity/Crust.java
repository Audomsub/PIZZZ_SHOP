package com.pizzzshop.pos.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "crusts")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Crust {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 50)
    private String name;
}
