package com.pizzzshop.pos.service.impl;

import com.pizzzshop.pos.dto.response.ProductResponse;
import com.pizzzshop.pos.entity.*;
import com.pizzzshop.pos.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.*;

@Service
@RequiredArgsConstructor
public class ProductServiceImpl {

    private final ProductRepository productRepository;
    private final ProductPriceRepository productPriceRepository;
    private final ToppingRepository toppingRepository;
    private final ToppingPriceRepository toppingPriceRepository;
    private final CategoryRepository categoryRepository;

    public List<ProductResponse> getAllAvailable() {
        List<Product> products = productRepository.findByIsAvailableTrue();
        return products.stream().map(this::toResponse).toList();
    }

    public List<ProductResponse> getByCategory(Long categoryId) {
        return productRepository.findByCategoryIdAndIsAvailableTrue(categoryId)
            .stream().map(this::toResponse).toList();
    }

    public ProductResponse getById(Long id) {
        Product product = productRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Product not found"));
        return toResponse(product);
    }

    public List<Category> getAllCategories() {
        return categoryRepository.findAll();
    }

    public List<Topping> getAllToppings() {
        return toppingRepository.findAll();
    }

    private ProductResponse toResponse(Product product) {
        List<ProductPrice> prices = productPriceRepository.findByProductId(product.getId());
        List<ProductResponse.PriceOption> priceOptions = prices.stream().map(pp ->
            ProductResponse.PriceOption.builder()
                .sizeId(pp.getSize().getId())
                .sizeName(pp.getSize().getName())
                .crustId(pp.getCrust().getId())
                .crustName(pp.getCrust().getName())
                .price(pp.getPrice())
                .build()
        ).toList();

        // Get toppings with allergy info
        List<Topping> toppings = toppingRepository.findAll();
        List<ProductResponse.ToppingInfo> toppingInfos = toppings.stream().map(t -> {
            // Get prices per size (simplified: S=1, M=2, L=3 assuming IDs)
            BigDecimal priceS = getToppingPriceByName(t.getId(), "S");
            BigDecimal priceM = getToppingPriceByName(t.getId(), "M");
            BigDecimal priceL = getToppingPriceByName(t.getId(), "L");

            return ProductResponse.ToppingInfo.builder()
                .toppingId(t.getId())
                .name(t.getName())
                .isAllergen(t.getIngredient() != null && t.getIngredient().getIsAllergen())
                .allergyNote(t.getIngredient() != null ? t.getIngredient().getAllergyNote() : null)
                .priceS(priceS)
                .priceM(priceM)
                .priceL(priceL)
                .build();
        }).toList();

        return ProductResponse.builder()
            .id(product.getId())
            .categoryId(product.getCategory() != null ? product.getCategory().getId() : null)
            .categoryName(product.getCategory() != null ? product.getCategory().getName() : null)
            .name(product.getName())
            .description(product.getDescription())
            .imageUrl(product.getImageUrl())
            .isPizza(product.getIsPizza())
            .isAvailable(product.getIsAvailable())
            .prices(priceOptions)
            .toppings(Boolean.TRUE.equals(product.getIsPizza()) ? toppingInfos : List.of())
            .build();
    }

    private BigDecimal getToppingPriceByName(Long toppingId, String sizeName) {
        return toppingPriceRepository.findByToppingId(toppingId).stream()
            .filter(tp -> sizeName.equalsIgnoreCase(tp.getSize().getName()))
            .map(ToppingPrice::getPrice)
            .findFirst()
            .orElse(BigDecimal.ZERO);
    }
}
