package com.pizzzshop.pos.service;

import com.pizzzshop.pos.dto.request.LoginRequest;
import com.pizzzshop.pos.dto.response.AuthResponse;

public interface AuthService {
    AuthResponse login(LoginRequest request);
}
