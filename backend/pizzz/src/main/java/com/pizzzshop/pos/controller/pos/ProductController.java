package com.pizzzshop.pos.controller.pos;

import com.pizzzshop.pos.dto.response.ApiResponse;
import com.pizzzshop.pos.dto.response.ProductResponse;
import com.pizzzshop.pos.entity.Category;
import com.pizzzshop.pos.entity.Topping;
import com.pizzzshop.pos.service.impl.ProductServiceImpl;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/products")
@RequiredArgsConstructor
public class ProductController {

    private final ProductServiceImpl productService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<ProductResponse>>> getAll(
            @RequestParam(required = false) Long categoryId) {
        List<ProductResponse> products = categoryId != null
            ? productService.getByCategory(categoryId)
            : productService.getAllAvailable();
        return ResponseEntity.ok(ApiResponse.ok(products));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ProductResponse>> getById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok(productService.getById(id)));
    }

    @GetMapping("/categories")
    public ResponseEntity<ApiResponse<List<Category>>> getCategories() {
        return ResponseEntity.ok(ApiResponse.ok(productService.getAllCategories()));
    }

    @GetMapping("/toppings")
    public ResponseEntity<ApiResponse<List<Topping>>> getToppings() {
        return ResponseEntity.ok(ApiResponse.ok(productService.getAllToppings()));
    }
}
