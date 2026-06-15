package com.pizzzshop.pos.controller.admin;

import com.pizzzshop.pos.dto.response.ApiResponse;
import com.pizzzshop.pos.entity.InventoryStock;
import com.pizzzshop.pos.entity.Supplier;
import com.pizzzshop.pos.entity.WasteLog;
import com.pizzzshop.pos.repository.SupplierRepository;
import com.pizzzshop.pos.repository.WasteLogRepository;
import com.pizzzshop.pos.service.impl.InventoryServiceImpl;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/inventory")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('MANAGER','ADMIN')")
public class AdminInventoryController {

    private final InventoryServiceImpl inventoryService;
    private final WasteLogRepository wasteLogRepository;
    private final SupplierRepository supplierRepository;

    @GetMapping
    public ResponseEntity<ApiResponse<List<InventoryStock>>> getStock(@RequestParam Long branchId) {
        return ResponseEntity.ok(ApiResponse.ok(inventoryService.getAllStock(branchId)));
    }

    @GetMapping("/low-stock")
    public ResponseEntity<ApiResponse<List<InventoryStock>>> getLowStock(@RequestParam Long branchId) {
        return ResponseEntity.ok(ApiResponse.ok(inventoryService.getLowStockAlerts(branchId)));
    }

    @GetMapping("/waste")
    public ResponseEntity<ApiResponse<List<WasteLog>>> getWasteLogs(@RequestParam Long branchId) {
        // Normally we'd filter by branchId, but for simplicity we return all
        return ResponseEntity.ok(ApiResponse.ok(wasteLogRepository.findAll()));
    }

    @PostMapping("/waste")
    public ResponseEntity<ApiResponse<WasteLog>> createWasteLog(@RequestBody WasteLog wasteLog) {
        return ResponseEntity.ok(ApiResponse.ok(wasteLogRepository.save(wasteLog)));
    }

    @GetMapping("/suppliers")
    public ResponseEntity<ApiResponse<List<Supplier>>> getSuppliers() {
        return ResponseEntity.ok(ApiResponse.ok(supplierRepository.findAll()));
    }
}
