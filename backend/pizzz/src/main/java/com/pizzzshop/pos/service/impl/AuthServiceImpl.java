package com.pizzzshop.pos.service.impl;

import com.pizzzshop.pos.dto.request.LoginRequest;
import com.pizzzshop.pos.dto.response.AuthResponse;
import com.pizzzshop.pos.entity.User;
import com.pizzzshop.pos.repository.UserRepository;
import com.pizzzshop.pos.security.JwtTokenProvider;
import com.pizzzshop.pos.service.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider tokenProvider;
    private final UserRepository userRepository;

    @Override
    public AuthResponse login(LoginRequest request) {
        Authentication authentication = authenticationManager.authenticate(
            new UsernamePasswordAuthenticationToken(request.getUsername(), request.getPassword())
        );

        UserDetails userDetails = (UserDetails) authentication.getPrincipal();
        String token = tokenProvider.generateToken(userDetails);

        User user = userRepository.findByUsername(request.getUsername()).orElseThrow();

        return AuthResponse.builder()
            .token(token)
            .tokenType("Bearer")
            .userId(user.getId())
            .username(user.getUsername())
            .firstName(user.getFirstName())
            .lastName(user.getLastName())
            .role(user.getRole().getName().name())
            .branchId(user.getBranch() != null ? user.getBranch().getId() : null)
            .branchName(user.getBranch() != null ? user.getBranch().getName() : null)
            .build();
    }
}
