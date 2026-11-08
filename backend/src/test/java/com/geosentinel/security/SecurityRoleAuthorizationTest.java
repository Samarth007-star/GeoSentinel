package com.geosentinel.security;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.security.core.authority.SimpleGrantedAuthority;

import java.util.Arrays;
import java.util.Collections;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

class SecurityRoleAuthorizationTest {

    private JwtTokenProvider jwtTokenProvider;
    private final String secret = "404E635266556A586E3272357538782F413F4428472B4B6250645367566B5970";
    private final long expirationMs = 3600000;

    @BeforeEach
    void setUp() {
        jwtTokenProvider = new JwtTokenProvider(secret, expirationMs);
    }

    @Test
    @DisplayName("ROLE_ADMIN: Token generation and role extraction must return ROLE_ADMIN")
    void testAdminRoleExtraction() {
        String token = jwtTokenProvider.generateToken("usr_admin_001", "admin@geosentinel.org", List.of("ROLE_ADMIN"));
        assertNotNull(token);
        assertTrue(jwtTokenProvider.validateToken(token));
        assertEquals("usr_admin_001", jwtTokenProvider.getUserIdFromToken(token));

        List<String> extractedRoles = jwtTokenProvider.getRolesFromToken(token);
        assertEquals(1, extractedRoles.size());
        assertTrue(extractedRoles.contains("ROLE_ADMIN"));
        assertFalse(extractedRoles.contains("ROLE_VIEWER"));
    }

    @Test
    @DisplayName("ROLE_ANALYST: Token generation and role extraction must return ROLE_ANALYST")
    void testAnalystRoleExtraction() {
        String token = jwtTokenProvider.generateToken("usr_analyst_001", "analyst@geosentinel.org", List.of("ROLE_ANALYST"));
        assertNotNull(token);
        assertTrue(jwtTokenProvider.validateToken(token));

        List<String> extractedRoles = jwtTokenProvider.getRolesFromToken(token);
        assertEquals(1, extractedRoles.size());
        assertTrue(extractedRoles.contains("ROLE_ANALYST"));
        assertFalse(extractedRoles.contains("ROLE_ADMIN"));
    }

    @Test
    @DisplayName("ROLE_VIEWER: Token generation and role extraction must return ROLE_VIEWER")
    void testViewerRoleExtraction() {
        String token = jwtTokenProvider.generateToken("usr_viewer_001", "viewer@geosentinel.org", List.of("ROLE_VIEWER"));
        assertNotNull(token);
        assertTrue(jwtTokenProvider.validateToken(token));

        List<String> extractedRoles = jwtTokenProvider.getRolesFromToken(token);
        assertEquals(1, extractedRoles.size());
        assertTrue(extractedRoles.contains("ROLE_VIEWER"));
        assertFalse(extractedRoles.contains("ROLE_ADMIN"));
        assertFalse(extractedRoles.contains("ROLE_ANALYST"));
    }

    @Test
    @DisplayName("Multi-role token: Should extract multiple roles accurately")
    void testMultiRoleExtraction() {
        String token = jwtTokenProvider.generateToken("usr_super_001", "super@geosentinel.org", Arrays.asList("ROLE_ADMIN", "ROLE_ANALYST"));
        List<String> extractedRoles = jwtTokenProvider.getRolesFromToken(token);
        assertEquals(2, extractedRoles.size());
        assertTrue(extractedRoles.contains("ROLE_ADMIN"));
        assertTrue(extractedRoles.contains("ROLE_ANALYST"));
    }

    @Test
    @DisplayName("Empty or corrupted token: Should return empty roles list safely without exception")
    void testCorruptedTokenRoles() {
        List<String> roles = jwtTokenProvider.getRolesFromToken("invalid.token.here");
        assertNotNull(roles);
        assertTrue(roles.isEmpty());
    }

    @Test
    @DisplayName("Role Authority mapping: Validates Spring Security GrantedAuthority mapping")
    void testAuthorityMapping() {
        List<String> roles = List.of("ROLE_ADMIN", "ROLE_ANALYST", "ROLE_VIEWER");
        List<SimpleGrantedAuthority> authorities = roles.stream()
                .map(SimpleGrantedAuthority::new)
                .toList();

        assertEquals(3, authorities.size());
        assertTrue(authorities.contains(new SimpleGrantedAuthority("ROLE_ADMIN")));
        assertTrue(authorities.contains(new SimpleGrantedAuthority("ROLE_ANALYST")));
        assertTrue(authorities.contains(new SimpleGrantedAuthority("ROLE_VIEWER")));
    }
}
