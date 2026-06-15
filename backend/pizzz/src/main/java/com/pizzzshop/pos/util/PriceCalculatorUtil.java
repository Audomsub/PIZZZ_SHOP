package com.pizzzshop.pos.util;

import com.pizzzshop.pos.entity.*;
import com.pizzzshop.pos.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;

@Component
@RequiredArgsConstructor
public class PriceCalculatorUtil {

    private final ProductPriceRepository productPriceRepository;
    private final ToppingPriceRepository toppingPriceRepository;

    @Value("${app.half-and-half.pricing-rule:MAX}")
    private String halfAndHalfRule;

    @Value("${app.vat.rate:0.07}")
    private BigDecimal vatRate;

    @Value("${app.vat.inclusive:true}")
    private boolean vatInclusive;

    public BigDecimal getBasePrice(Long productId, Long sizeId, Long crustId) {
        return productPriceRepository
            .findByProductIdAndSizeIdAndCrustId(productId, sizeId, crustId)
            .map(ProductPrice::getPrice)
            .orElse(BigDecimal.ZERO);
    }

    public BigDecimal calculateHalfAndHalfPrice(Long product1Id, Long product2Id, Long sizeId, Long crustId) {
        BigDecimal price1 = getBasePrice(product1Id, sizeId, crustId);
        BigDecimal price2 = getBasePrice(product2Id, sizeId, crustId);

        if ("MAX".equalsIgnoreCase(halfAndHalfRule)) {
            return price1.max(price2);
        } else {
            // AVERAGE
            return price1.add(price2).divide(BigDecimal.valueOf(2), 2, RoundingMode.HALF_UP);
        }
    }

    public BigDecimal getToppingPrice(Long toppingId, Long sizeId) {
        return toppingPriceRepository
            .findByToppingIdAndSizeId(toppingId, sizeId)
            .map(ToppingPrice::getPrice)
            .orElse(BigDecimal.ZERO);
    }

    public BigDecimal calculateVat(BigDecimal amount) {
        if (vatInclusive) {
            // VAT already included: taxAmount = amount * rate / (1 + rate)
            return amount.multiply(vatRate)
                .divide(BigDecimal.ONE.add(vatRate), 2, RoundingMode.HALF_UP);
        } else {
            return amount.multiply(vatRate).setScale(2, RoundingMode.HALF_UP);
        }
    }
}
