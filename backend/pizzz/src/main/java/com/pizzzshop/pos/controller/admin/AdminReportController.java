package com.pizzzshop.pos.controller.admin;

import com.pizzzshop.pos.constant.OrderStatus;
import com.pizzzshop.pos.dto.response.ApiResponse;
import com.pizzzshop.pos.entity.Order;
import com.pizzzshop.pos.repository.OrderRepository;
import com.pizzzshop.pos.repository.OrderItemRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;

@RestController
@RequestMapping("/api/admin/reports")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('MANAGER','ADMIN')")
public class AdminReportController {

    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;

    @GetMapping("/sales")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getSalesReport(
            @RequestParam Long branchId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {

        LocalDateTime start = startDate.atStartOfDay();
        LocalDateTime end = endDate.plusDays(1).atStartOfDay();

        List<Order> orders = orderRepository.findCompletedOrdersInRange(branchId, start, end);

        BigDecimal totalRevenue = orders.stream()
            .map(Order::getFinalAmount)
            .reduce(BigDecimal.ZERO, BigDecimal::add);

        long orderCount = orders.size();
        BigDecimal avgOrderValue = orderCount > 0
            ? totalRevenue.divide(BigDecimal.valueOf(orderCount), 2, java.math.RoundingMode.HALF_UP)
            : BigDecimal.ZERO;

        Map<String, Object> report = new LinkedHashMap<>();
        report.put("totalRevenue", totalRevenue);
        report.put("orderCount", orderCount);
        report.put("avgOrderValue", avgOrderValue);
        report.put("period", Map.of("start", startDate, "end", endDate));

        return ResponseEntity.ok(ApiResponse.ok(report));
    }

    @GetMapping("/top-products")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getTopProducts(
            @RequestParam Long branchId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {

        LocalDateTime start = startDate.atStartOfDay();
        LocalDateTime end = endDate.plusDays(1).atStartOfDay();

        List<Object[]> results = orderItemRepository.findTopProducts(branchId, start, end);
        List<Map<String, Object>> topProducts = results.stream().map(r -> {
            Map<String, Object> m = new LinkedHashMap<>();
            m.put("productId", r[0]);
            m.put("productName", r[1]);
            m.put("totalQty", r[2]);
            return m;
        }).toList();

        return ResponseEntity.ok(ApiResponse.ok(topProducts));
    }

    @GetMapping("/dashboard")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getDashboard(@RequestParam Long branchId) {
        LocalDateTime todayStart = LocalDate.now().atStartOfDay();
        LocalDateTime todayEnd = todayStart.plusDays(1);

        List<Order> todayOrders = orderRepository.findCompletedOrdersInRange(branchId, todayStart, todayEnd);
        BigDecimal todayRevenue = todayOrders.stream()
            .map(Order::getFinalAmount).reduce(BigDecimal.ZERO, BigDecimal::add);

        Map<String, Object> dashboard = new LinkedHashMap<>();
        dashboard.put("todayRevenue", todayRevenue);
        dashboard.put("todayOrders", todayOrders.size());
        dashboard.put("date", LocalDate.now());

        return ResponseEntity.ok(ApiResponse.ok(dashboard));
    }
}
