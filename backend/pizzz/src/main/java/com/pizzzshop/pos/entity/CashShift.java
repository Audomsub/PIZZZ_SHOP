package com.pizzzshop.pos.entity;

import com.pizzzshop.pos.constant.ShiftStatus;
import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "cash_shifts")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CashShift {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "branch_id")
    private Branch branch;

    @Builder.Default
    @Column(name = "start_amount", nullable = false, precision = 10, scale = 2)
    private BigDecimal startAmount = BigDecimal.ZERO;

    @Column(name = "end_amount", precision = 10, scale = 2)
    private BigDecimal endAmount;

    @Column(name = "actual_amount", precision = 10, scale = 2)
    private BigDecimal actualAmount;

    @Builder.Default
    @Enumerated(EnumType.STRING)
    @Column(length = 20)
    private ShiftStatus status = ShiftStatus.OPEN;

    @Builder.Default
    @Column(name = "opened_at")
    private LocalDateTime openedAt = LocalDateTime.now();

    @Column(name = "closed_at")
    private LocalDateTime closedAt;
}
