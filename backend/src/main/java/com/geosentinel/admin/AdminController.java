package com.geosentinel.admin;

import com.geosentinel.common.ApiResponse;
import com.geosentinel.questions.QuestionRepository;
import com.geosentinel.sessions.SessionRepository;
import com.geosentinel.sources.SourceRepository;
import com.geosentinel.users.User;
import com.geosentinel.users.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/admin")
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    private final UserRepository userRepository;
    private final SessionRepository sessionRepository;
    private final QuestionRepository questionRepository;
    private final SourceRepository sourceRepository;

    public AdminController(UserRepository userRepository,
                           SessionRepository sessionRepository,
                           QuestionRepository questionRepository,
                           SourceRepository sourceRepository) {
        this.userRepository = userRepository;
        this.sessionRepository = sessionRepository;
        this.questionRepository = questionRepository;
        this.sourceRepository = sourceRepository;
    }

    @GetMapping("/health")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getAdminHealth() {
        Map<String, Object> data = new HashMap<>();
        data.put("status", "UP");
        data.put("scope", "SYSTEM_ADMINISTRATION");
        data.put("enforcedRoles", Arrays.asList("ROLE_ADMIN", "ROLE_ANALYST", "ROLE_VIEWER"));
        data.put("timestamp", Instant.now().toString());
        return ResponseEntity.ok(ApiResponse.success("Admin system health verified", data));
    }

    @GetMapping("/system-stats")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getSystemStats() {
        Map<String, Object> stats = new HashMap<>();
        stats.put("totalUsers", userRepository.count());
        stats.put("totalSessions", sessionRepository.count());
        stats.put("totalQuestions", questionRepository.count());
        stats.put("registeredSources", sourceRepository.count());
        stats.put("rbacStatus", "STRICT_ENFORCEMENT");
        return ResponseEntity.ok(ApiResponse.success("System administration statistics", stats));
    }

    @GetMapping("/users")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> listUsers() {
        List<User> users = userRepository.findAll();
        List<Map<String, Object>> userDtos = users.stream().map(u -> {
            Map<String, Object> dto = new HashMap<>();
            dto.put("id", u.getId());
            dto.put("email", u.getEmail());
            dto.put("displayName", u.getDisplayName());
            dto.put("status", u.getStatus());
            dto.put("roles", u.getRoles().stream().map(r -> r.getRoleKey()).collect(Collectors.toList()));
            return dto;
        }).collect(Collectors.toList());
        return ResponseEntity.ok(ApiResponse.success("User registry", userDtos));
    }
}

