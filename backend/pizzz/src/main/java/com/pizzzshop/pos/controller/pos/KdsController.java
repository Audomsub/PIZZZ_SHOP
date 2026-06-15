package com.pizzzshop.pos.controller.pos;

import com.pizzzshop.pos.constant.OrderStatus;
import com.pizzzshop.pos.dto.response.ApiResponse;
import com.pizzzshop.pos.dto.response.OrderResponse;
import com.pizzzshop.pos.service.impl.OrderServiceImpl;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/kds")
@RequiredArgsConstructor
public class KdsController {

    private final OrderServiceImpl orderService;

    @GetMapping("/orders")
    public ResponseEntity<ApiResponse<List<OrderResponse>>> getKdsOrders(@RequestParam Long branchId) {
        return ResponseEntity.ok(ApiResponse.ok(orderService.getActiveOrders(branchId)));
    }

    @PatchMapping("/orders/{id}/status")
    public ResponseEntity<ApiResponse<OrderResponse>> updateStatus(
            @PathVariable Long id,
            @RequestBody Map<String, String> body) {
        OrderStatus status = OrderStatus.valueOf(body.get("status"));
        return ResponseEntity.ok(ApiResponse.ok(orderService.updateStatus(id, status)));
    }
}
