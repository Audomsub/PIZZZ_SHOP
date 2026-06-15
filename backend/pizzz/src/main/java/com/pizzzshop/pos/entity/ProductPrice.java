package com.pizzzshop.pos.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;

@Entity
@Table(name = "product_prices", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"product_id", "size_id", "crust_id"})
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProductPrice {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id")
    private Product product;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "size_id")
    private Size size;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "crust_id")
    private Crust crust;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal price;
}
