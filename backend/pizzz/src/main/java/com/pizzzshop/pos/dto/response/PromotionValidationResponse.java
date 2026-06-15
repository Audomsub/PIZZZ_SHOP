package com.pizzzshop.pos.dto.response;

import com.pizzzshop.pos.constant.PromoType;
import lombok.*;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PromotionValidationResponse {
    private boolean valid;
    private String message;
    private Long promotionId;
    private String name;
    private String code;
    private PromoType promoType;
    private BigDecimal discountValue;
    private BigDecimal discountAmount;
}
