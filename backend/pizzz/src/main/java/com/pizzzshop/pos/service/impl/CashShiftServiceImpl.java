package com.pizzzshop.pos.service.impl;

import com.pizzzshop.pos.constant.ShiftStatus;
import com.pizzzshop.pos.dto.response.CashShiftResponse;
import com.pizzzshop.pos.entity.Branch;
import com.pizzzshop.pos.entity.CashShift;
import com.pizzzshop.pos.entity.User;
import com.pizzzshop.pos.repository.BranchRepository;
import com.pizzzshop.pos.repository.CashShiftRepository;
import com.pizzzshop.pos.repository.OrderRepository;
import com.pizzzshop.pos.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class CashShiftServiceImpl {

    private final CashShiftRepository cashShiftRepository;
    private final OrderRepository orderRepository;
    private final BranchRepository branchRepository;
    private final UserRepository userRepository;

    public CashShiftResponse getCurrentShift(Long branchId) {
        return cashShiftRepository.findByBranchIdAndStatus(branchId, ShiftStatus.OPEN)
            .map(this::toResponse)
            .orElse(null);
    }

    public List<CashShiftResponse> getShiftHistory(Long branchId) {
        return cashShiftRepository.findByBranchIdOrderByOpenedAtDesc(branchId)
            .stream().map(this::toResponse).toList();
    }

    @Transactional
    public CashShiftResponse openShift(Long branchId, BigDecimal startAmount) {
        if (cashShiftRepository.findByBranchIdAndStatus(branchId, ShiftStatus.OPEN).isPresent()) {
            throw new RuntimeException("มีรอบเงินสดที่เปิดอยู่แล้วสำหรับสาขานี้");
        }

        Branch branch = branchRepository.findById(branchId)
            .orElseThrow(() -> new RuntimeException("Branch not found"));

        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByUsername(username).orElse(null);

        CashShift shift = CashShift.builder()
            .branch(branch)
            .user(user)
            .startAmount(startAmount != null ? startAmount : BigDecimal.ZERO)
            .status(ShiftStatus.OPEN)
            .openedAt(LocalDateTime.now())
            .build();

        return toResponse(cashShiftRepository.save(shift));
    }

    @Transactional
    public CashShiftResponse closeShift(Long shiftId, BigDecimal actualAmount) {
        CashShift shift = cashShiftRepository.findById(shiftId)
            .orElseThrow(() -> new RuntimeException("Shift not found"));

        if (shift.getStatus() == ShiftStatus.CLOSED) {
            throw new RuntimeException("รอบเงินสดนี้ถูกปิดไปแล้ว");
        }

        BigDecimal cashSales = orderRepository.sumCashSalesByCashShiftId(shiftId);
        BigDecimal endAmount = shift.getStartAmount().add(cashSales);

        shift.setEndAmount(endAmount);
        shift.setActualAmount(actualAmount);
        shift.setStatus(ShiftStatus.CLOSED);
        shift.setClosedAt(LocalDateTime.now());

        return toResponse(cashShiftRepository.save(shift));
    }

    private CashShiftResponse toResponse(CashShift shift) {
        BigDecimal cashSales = orderRepository.sumCashSalesByCashShiftId(shift.getId());
        BigDecimal totalSales = orderRepository.sumTotalSalesByCashShiftId(shift.getId());
        long orderCount = orderRepository.countPaidOrdersByCashShiftId(shift.getId());

        BigDecimal endAmount = shift.getEndAmount() != null
            ? shift.getEndAmount()
            : shift.getStartAmount().add(cashSales);

        BigDecimal variance = shift.getActualAmount() != null
            ? shift.getActualAmount().subtract(endAmount)
            : null;

        return CashShiftResponse.builder()
            .id(shift.getId())
            .branchId(shift.getBranch() != null ? shift.getBranch().getId() : null)
            .branchName(shift.getBranch() != null ? shift.getBranch().getName() : null)
            .userId(shift.getUser() != null ? shift.getUser().getId() : null)
            .username(shift.getUser() != null ? shift.getUser().getUsername() : null)
            .startAmount(shift.getStartAmount())
            .endAmount(endAmount)
            .actualAmount(shift.getActualAmount())
            .variance(variance)
            .cashSales(cashSales)
            .totalSales(totalSales)
            .orderCount(orderCount)
            .status(shift.getStatus())
            .openedAt(shift.getOpenedAt())
            .closedAt(shift.getClosedAt())
            .build();
    }
}
