package com.pizzzshop.pos.controller.pos;

import com.pizzzshop.pos.dto.response.ApiResponse;
import com.pizzzshop.pos.dto.response.CashShiftResponse;
import com.pizzzshop.pos.service.impl.CashShiftServiceImpl;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.Map;

@RestController
@RequestMapping("/api/cash-shifts")
@RequiredArgsConstructor
public class CashShiftController {

    private final CashShiftServiceImpl cashShiftService;

    @GetMapping("/current")
    public ResponseEntity<ApiResponse<CashShiftResponse>> getCurrent(@RequestParam Long branchId) {
        return ResponseEntity.ok(ApiResponse.ok(cashShiftService.getCurrentShift(branchId)));
    }

    @PostMapping("/open")
    public ResponseEntity<ApiResponse<CashShiftResponse>> open(@RequestBody Map<String, Object> body) {
        Long branchId = Long.valueOf(String.valueOf(body.get("branchId")));
        BigDecimal startAmount = new BigDecimal(String.valueOf(body.getOrDefault("startAmount", "0")));
        return ResponseEntity.ok(ApiResponse.ok("Shift opened", cashShiftService.openShift(branchId, startAmount)));
    }

    @PostMapping("/{id}/close")
    public ResponseEntity<ApiResponse<CashShiftResponse>> close(@PathVariable Long id, @RequestBody Map<String, Object> body) {
        BigDecimal actualAmount = new BigDecimal(String.valueOf(body.getOrDefault("actualAmount", "0")));
        return ResponseEntity.ok(ApiResponse.ok("Shift closed", cashShiftService.closeShift(id, actualAmount)));
    }
}
