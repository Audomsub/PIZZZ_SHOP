package com.pizzzshop.pos.dto.response;

import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AuthResponse {
    private String token;
    private String tokenType;
    private Long userId;
    private String username;
    private String firstName;
    private String lastName;
    private String role;
    private Long branchId;
    private String branchName;
}
