package com.pizzzshop.pos.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "time_clocks")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TimeClock {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;

    @Builder.Default
    @Column(name = "clock_in", nullable = false)
    private LocalDateTime clockIn = LocalDateTime.now();

    @Column(name = "clock_out")
    private LocalDateTime clockOut;
}
