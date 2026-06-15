package com.pizzzshop.pos.dto.response;

import com.pizzzshop.pos.constant.ShiftStatus;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CashShiftResponse {
    private Long id;
    private Long branchId;
    private String branchName;
    private Long userId;
    private String username;
    private BigDecimal startAmount;
    private BigDecimal endAmount;
    private BigDecimal actualAmount;
    private BigDecimal variance;
    private BigDecimal cashSales;
    private BigDecimal totalSales;
    private Long orderCount;
    private ShiftStatus status;
    private LocalDateTime openedAt;
    private LocalDateTime closedAt;
}
