package com.pizzzshop.pos.controller.pos;

import com.pizzzshop.pos.constant.OrderStatus;
import com.pizzzshop.pos.constant.PaymentMethod;
import com.pizzzshop.pos.dto.request.OrderCreateRequest;
import com.pizzzshop.pos.dto.response.ApiResponse;
import com.pizzzshop.pos.dto.response.OrderResponse;
import com.pizzzshop.pos.service.impl.OrderServiceImpl;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
public class OrderController {

    private final OrderServiceImpl orderService;

    @PostMapping
    public ResponseEntity<ApiResponse<OrderResponse>> createOrder(@Valid @RequestBody OrderCreateRequest request) {
        return ResponseEntity.ok(ApiResponse.ok("Order created", orderService.createOrder(request)));
    }

    @GetMapping("/active")
    public ResponseEntity<ApiResponse<List<OrderResponse>>> getActiveOrders(@RequestParam Long branchId) {
        return ResponseEntity.ok(ApiResponse.ok(orderService.getActiveOrders(branchId)));
    }

    @GetMapping("/held")
    public ResponseEntity<ApiResponse<List<OrderResponse>>> getHeldOrders(@RequestParam Long branchId) {
        return ResponseEntity.ok(ApiResponse.ok(orderService.getHeldOrders(branchId)));
    }

    @GetMapping("/history")
    public ResponseEntity<ApiResponse<List<OrderResponse>>> getOrderHistory(
            @RequestParam Long branchId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        return ResponseEntity.ok(ApiResponse.ok(orderService.getOrderHistory(branchId, startDate, endDate)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<OrderResponse>> getOrder(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok(orderService.getOrder(id)));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<ApiResponse<OrderResponse>> updateStatus(
            @PathVariable Long id,
            @RequestBody Map<String, String> body) {
        OrderStatus status = OrderStatus.valueOf(body.get("status"));
        return ResponseEntity.ok(ApiResponse.ok(orderService.updateStatus(id, status)));
    }

    @PostMapping("/{id}/hold")
    public ResponseEntity<ApiResponse<OrderResponse>> holdOrder(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok(orderService.holdOrder(id)));
    }

    @PostMapping("/{id}/recall")
    public ResponseEntity<ApiResponse<OrderResponse>> recallOrder(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok(orderService.recallOrder(id)));
    }

    @PostMapping("/{id}/void")
    @PreAuthorize("hasAnyRole('MANAGER','ADMIN')")
    public ResponseEntity<ApiResponse<OrderResponse>> voidOrder(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok(orderService.voidOrder(id)));
    }

    @PostMapping("/{id}/pay")
    public ResponseEntity<ApiResponse<OrderResponse>> payOrder(
            @PathVariable Long id,
            @RequestBody Map<String, String> body) {
        PaymentMethod method = PaymentMethod.valueOf(body.get("paymentMethod"));
        return ResponseEntity.ok(ApiResponse.ok(orderService.payOrder(id, method)));
    }
}
