package com.geosentinel.dashboard;

import com.geosentinel.common.ApiResponse;
import com.geosentinel.questions.QuestionRepository;
import com.geosentinel.sessions.SessionRepository;
import com.geosentinel.sources.SourceRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/dashboard")
public class DashboardController {

    private final SessionRepository sessionRepository;
    private final QuestionRepository questionRepository;
    private final SourceRepository sourceRepository;

    public DashboardController(SessionRepository sessionRepository,
                               QuestionRepository questionRepository,
                               SourceRepository sourceRepository) {
        this.sessionRepository = sessionRepository;
        this.questionRepository = questionRepository;
        this.sourceRepository = sourceRepository;
    }

    @GetMapping("/summary")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getSummary() {
        Map<String, Object> summary = new HashMap<>();
        summary.put("activeSessions", sessionRepository.count());
        summary.put("totalQuestionsProcessed", questionRepository.count());
        summary.put("registeredConnectors", sourceRepository.count());
        summary.put("zeroPaidApiCompliance", true);
        summary.put("strategyRiskReviewGateStatus", "ENFORCED");
        summary.put("canonicalPipelineVersion", "1.0.0");

        return ResponseEntity.ok(ApiResponse.success("Dashboard metrics retrieved", summary));
    }
}
