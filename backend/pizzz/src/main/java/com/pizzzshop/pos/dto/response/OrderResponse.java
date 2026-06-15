package com.pizzzshop.pos.dto.response;

import com.pizzzshop.pos.constant.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OrderResponse {
    private Long id;
    private Long branchId;
    private String branchName;
    private Long customerId;
    private String customerName;
    private String cashierName;
    private OrderType orderType;
    private OrderStatus status;
    private PaymentMethod paymentMethod;
    private PaymentStatus paymentStatus;
    private BigDecimal totalAmount;
    private BigDecimal taxAmount;
    private BigDecimal discountAmount;
    private BigDecimal finalAmount;
    private String promoCode;
    private String promoName;
    private String tableNumber;
    private String instructionNotes;
    private Boolean isHeld;
    private List<OrderItemResponse> items;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class OrderItemResponse {
        private Long id;
        private Long productId;
        private String productName;
        private String sizeName;
        private String crustName;
        private Boolean isHalfAndHalf;
        private String productHalfName;
        private Integer quantity;
        private BigDecimal unitPrice;
        private BigDecimal subtotal;
        private String itemNotes;
        private List<ModifierResponse> modifiers;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ModifierResponse {
        private Long toppingId;
        private String toppingName;
        private ModifierType modifierType;
        private BigDecimal price;
    }
}
