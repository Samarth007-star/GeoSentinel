package com.geosentinel.reports;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ReportRepository extends JpaRepository<Report, String> {
    List<Report> findByUserId(String userId);
    List<Report> findByAnalysisRunId(String analysisRunId);
}
