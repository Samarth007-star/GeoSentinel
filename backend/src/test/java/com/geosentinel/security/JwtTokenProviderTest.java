package com.geosentinel.security;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

class JwtTokenProviderTest {

    private JwtTokenProvider jwtTokenProvider;
    private final String secret = "404E635266556A586E3272357538782F413F4428472B4B6250645367566B5970";
    private final long expirationMs = 3600000; // 1 hour

    @BeforeEach
    void setUp() {
        jwtTokenProvider = new JwtTokenProvider(secret, expirationMs);
    }

    @Test
    @DisplayName("Should generate and validate valid JWT token for analyst")
    void shouldGenerateAndValidateValidToken() {
        String userId = "usr-analyst-001";
        String email = "analyst@geosentinel.internal";
        List<String> roles = List.of("ROLE_ANALYST");

        String token = jwtTokenProvider.generateToken(userId, email, roles);

        assertNotNull(token);
        assertTrue(jwtTokenProvider.validateToken(token));
        assertEquals(userId, jwtTokenProvider.getUserIdFromToken(token));
    }

    @Test
    @DisplayName("Should reject tampered JWT token")
    void shouldRejectTamperedToken() {
        String token = jwtTokenProvider.generateToken("usr-001", "user@test.org", List.of("ROLE_VIEWER"));
        String tamperedToken = token + "corrupted";

        assertFalse(jwtTokenProvider.validateToken(tamperedToken));
    }

    @Test
    @DisplayName("Should reject invalid or malformed tokens")
    void shouldRejectMalformedToken() {
        assertFalse(jwtTokenProvider.validateToken("not-a-valid-jwt"));
        assertFalse(jwtTokenProvider.validateToken(""));
    }
}
