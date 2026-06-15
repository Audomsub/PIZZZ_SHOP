package com.pizzzshop.pos.dto.request;

import com.pizzzshop.pos.constant.ModifierType;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class ModifierRequest {
    @NotNull
    private Long toppingId;
    @NotNull
    private ModifierType modifierType;
}
