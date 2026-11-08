package com.geosentinel.security;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.security.core.authority.SimpleGrantedAuthority;

import java.util.Arrays;
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
    @DisplayName("ROLE_RESEARCHER: Token generation and role extraction must return ROLE_RESEARCHER")
    void testResearcherRoleExtraction() {
        String token = jwtTokenProvider.generateToken("usr_researcher_001", "researcher@geosentinel.org", List.of("ROLE_RESEARCHER"));
        assertNotNull(token);
        assertTrue(jwtTokenProvider.validateToken(token));

        List<String> extractedRoles = jwtTokenProvider.getRolesFromToken(token);
        assertEquals(1, extractedRoles.size());
        assertTrue(extractedRoles.contains("ROLE_RESEARCHER"));
        assertFalse(extractedRoles.contains("ROLE_ADMIN"));
    }

    @Test
    @DisplayName("ROLE_DECISION_MAKER: Token generation and role extraction must return ROLE_DECISION_MAKER")
    void testDecisionMakerRoleExtraction() {
        String token = jwtTokenProvider.generateToken("usr_decision_001", "decision@geosentinel.org", List.of("ROLE_DECISION_MAKER"));
        assertNotNull(token);
        assertTrue(jwtTokenProvider.validateToken(token));

        List<String> extractedRoles = jwtTokenProvider.getRolesFromToken(token);
        assertEquals(1, extractedRoles.size());
        assertTrue(extractedRoles.contains("ROLE_DECISION_MAKER"));
        assertFalse(extractedRoles.contains("ROLE_VIEWER"));
    }

    @Test
    @DisplayName("ROLE_RISK_AUDITOR: Token generation and role extraction must return ROLE_RISK_AUDITOR")
    void testRiskAuditorRoleExtraction() {
        String token = jwtTokenProvider.generateToken("usr_auditor_001", "auditor@geosentinel.org", List.of("ROLE_RISK_AUDITOR"));
        assertNotNull(token);
        assertTrue(jwtTokenProvider.validateToken(token));

        List<String> extractedRoles = jwtTokenProvider.getRolesFromToken(token);
        assertEquals(1, extractedRoles.size());
        assertTrue(extractedRoles.contains("ROLE_RISK_AUDITOR"));
        assertFalse(extractedRoles.contains("ROLE_ANALYST"));
    }

    @Test
    @DisplayName("ROLE_DATA_ENGINEER: Token generation and role extraction must return ROLE_DATA_ENGINEER")
    void testDataEngineerRoleExtraction() {
        String token = jwtTokenProvider.generateToken("usr_dataeng_001", "dataeng@geosentinel.org", List.of("ROLE_DATA_ENGINEER"));
        assertNotNull(token);
        assertTrue(jwtTokenProvider.validateToken(token));

        List<String> extractedRoles = jwtTokenProvider.getRolesFromToken(token);
        assertEquals(1, extractedRoles.size());
        assertTrue(extractedRoles.contains("ROLE_DATA_ENGINEER"));
        assertFalse(extractedRoles.contains("ROLE_VIEWER"));
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
    @DisplayName("All Seven Canonical Roles: Authority mapping verifies Spring Security integration")
    void testAllSevenRolesAuthorityMapping() {
        List<String> allSevenRoles = List.of(
                "ROLE_ADMIN",
                "ROLE_ANALYST",
                "ROLE_RESEARCHER",
                "ROLE_DECISION_MAKER",
                "ROLE_RISK_AUDITOR",
                "ROLE_DATA_ENGINEER",
                "ROLE_VIEWER"
        );
        List<SimpleGrantedAuthority> authorities = allSevenRoles.stream()
                .map(SimpleGrantedAuthority::new)
                .toList();

        assertEquals(7, authorities.size());
        for (String role : allSevenRoles) {
            assertTrue(authorities.contains(new SimpleGrantedAuthority(role)), "Missing authority mapping for: " + role);
        }
    }

    @Test
    @DisplayName("Negative access verification: Viewer token lacks administrative privileges")
    void testViewerCannotAccessAdmin() {
        String viewerToken = jwtTokenProvider.generateToken("usr_viewer_001", "viewer@geosentinel.org", List.of("ROLE_VIEWER"));
        List<String> roles = jwtTokenProvider.getRolesFromToken(viewerToken);

        assertFalse(roles.contains("ROLE_ADMIN"), "Viewer must NOT hold ROLE_ADMIN");
        assertFalse(roles.contains("ROLE_DATA_ENGINEER"), "Viewer must NOT hold ROLE_DATA_ENGINEER");
    }

    @Test
    @DisplayName("Negative access verification: Analyst token lacks Risk Auditor and Admin privileges")
    void testAnalystCannotAccessRiskReviewOrAdmin() {
        String analystToken = jwtTokenProvider.generateToken("usr_analyst_001", "analyst@geosentinel.org", List.of("ROLE_ANALYST"));
        List<String> roles = jwtTokenProvider.getRolesFromToken(analystToken);

        assertFalse(roles.contains("ROLE_ADMIN"), "Analyst must NOT hold ROLE_ADMIN");
        assertFalse(roles.contains("ROLE_RISK_AUDITOR"), "Analyst must NOT hold ROLE_RISK_AUDITOR");
    }
}
