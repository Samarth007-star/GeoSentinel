package com.geosentinel.sources;

import com.geosentinel.common.ApiResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/sources")
public class SourceController {

    private final SourceRepository sourceRepository;

    public SourceController(SourceRepository sourceRepository) {
        this.sourceRepository = sourceRepository;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<Source>>> getAllSources() {
        return ResponseEntity.ok(ApiResponse.success(sourceRepository.findAll()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<Source>> getSourceById(@PathVariable String id) {
        return sourceRepository.findById(id)
                .map(source -> ResponseEntity.ok(ApiResponse.success(source)))
                .orElse(ResponseEntity.notFound().build());
    }
}
