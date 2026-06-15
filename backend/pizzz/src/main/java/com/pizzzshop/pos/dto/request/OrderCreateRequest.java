package com.pizzzshop.pos.dto.request;

import com.pizzzshop.pos.constant.OrderType;
import jakarta.validation.constraints.*;
import lombok.Data;
import java.util.List;

@Data
public class OrderCreateRequest {
    @NotNull
    private Long branchId;

    @NotNull
    private OrderType orderType;

    private Long customerId;
    private Long cashShiftId;

    private String tableNumber;
    private String instructionNotes;

    private String promoCode;

    private String deliveryAddress;

    @NotEmpty
    private List<OrderItemRequest> items;
}
