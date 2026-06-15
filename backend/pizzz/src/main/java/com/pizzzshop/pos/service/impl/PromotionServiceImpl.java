package com.pizzzshop.pos.service.impl;

import com.pizzzshop.pos.constant.PromoType;
import com.pizzzshop.pos.dto.request.PromotionRequest;
import com.pizzzshop.pos.dto.response.PromotionResponse;
import com.pizzzshop.pos.dto.response.PromotionValidationResponse;
import com.pizzzshop.pos.entity.OrderItem;
import com.pizzzshop.pos.entity.Promotion;
import com.pizzzshop.pos.repository.PromotionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.List;

@Service
@RequiredArgsConstructor
public class PromotionServiceImpl {

    private final PromotionRepository promotionRepository;

    public List<PromotionResponse> getAll() {
        return promotionRepository.findAll().stream()
            .sorted(Comparator.comparing(Promotion::getId).reversed())
            .map(this::toResponse)
            .toList();
    }

    @Transactional
    public PromotionResponse create(PromotionRequest request) {
        Promotion promo = Promotion.builder()
            .name(request.getName())
            .code(request.getCode())
            .promoType(request.getPromoType())
            .discountValue(request.getDiscountValue() != null ? request.getDiscountValue() : BigDecimal.ZERO)
            .minOrderAmount(request.getMinOrderAmount() != null ? request.getMinOrderAmount() : BigDecimal.ZERO)
            .startDate(request.getStartDate())
            .endDate(request.getEndDate())
            .happyHourStart(request.getHappyHourStart())
            .happyHourEnd(request.getHappyHourEnd())
            .isActive(request.getIsActive() != null ? request.getIsActive() : true)
            .build();
        return toResponse(promotionRepository.save(promo));
    }

    @Transactional
    public PromotionResponse update(Long id, PromotionRequest request) {
        Promotion promo = promotionRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Promotion not found"));

        promo.setName(request.getName());
        promo.setCode(request.getCode());
        promo.setPromoType(request.getPromoType());
        promo.setDiscountValue(request.getDiscountValue() != null ? request.getDiscountValue() : BigDecimal.ZERO);
        promo.setMinOrderAmount(request.getMinOrderAmount() != null ? request.getMinOrderAmount() : BigDecimal.ZERO);
        promo.setStartDate(request.getStartDate());
        promo.setEndDate(request.getEndDate());
        promo.setHappyHourStart(request.getHappyHourStart());
        promo.setHappyHourEnd(request.getHappyHourEnd());
        if (request.getIsActive() != null) {
            promo.setIsActive(request.getIsActive());
        }

        return toResponse(promotionRepository.save(promo));
    }

    @Transactional
    public void delete(Long id) {
        if (!promotionRepository.existsById(id)) {
            throw new RuntimeException("Promotion not found");
        }
        promotionRepository.deleteById(id);
    }

    private PromotionResponse toResponse(Promotion promo) {
        return PromotionResponse.builder()
            .id(promo.getId())
            .name(promo.getName())
            .code(promo.getCode())
            .promoType(promo.getPromoType())
            .discountValue(promo.getDiscountValue())
            .minOrderAmount(promo.getMinOrderAmount())
            .startDate(promo.getStartDate())
            .endDate(promo.getEndDate())
            .happyHourStart(promo.getHappyHourStart())
            .happyHourEnd(promo.getHappyHourEnd())
            .isActive(promo.getIsActive())
            .build();
    }

    public PromotionValidationResponse validate(String code, BigDecimal orderAmount) {
        Promotion promo = promotionRepository.findByCodeAndIsActiveTrue(code).orElse(null);
        if (promo == null) {
            return PromotionValidationResponse.builder()
                .valid(false)
                .message("ไม่พบโค้ดส่วนลดนี้ หรือโค้ดถูกปิดใช้งาน")
                .build();
        }

        String error = checkValidity(promo, orderAmount);
        if (error != null) {
            return PromotionValidationResponse.builder()
                .valid(false)
                .message(error)
                .promotionId(promo.getId())
                .name(promo.getName())
                .code(promo.getCode())
                .promoType(promo.getPromoType())
                .discountValue(promo.getDiscountValue())
                .build();
        }

        BigDecimal discountAmount = calculateDiscount(promo, orderAmount, null);
        return PromotionValidationResponse.builder()
            .valid(true)
            .message("ใช้โค้ดส่วนลดสำเร็จ")
            .promotionId(promo.getId())
            .name(promo.getName())
            .code(promo.getCode())
            .promoType(promo.getPromoType())
            .discountValue(promo.getDiscountValue())
            .discountAmount(discountAmount)
            .build();
    }

    /**
     * Returns null if the promotion is valid for the given order amount,
     * otherwise returns a human-readable reason it cannot be applied.
     */
    public String checkValidity(Promotion promo, BigDecimal orderAmount) {
        LocalDateTime now = LocalDateTime.now();

        if (promo.getStartDate() != null && now.isBefore(promo.getStartDate())) {
            return "โปรโมชั่นนี้ยังไม่เริ่ม";
        }
        if (promo.getEndDate() != null && now.isAfter(promo.getEndDate())) {
            return "โปรโมชั่นนี้หมดอายุแล้ว";
        }
        if (promo.getMinOrderAmount() != null && orderAmount.compareTo(promo.getMinOrderAmount()) < 0) {
            return "ยอดสั่งซื้อต้องถึง " + promo.getMinOrderAmount() + " บาท";
        }
        if (promo.getPromoType() == PromoType.HAPPY_HOUR) {
            Integer start = promo.getHappyHourStart();
            Integer end = promo.getHappyHourEnd();
            if (start != null && end != null && !isWithinHappyHour(now.getHour(), start, end)) {
                return "อยู่นอกช่วง Happy Hour";
            }
        }
        return null;
    }

    private boolean isWithinHappyHour(int hour, int start, int end) {
        if (start <= end) {
            return hour >= start && hour < end;
        }
        // Range wraps past midnight, e.g. 22 -> 2
        return hour >= start || hour < end;
    }

    public BigDecimal calculateDiscount(Promotion promo, BigDecimal orderAmount, List<OrderItem> items) {
        BigDecimal discount;
        switch (promo.getPromoType()) {
            case PERCENTAGE:
            case HAPPY_HOUR:
                discount = orderAmount.multiply(promo.getDiscountValue())
                    .divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);
                break;
            case FIXED_AMOUNT:
                discount = promo.getDiscountValue();
                break;
            case BOGO:
                // Cheapest item in the order is free
                discount = (items != null && !items.isEmpty())
                    ? items.stream().map(OrderItem::getUnitPrice).min(Comparator.naturalOrder()).orElse(BigDecimal.ZERO)
                    : BigDecimal.ZERO;
                break;
            default:
                discount = BigDecimal.ZERO;
        }
        if (discount.compareTo(BigDecimal.ZERO) < 0) return BigDecimal.ZERO;
        return discount.min(orderAmount);
    }
}
