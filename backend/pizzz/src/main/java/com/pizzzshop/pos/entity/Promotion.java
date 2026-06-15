package com.pizzzshop.pos.entity;

import com.pizzzshop.pos.constant.PromoType;
import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "promotions")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Promotion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(unique = true, length = 50)
    private String code;

    @Enumerated(EnumType.STRING)
    @Column(name = "promo_type", nullable = false, length = 50)
    private PromoType promoType;

    @Builder.Default
    @Column(name = "discount_value", precision = 10, scale = 2)
    private BigDecimal discountValue = BigDecimal.ZERO;

    @Builder.Default
    @Column(name = "min_order_amount", precision = 10, scale = 2)
    private BigDecimal minOrderAmount = BigDecimal.ZERO;

    @Column(name = "start_date")
    private LocalDateTime startDate;

    @Column(name = "end_date")
    private LocalDateTime endDate;

    // Happy Hour fields
    @Column(name = "happy_hour_start")
    private Integer happyHourStart; // hour 0-23

    @Column(name = "happy_hour_end")
    private Integer happyHourEnd;   // hour 0-23

    @Builder.Default
    @Column(name = "is_active")
    private Boolean isActive = true;
}
