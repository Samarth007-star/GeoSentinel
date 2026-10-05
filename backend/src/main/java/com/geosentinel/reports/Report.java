package com.geosentinel.reports;

import jakarta.persistence.*;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "reports")
public class Report {

    @Id
    @Column(length = 64)
    private String id;

    @Column(name = "analysis_run_id", nullable = false, length = 64)
    private String analysisRunId;

    @Column(name = "user_id", length = 64)
    private String userId;

    @Column(nullable = false)
    private String title;

    @Column(length = 16)
    private String format = "PDF";

    @Column(name = "file_reference", length = 512)
    private String fileReference;

    @Column(name = "created_at")
    private Instant createdAt = Instant.now();

    @Column(name = "expires_at")
    private Instant expiresAt;

    public Report() {
        this.id = "rpt_" + UUID.randomUUID().toString().replace("-", "").substring(0, 12);
        this.createdAt = Instant.now();
    }

    public Report(String analysisRunId, String userId, String title, String format) {
        this.id = "rpt_" + UUID.randomUUID().toString().replace("-", "").substring(0, 12);
        this.analysisRunId = analysisRunId;
        this.userId = userId;
        this.title = title;
        this.format = format != null ? format : "PDF";
        this.createdAt = Instant.now();
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getAnalysisRunId() {
        return analysisRunId;
    }

    public void setAnalysisRunId(String analysisRunId) {
        this.analysisRunId = analysisRunId;
    }

    public String getUserId() {
        return userId;
    }

    public void setUserId(String userId) {
        this.userId = userId;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getFormat() {
        return format;
    }

    public void setFormat(String format) {
        this.format = format;
    }

    public String getFileReference() {
        return fileReference;
    }

    public void setFileReference(String fileReference) {
        this.fileReference = fileReference;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }

    public Instant getExpiresAt() {
        return expiresAt;
    }

    public void setExpiresAt(Instant expiresAt) {
        this.expiresAt = expiresAt;
    }
}
