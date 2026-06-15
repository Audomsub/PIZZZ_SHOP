package com.pizzzshop.pos.dto.response;

import com.pizzzshop.pos.constant.PromoType;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PromotionResponse {
    private Long id;
    private String name;
    private String code;
    private PromoType promoType;
    private BigDecimal discountValue;
    private BigDecimal minOrderAmount;
    private LocalDateTime startDate;
    private LocalDateTime endDate;
    private Integer happyHourStart;
    private Integer happyHourEnd;
    private Boolean isActive;
}
