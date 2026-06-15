package com.pizzzshop.pos.dto.response;

import lombok.*;
import java.math.BigDecimal;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProductResponse {
    private Long id;
    private String categoryName;
    private Long categoryId;
    private String name;
    private String description;
    private String imageUrl;
    private Boolean isPizza;
    private Boolean isAvailable;
    private List<PriceOption> prices;
    private List<ToppingInfo> toppings;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PriceOption {
        private Long sizeId;
        private String sizeName;
        private Long crustId;
        private String crustName;
        private BigDecimal price;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ToppingInfo {
        private Long toppingId;
        private String name;
        private Boolean isAllergen;
        private String allergyNote;
        private BigDecimal priceS;
        private BigDecimal priceM;
        private BigDecimal priceL;
    }
}
