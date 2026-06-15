package com.pizzzshop.pos.entity;

import com.pizzzshop.pos.constant.ModifierType;
import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;

@Entity
@Table(name = "order_item_modifiers")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OrderItemModifier {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_item_id")
    private OrderItem orderItem;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "topping_id")
    private Topping topping;

    @Enumerated(EnumType.STRING)
    @Column(name = "modifier_type", nullable = false, length = 10)
    private ModifierType modifierType;

    @Builder.Default
    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal price = BigDecimal.ZERO;
}
