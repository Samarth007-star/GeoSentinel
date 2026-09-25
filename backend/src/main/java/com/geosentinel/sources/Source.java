package com.geosentinel.sources;

import jakarta.persistence.*;

import java.time.Instant;

@Entity
@Table(name = "sources")
public class Source {

    @Id
    @Column(length = 64)
    private String id;

    @Column(name = "source_key", unique = true, nullable = false, length = 64)
    private String sourceKey;

    @Column(nullable = false, length = 64)
    private String category;

    @Column(nullable = false)
    private String provider;

    @Column(name = "terms_url", nullable = false, length = 512)
    private String termsUrl;

    @Column(nullable = false, length = 64)
    private String license;

    private String attribution;

    @Column(name = "approved_use", length = 64)
    private String approvedUse = "RESEARCH_AI_PERMITTED";

    @Column(length = 32)
    private String status = "ACTIVE";

    @Column(name = "terms_reviewed_at")
    private Instant termsReviewedAt = Instant.now();

    public Source() {
    }

    public Source(String id, String sourceKey, String category, String provider, String termsUrl,
                  String license, String attribution, String approvedUse, String status, Instant termsReviewedAt) {
        this.id = id;
        this.sourceKey = sourceKey;
        this.category = category;
        this.provider = provider;
        this.termsUrl = termsUrl;
        this.license = license;
        this.attribution = attribution;
        this.approvedUse = approvedUse != null ? approvedUse : "RESEARCH_AI_PERMITTED";
        this.status = status != null ? status : "ACTIVE";
        this.termsReviewedAt = termsReviewedAt != null ? termsReviewedAt : Instant.now();
    }

    public static SourceBuilder builder() {
        return new SourceBuilder();
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getSourceKey() {
        return sourceKey;
    }

    public void setSourceKey(String sourceKey) {
        this.sourceKey = sourceKey;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public String getProvider() {
        return provider;
    }

    public void setProvider(String provider) {
        this.provider = provider;
    }

    public String getTermsUrl() {
        return termsUrl;
    }

    public void setTermsUrl(String termsUrl) {
        this.termsUrl = termsUrl;
    }

    public String getLicense() {
        return license;
    }

    public void setLicense(String license) {
        this.license = license;
    }

    public String getAttribution() {
        return attribution;
    }

    public void setAttribution(String attribution) {
        this.attribution = attribution;
    }

    public String getApprovedUse() {
        return approvedUse;
    }

    public void setApprovedUse(String approvedUse) {
        this.approvedUse = approvedUse;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public Instant getTermsReviewedAt() {
        return termsReviewedAt;
    }

    public void setTermsReviewedAt(Instant termsReviewedAt) {
        this.termsReviewedAt = termsReviewedAt;
    }

    public static class SourceBuilder {
        private String id;
        private String sourceKey;
        private String category;
        private String provider;
        private String termsUrl;
        private String license;
        private String attribution;
        private String approvedUse = "RESEARCH_AI_PERMITTED";
        private String status = "ACTIVE";
        private Instant termsReviewedAt = Instant.now();

        SourceBuilder() {
        }

        public SourceBuilder id(String id) {
            this.id = id;
            return this;
        }

        public SourceBuilder sourceKey(String sourceKey) {
            this.sourceKey = sourceKey;
            return this;
        }

        public SourceBuilder category(String category) {
            this.category = category;
            return this;
        }

        public SourceBuilder provider(String provider) {
            this.provider = provider;
            return this;
        }

        public SourceBuilder termsUrl(String termsUrl) {
            this.termsUrl = termsUrl;
            return this;
        }

        public SourceBuilder license(String license) {
            this.license = license;
            return this;
        }

        public SourceBuilder attribution(String attribution) {
            this.attribution = attribution;
            return this;
        }

        public SourceBuilder approvedUse(String approvedUse) {
            this.approvedUse = approvedUse;
            return this;
        }

        public SourceBuilder status(String status) {
            this.status = status;
            return this;
        }

        public SourceBuilder termsReviewedAt(Instant termsReviewedAt) {
            this.termsReviewedAt = termsReviewedAt;
            return this;
        }

        public Source build() {
            return new Source(id, sourceKey, category, provider, termsUrl, license, attribution, approvedUse, status, termsReviewedAt);
        }
    }
}
