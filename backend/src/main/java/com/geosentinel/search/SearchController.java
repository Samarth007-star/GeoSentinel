package com.geosentinel.search;

import com.geosentinel.common.ApiResponse;
import com.geosentinel.events.Event;
import com.geosentinel.events.EventRepository;
import com.geosentinel.evidence.Evidence;
import com.geosentinel.evidence.EvidenceRepository;
import com.geosentinel.news.News;
import com.geosentinel.news.NewsRepository;
import com.geosentinel.organizations.Organization;
import com.geosentinel.organizations.OrganizationRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/search")
public class SearchController {

    private final EventRepository eventRepository;
    private final NewsRepository newsRepository;
    private final EvidenceRepository evidenceRepository;
    private final OrganizationRepository organizationRepository;

    public SearchController(EventRepository eventRepository,
                            NewsRepository newsRepository,
                            EvidenceRepository evidenceRepository,
                            OrganizationRepository organizationRepository) {
        this.eventRepository = eventRepository;
        this.newsRepository = newsRepository;
        this.evidenceRepository = evidenceRepository;
        this.organizationRepository = organizationRepository;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<Map<String, Object>>> globalSearch(@RequestParam(defaultValue = "") String q) {
        Map<String, Object> results = new HashMap<>();
        if (q.isBlank()) {
            results.put("query", "");
            results.put("events", List.of());
            results.put("news", List.of());
            results.put("evidence", List.of());
            results.put("organizations", List.of());
            return ResponseEntity.ok(ApiResponse.success(results));
        }

        List<Event> events = eventRepository.findByTitleContainingIgnoreCase(q);
        List<News> news = newsRepository.findByTitleContainingIgnoreCase(q);
        List<Evidence> evidence = evidenceRepository.findByTitleContainingIgnoreCase(q);
        List<Organization> orgs = organizationRepository.findByNameContainingIgnoreCase(q);

        results.put("query", q);
        results.put("events", events);
        results.put("news", news);
        results.put("evidence", evidence);
        results.put("organizations", orgs);
        results.put("totalResults", events.size() + news.size() + evidence.size() + orgs.size());

        return ResponseEntity.ok(ApiResponse.success(results));
    }
}
