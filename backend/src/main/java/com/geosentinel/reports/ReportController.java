package com.geosentinel.reports;

import com.geosentinel.common.ApiResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/reports")
public class ReportController {

    private final ReportRepository reportRepository;

    public ReportController(ReportRepository reportRepository) {
        this.reportRepository = reportRepository;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<Report>>> getAllReports(
            @RequestParam(required = false) String userId,
            @RequestParam(required = false) String analysisRunId) {
        if (userId != null && !userId.isBlank()) {
            return ResponseEntity.ok(ApiResponse.success(reportRepository.findByUserId(userId)));
        }
        if (analysisRunId != null && !analysisRunId.isBlank()) {
            return ResponseEntity.ok(ApiResponse.success(reportRepository.findByAnalysisRunId(analysisRunId)));
        }
        return ResponseEntity.ok(ApiResponse.success(reportRepository.findAll()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<Report>> getReportById(@PathVariable String id) {
        return reportRepository.findById(id)
                .map(r -> ResponseEntity.ok(ApiResponse.success(r)))
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<ApiResponse<Report>> createReport(@RequestBody Report report) {
        Report saved = reportRepository.save(report);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success(saved));
    }
}
