package com.geosentinel.auth;

import com.geosentinel.common.ApiResponse;
import com.geosentinel.security.JwtTokenProvider;
import com.geosentinel.users.Role;
import com.geosentinel.users.RoleRepository;
import com.geosentinel.users.User;
import com.geosentinel.users.UserRepository;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/auth")
public class AuthController {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;

    public AuthController(UserRepository userRepository,
                          RoleRepository roleRepository,
                          PasswordEncoder passwordEncoder,
                          JwtTokenProvider jwtTokenProvider) {
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtTokenProvider = jwtTokenProvider;
    }

    @PostMapping("/register")
    public ResponseEntity<ApiResponse<AuthDto.AuthResponse>> register(@Valid @RequestBody AuthDto.RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Email is already registered."));
        }

        Role analystRole = roleRepository.findByRoleKey("ROLE_ANALYST")
                .orElseGet(() -> roleRepository.save(Role.builder()
                        .id("role_analyst")
                        .roleKey("ROLE_ANALYST")
                        .description("Geopolitical Analyst")
                        .build()));

        User user = User.builder()
                .id("usr_" + UUID.randomUUID().toString().replace("-", "").substring(0, 12))
                .email(request.getEmail())
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .displayName(request.getDisplayName() != null ? request.getDisplayName() : "Analyst")
                .status("ACTIVE")
                .roles(new HashSet<>(Collections.singletonList(analystRole)))
                .build();

        userRepository.save(user);

        List<String> roles = user.getRoles().stream().map(Role::getRoleKey).collect(Collectors.toList());
        String token = jwtTokenProvider.generateToken(user.getId(), user.getEmail(), roles);

        AuthDto.AuthResponse authResponse = AuthDto.AuthResponse.builder()
                .token(token)
                .userId(user.getId())
                .email(user.getEmail())
                .displayName(user.getDisplayName())
                .roles(roles)
                .build();

        return ResponseEntity.ok(ApiResponse.success("User registered successfully", authResponse));
    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<AuthDto.AuthResponse>> login(@Valid @RequestBody AuthDto.LoginRequest request) {
        Optional<User> userOpt = userRepository.findByEmail(request.getEmail());
        if (userOpt.isEmpty() || !passwordEncoder.matches(request.getPassword(), userOpt.get().getPasswordHash())) {
            return ResponseEntity.status(401).body(ApiResponse.error("Invalid email or password."));
        }

        User user = userOpt.get();
        List<String> roles = user.getRoles().stream().map(Role::getRoleKey).collect(Collectors.toList());
        String token = jwtTokenProvider.generateToken(user.getId(), user.getEmail(), roles);

        AuthDto.AuthResponse authResponse = AuthDto.AuthResponse.builder()
                .token(token)
                .userId(user.getId())
                .email(user.getEmail())
                .displayName(user.getDisplayName())
                .roles(roles)
                .build();

        return ResponseEntity.ok(ApiResponse.success("Login successful", authResponse));
    }
}
