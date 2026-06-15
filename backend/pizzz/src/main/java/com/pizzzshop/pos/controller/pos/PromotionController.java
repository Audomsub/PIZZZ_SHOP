package com.pizzzshop.pos.controller.pos;

import com.pizzzshop.pos.dto.response.ApiResponse;
import com.pizzzshop.pos.dto.response.PromotionValidationResponse;
import com.pizzzshop.pos.service.impl.PromotionServiceImpl;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;

@RestController
@RequestMapping("/api/promotions")
@RequiredArgsConstructor
public class PromotionController {

    private final PromotionServiceImpl promotionService;

    @GetMapping("/validate")
    public ResponseEntity<ApiResponse<PromotionValidationResponse>> validate(
            @RequestParam String code,
            @RequestParam BigDecimal orderAmount) {
        return ResponseEntity.ok(ApiResponse.ok(promotionService.validate(code, orderAmount)));
    }
}
