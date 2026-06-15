package com.pizzzshop.pos.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "ingredients")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Ingredient {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(nullable = false, length = 20)
    private String unit;

    @Builder.Default
    @Column(name = "is_allergen")
    private Boolean isAllergen = false;

    @Column(name = "allergy_note", length = 255)
    private String allergyNote;
}
