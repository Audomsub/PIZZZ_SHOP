package com.pizzzshop.pos.controller.auth;

import com.pizzzshop.pos.dto.request.LoginRequest;
import com.pizzzshop.pos.dto.response.ApiResponse;
import com.pizzzshop.pos.dto.response.AuthResponse;
import com.pizzzshop.pos.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<AuthResponse>> login(@Valid @RequestBody LoginRequest request) {
        AuthResponse response = authService.login(request);
        return ResponseEntity.ok(ApiResponse.ok("Login successful", response));
    }
}
