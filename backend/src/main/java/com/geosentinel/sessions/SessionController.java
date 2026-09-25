package com.geosentinel.sessions;

import com.geosentinel.common.ApiResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/sessions")
public class SessionController {

    private final SessionRepository sessionRepository;

    public SessionController(SessionRepository sessionRepository) {
        this.sessionRepository = sessionRepository;
    }

    @PostMapping
    public ResponseEntity<ApiResponse<Session>> createSession(@RequestBody(required = false) Session request) {
        String title = (request != null && request.getTitle() != null) ? request.getTitle() : "Research Assessment Session";
        Session session = Session.builder()
                .id("ses_" + UUID.randomUUID().toString().replace("-", "").substring(0, 12))
                .title(title)
                .status("ACTIVE")
                .createdAt(Instant.now())
                .lastActivityAt(Instant.now())
                .expiresAt(Instant.now().plus(120, ChronoUnit.MINUTES))
                .build();

        sessionRepository.save(session);
        return ResponseEntity.ok(ApiResponse.success("Session initialized", session));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<Session>>> listSessions() {
        return ResponseEntity.ok(ApiResponse.success(sessionRepository.findAll()));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteSession(@PathVariable String id) {
        sessionRepository.deleteById(id);
        return ResponseEntity.ok(ApiResponse.success("Session and temporary context deleted", null));
    }
}
