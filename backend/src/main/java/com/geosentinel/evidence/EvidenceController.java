package com.geosentinel.evidence;

import com.geosentinel.common.ApiResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/evidence")
public class EvidenceController {

    private final EvidenceRepository evidenceRepository;

    public EvidenceController(EvidenceRepository evidenceRepository) {
        this.evidenceRepository = evidenceRepository;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<Evidence>>> getAllEvidence(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String geography,
            @RequestParam(required = false) String status) {
        if (search != null && !search.isBlank()) {
            return ResponseEntity.ok(ApiResponse.success(evidenceRepository.findByTitleContainingIgnoreCase(search)));
        }
        if (geography != null && !geography.isBlank()) {
            return ResponseEntity.ok(ApiResponse.success(evidenceRepository.findByGeographyIgnoreCase(geography)));
        }
        if (status != null && !status.isBlank()) {
            return ResponseEntity.ok(ApiResponse.success(evidenceRepository.findByVerificationStatus(status)));
        }
        return ResponseEntity.ok(ApiResponse.success(evidenceRepository.findAll()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<Evidence>> getEvidenceById(@PathVariable String id) {
        return evidenceRepository.findById(id)
                .map(e -> ResponseEntity.ok(ApiResponse.success(e)))
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<ApiResponse<Evidence>> createEvidence(@RequestBody Evidence evidence) {
        Evidence saved = evidenceRepository.save(evidence);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success(saved));
    }
}
