package com.geosentinel.sessions;

import jakarta.persistence.*;
import java.time.Instant;
import java.time.temporal.ChronoUnit;

@Entity
@Table(name = "sessions")
public class Session {

    @Id
    @Column(length = 64)
    private String id;

    @Column(name = "user_id", length = 64)
    private String userId;

    private String title;

    @Column(name = "topic_fingerprint")
    private String topicFingerprint;

    @Column(length = 32)
    private String status = "ACTIVE";

    @Column(name = "created_at", updatable = false)
    private Instant createdAt = Instant.now();

    @Column(name = "last_activity_at")
    private Instant lastActivityAt = Instant.now();

    @Column(name = "expires_at", nullable = false)
    private Instant expiresAt = Instant.now().plus(120, ChronoUnit.MINUTES);

    public Session() {}

    public Session(String id, String userId, String title, String topicFingerprint, String status, Instant createdAt, Instant lastActivityAt, Instant expiresAt) {
        this.id = id;
        this.userId = userId;
        this.title = title;
        this.topicFingerprint = topicFingerprint;
        this.status = (status != null) ? status : "ACTIVE";
        this.createdAt = (createdAt != null) ? createdAt : Instant.now();
        this.lastActivityAt = (lastActivityAt != null) ? lastActivityAt : Instant.now();
        this.expiresAt = (expiresAt != null) ? expiresAt : Instant.now().plus(120, ChronoUnit.MINUTES);
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getTopicFingerprint() { return topicFingerprint; }
    public void setTopicFingerprint(String topicFingerprint) { this.topicFingerprint = topicFingerprint; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }

    public Instant getLastActivityAt() { return lastActivityAt; }
    public void setLastActivityAt(Instant lastActivityAt) { this.lastActivityAt = lastActivityAt; }

    public Instant getExpiresAt() { return expiresAt; }
    public void setExpiresAt(Instant expiresAt) { this.expiresAt = expiresAt; }

    public static Builder builder() { return new Builder(); }

    public static class Builder {
        private String id;
        private String userId;
        private String title;
        private String topicFingerprint;
        private String status = "ACTIVE";
        private Instant createdAt = Instant.now();
        private Instant lastActivityAt = Instant.now();
        private Instant expiresAt = Instant.now().plus(120, ChronoUnit.MINUTES);

        public Builder id(String id) { this.id = id; return this; }
        public Builder userId(String userId) { this.userId = userId; return this; }
        public Builder title(String title) { this.title = title; return this; }
        public Builder topicFingerprint(String topicFingerprint) { this.topicFingerprint = topicFingerprint; return this; }
        public Builder status(String status) { this.status = status; return this; }
        public Builder createdAt(Instant createdAt) { this.createdAt = createdAt; return this; }
        public Builder lastActivityAt(Instant lastActivityAt) { this.lastActivityAt = lastActivityAt; return this; }
        public Builder expiresAt(Instant expiresAt) { this.expiresAt = expiresAt; return this; }
        public Session build() {
            return new Session(id, userId, title, topicFingerprint, status, createdAt, lastActivityAt, expiresAt);
        }
    }
}
