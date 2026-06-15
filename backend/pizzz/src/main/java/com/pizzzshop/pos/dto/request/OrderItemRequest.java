package com.pizzzshop.pos.dto.request;

import jakarta.validation.constraints.*;
import lombok.Data;
import java.util.List;

@Data
public class OrderItemRequest {
    @NotNull
    private Long productId;

    private Long sizeId;
    private Long crustId;

    private Boolean isHalfAndHalf = false;
    private Long productIdHalf;

    @Min(1)
    private Integer quantity = 1;

    private String itemNotes;

    private List<ModifierRequest> modifiers;
}
