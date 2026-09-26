package com.geosentinel.evidence;

import jakarta.persistence.*;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "evidence")
public class Evidence {

    @Id
    @Column(length = 64)
    private String id;

    @Column(name = "source_id", nullable = false, length = 64)
    private String sourceId;

    @Column(name = "source_record_id")
    private String sourceRecordId;

    @Column(name = "canonical_url", nullable = false, length = 1024)
    private String canonicalUrl;

    @Column(nullable = false, length = 512)
    private String title;

    @Column(name = "claim_text", nullable = false, columnDefinition = "TEXT")
    private String claimText;

    @Column(name = "evidence_type", length = 64)
    private String evidenceType;

    @Column(name = "published_at")
    private Instant publishedAt;

    @Column(name = "retrieved_at")
    private Instant retrievedAt = Instant.now();

    @Column(length = 64)
    private String geography;

    @Column(name = "content_hash", nullable = false, length = 64)
    private String contentHash;

    @Column(name = "verification_status", length = 32)
    private String verificationStatus = "UNVERIFIED";

    @Column(name = "verification_notes", columnDefinition = "TEXT")
    private String verificationNotes;

    @Column(name = "license_id", length = 64)
    private String licenseId;

    public Evidence() {
        this.id = "ev_" + UUID.randomUUID().toString().replace("-", "").substring(0, 12);
        this.retrievedAt = Instant.now();
    }

    public Evidence(String sourceId, String canonicalUrl, String title, String claimText, String contentHash) {
        this.id = "ev_" + UUID.randomUUID().toString().replace("-", "").substring(0, 12);
        this.sourceId = sourceId;
        this.canonicalUrl = canonicalUrl;
        this.title = title;
        this.claimText = claimText;
        this.contentHash = contentHash;
        this.verificationStatus = "UNVERIFIED";
        this.retrievedAt = Instant.now();
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getSourceId() {
        return sourceId;
    }

    public void setSourceId(String sourceId) {
        this.sourceId = sourceId;
    }

    public String getSourceRecordId() {
        return sourceRecordId;
    }

    public void setSourceRecordId(String sourceRecordId) {
        this.sourceRecordId = sourceRecordId;
    }

    public String getCanonicalUrl() {
        return canonicalUrl;
    }

    public void setCanonicalUrl(String canonicalUrl) {
        this.canonicalUrl = canonicalUrl;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getClaimText() {
        return claimText;
    }

    public void setClaimText(String claimText) {
        this.claimText = claimText;
    }

    public String getEvidenceType() {
        return evidenceType;
    }

    public void setEvidenceType(String evidenceType) {
        this.evidenceType = evidenceType;
    }

    public Instant getPublishedAt() {
        return publishedAt;
    }

    public void setPublishedAt(Instant publishedAt) {
        this.publishedAt = publishedAt;
    }

    public Instant getRetrievedAt() {
        return retrievedAt;
    }

    public void setRetrievedAt(Instant retrievedAt) {
        this.retrievedAt = retrievedAt;
    }

    public String getGeography() {
        return geography;
    }

    public void setGeography(String geography) {
        this.geography = geography;
    }

    public String getContentHash() {
        return contentHash;
    }

    public void setContentHash(String contentHash) {
        this.contentHash = contentHash;
    }

    public String getVerificationStatus() {
        return verificationStatus;
    }

    public void setVerificationStatus(String verificationStatus) {
        this.verificationStatus = verificationStatus;
    }

    public String getVerificationNotes() {
        return verificationNotes;
    }

    public void setVerificationNotes(String verificationNotes) {
        this.verificationNotes = verificationNotes;
    }

    public String getLicenseId() {
        return licenseId;
    }

    public void setLicenseId(String licenseId) {
        this.licenseId = licenseId;
    }
}
