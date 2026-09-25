package com.geosentinel.questions;

import com.geosentinel.client.AiServiceClient;
import com.geosentinel.common.ApiResponse;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.http.ResponseEntity;

import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class QuestionControllerTest {

    private QuestionRepository questionRepository;
    private AiServiceClient aiServiceClient;
    private QuestionController questionController;

    @BeforeEach
    void setUp() {
        questionRepository = Mockito.mock(QuestionRepository.class);

        aiServiceClient = new AiServiceClient("http://dummy", "secret") {
            @Override
            public Map<String, Object> executePipeline(Map<String, Object> requestPayload) {
                Map<String, Object> mockAiResult = new HashMap<>();
                mockAiResult.put("status", "COMPLETED");
                mockAiResult.put("analysis_run_id", "run_123");
                return mockAiResult;
            }
        };

        questionController = new QuestionController(questionRepository, aiServiceClient);
    }

    @Test
    @DisplayName("Should validate required question text")
    void shouldRejectEmptyQuestion() {
        Map<String, Object> req = new HashMap<>();
        req.put("question", "");

        ResponseEntity<ApiResponse<Map<String, Object>>> response = questionController.submitQuestion("ses_123", req);

        assertNotNull(response);
        assertEquals(400, response.getStatusCode().value());
        assertFalse(response.getBody().isSuccess());
        assertEquals("Question text is required", response.getBody().getMessage());
    }

    @Test
    @DisplayName("Should successfully delegate question to AI pipeline client")
    void shouldSubmitQuestionAndForwardToAiService() {
        when(questionRepository.save(any(Question.class))).thenAnswer(inv -> inv.getArgument(0));

        Map<String, Object> req = new HashMap<>();
        req.put("question", "What could be the effects on India if US-Iran tensions escalate?");
        req.put("timeHorizon", "60d");

        ResponseEntity<ApiResponse<Map<String, Object>>> response = questionController.submitQuestion("ses_123", req);

        assertNotNull(response);
        assertEquals(200, response.getStatusCode().value());
        assertTrue(response.getBody().isSuccess());
        assertEquals("COMPLETED", response.getBody().getData().get("status"));
        verify(questionRepository).save(any(Question.class));
    }
}
