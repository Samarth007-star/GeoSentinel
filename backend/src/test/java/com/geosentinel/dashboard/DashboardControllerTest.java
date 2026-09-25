package com.geosentinel.dashboard;

import com.geosentinel.common.ApiResponse;
import com.geosentinel.questions.QuestionRepository;
import com.geosentinel.sessions.SessionRepository;
import com.geosentinel.sources.SourceRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.http.ResponseEntity;

import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.when;

class DashboardControllerTest {

    private SessionRepository sessionRepository;
    private QuestionRepository questionRepository;
    private SourceRepository sourceRepository;
    private DashboardController dashboardController;

    @BeforeEach
    void setUp() {
        sessionRepository = Mockito.mock(SessionRepository.class);
        questionRepository = Mockito.mock(QuestionRepository.class);
        sourceRepository = Mockito.mock(SourceRepository.class);
        dashboardController = new DashboardController(sessionRepository, questionRepository, sourceRepository);
    }

    @Test
    @DisplayName("Should return system metrics summary with mandatory compliance flags")
    void shouldReturnDashboardSummary() {
        when(sessionRepository.count()).thenReturn(3L);
        when(questionRepository.count()).thenReturn(15L);
        when(sourceRepository.count()).thenReturn(4L);

        ResponseEntity<ApiResponse<Map<String, Object>>> response = dashboardController.getSummary();

        assertNotNull(response);
        assertEquals(200, response.getStatusCode().value());
        assertTrue(response.getBody().isSuccess());

        Map<String, Object> data = response.getBody().getData();
        assertEquals(3L, data.get("activeSessions"));
        assertEquals(15L, data.get("totalQuestionsProcessed"));
        assertEquals(4L, data.get("registeredConnectors"));
        assertEquals(Boolean.TRUE, data.get("zeroPaidApiCompliance"));
        assertEquals("ENFORCED", data.get("strategyRiskReviewGateStatus"));
        assertEquals("1.0.0", data.get("canonicalPipelineVersion"));
    }
}
