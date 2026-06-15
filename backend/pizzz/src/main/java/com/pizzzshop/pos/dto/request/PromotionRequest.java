package com.pizzzshop.pos.dto.request;

import com.pizzzshop.pos.constant.PromoType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
public class PromotionRequest {
    @NotBlank
    private String name;

    @NotBlank
    private String code;

    @NotNull
    private PromoType promoType;

    private BigDecimal discountValue;
    private BigDecimal minOrderAmount;
    private LocalDateTime startDate;
    private LocalDateTime endDate;
    private Integer happyHourStart;
    private Integer happyHourEnd;
    private Boolean isActive;
}
