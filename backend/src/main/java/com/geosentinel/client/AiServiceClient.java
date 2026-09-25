package com.geosentinel.client;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.Map;

@Service
public class AiServiceClient {

    private final RestTemplate restTemplate;
    private final String aiServiceBaseUrl;
    private final String internalServiceKey;

    public AiServiceClient(
            @Value("${geosentinel.ai-service.base-url:http://localhost:8000}") String aiServiceBaseUrl,
            @Value("${geosentinel.security.internal-service-key:geosentinel-internal-secret-token-2026}") String internalServiceKey) {
        this.restTemplate = new RestTemplate();
        this.aiServiceBaseUrl = aiServiceBaseUrl;
        this.internalServiceKey = internalServiceKey;
    }

    public Map<String, Object> executePipeline(Map<String, Object> requestPayload) {
        String url = aiServiceBaseUrl + "/api/v1/pipeline/execute";
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set("X-Internal-Service-Key", internalServiceKey);

        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestPayload, headers);
        ResponseEntity<Map> response = restTemplate.postForEntity(url, entity, Map.class);
        return response.getBody();
    }
}
