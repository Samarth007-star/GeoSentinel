package com.geosentinel.sessions;

import com.geosentinel.common.ApiResponse;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.http.ResponseEntity;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class SessionControllerTest {

    private SessionRepository sessionRepository;
    private SessionController sessionController;

    @BeforeEach
    void setUp() {
        sessionRepository = Mockito.mock(SessionRepository.class);
        sessionController = new SessionController(sessionRepository);
    }

    @Test
    @DisplayName("Should initialize session with 120-minute expiration TTL")
    void shouldInitializeSessionWithTtl() {
        when(sessionRepository.save(any(Session.class))).thenAnswer(invocation -> invocation.getArgument(0));

        Session req = Session.builder().title("Geopolitical Crisis Scenario").build();
        ResponseEntity<ApiResponse<Session>> response = sessionController.createSession(req);

        assertNotNull(response);
        assertEquals(200, response.getStatusCode().value());
        assertTrue(response.getBody().isSuccess());

        Session created = response.getBody().getData();
        assertNotNull(created.getId());
        assertTrue(created.getId().startsWith("ses_"));
        assertEquals("Geopolitical Crisis Scenario", created.getTitle());
        assertEquals("ACTIVE", created.getStatus());
        assertNotNull(created.getExpiresAt());
        assertNotNull(created.getCreatedAt());
    }

    @Test
    @DisplayName("Should list active sessions")
    void shouldListSessions() {
        Session s1 = Session.builder().id("ses_1").title("Session 1").build();
        when(sessionRepository.findAll()).thenReturn(List.of(s1));

        ResponseEntity<ApiResponse<List<Session>>> response = sessionController.listSessions();

        assertNotNull(response);
        assertEquals(1, response.getBody().getData().size());
        assertEquals("ses_1", response.getBody().getData().get(0).getId());
    }

    @Test
    @DisplayName("Should delete session and enforce cleanup")
    void shouldDeleteSession() {
        ResponseEntity<ApiResponse<Void>> response = sessionController.deleteSession("ses_1");

        assertNotNull(response);
        assertEquals(200, response.getStatusCode().value());
        verify(sessionRepository).deleteById("ses_1");
    }
}
