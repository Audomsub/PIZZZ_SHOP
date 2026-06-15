package com.pizzzshop.pos.controller.admin;

import com.pizzzshop.pos.dto.response.ApiResponse;
import com.pizzzshop.pos.dto.response.CashShiftResponse;
import com.pizzzshop.pos.service.impl.CashShiftServiceImpl;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/cash-shifts")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('MANAGER','ADMIN')")
public class AdminCashShiftController {

    private final CashShiftServiceImpl cashShiftService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<CashShiftResponse>>> getHistory(@RequestParam Long branchId) {
        return ResponseEntity.ok(ApiResponse.ok(cashShiftService.getShiftHistory(branchId)));
    }
}
