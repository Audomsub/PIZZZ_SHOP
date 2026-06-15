package com.pizzzshop.pos.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;

@Entity
@Table(name = "topping_prices", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"topping_id", "size_id"})
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ToppingPrice {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "topping_id")
    private Topping topping;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "size_id")
    private Size size;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal price;
}
