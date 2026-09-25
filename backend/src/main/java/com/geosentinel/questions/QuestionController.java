package com.geosentinel.questions;

import com.geosentinel.client.AiServiceClient;
import com.geosentinel.common.ApiResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.*;

@RestController
@RequestMapping("/api/v1/sessions/{sessionId}/questions")
public class QuestionController {

    private final QuestionRepository questionRepository;
    private final AiServiceClient aiServiceClient;

    public QuestionController(QuestionRepository questionRepository,
                              AiServiceClient aiServiceClient) {
        this.questionRepository = questionRepository;
        this.aiServiceClient = aiServiceClient;
    }

    @PostMapping
    public ResponseEntity<ApiResponse<Map<String, Object>>> submitQuestion(
            @PathVariable String sessionId,
            @RequestBody Map<String, Object> requestPayload) {

        String questionText = (String) requestPayload.get("question");
        if (questionText == null || questionText.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Question text is required"));
        }

        String questionId = "q_" + UUID.randomUUID().toString().replace("-", "").substring(0, 10);
        String horizon = (String) requestPayload.getOrDefault("timeHorizon", "30d");

        Question question = Question.builder()
                .id(questionId)
                .sessionId(sessionId)
                .questionText(questionText)
                .requestedTimeRange(horizon)
                .createdAt(Instant.now())
                .build();

        questionRepository.save(question);

        // Forward to AI Multi-Agent Pipeline
        Map<String, Object> aiRequest = new HashMap<>();
        aiRequest.put("session_id", sessionId);
        aiRequest.put("question", questionText);
        aiRequest.put("time_horizon", horizon);
        aiRequest.put("geographies", requestPayload.getOrDefault("geographies", Arrays.asList("IND", "IRN", "USA")));
        aiRequest.put("include_categories", requestPayload.getOrDefault("includeCategories", Arrays.asList("economic", "scientific", "international")));

        try {
            Map<String, Object> aiResult = aiServiceClient.executePipeline(aiRequest);
            return ResponseEntity.ok(ApiResponse.success("Pipeline executed successfully", aiResult));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(ApiResponse.error("AI Pipeline failed: " + e.getMessage()));
        }
    }
}
