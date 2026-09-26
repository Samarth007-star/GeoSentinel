package com.geosentinel.news;

import jakarta.persistence.*;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "news")
public class News {

    @Id
    @Column(length = 64)
    private String id;

    @Column(nullable = false, length = 512)
    private String title;

    @Column(name = "source_name", nullable = false)
    private String sourceName;

    @Column(nullable = false, length = 1024)
    private String url;

    @Column(name = "published_at")
    private Instant publishedAt;

    @Column(columnDefinition = "TEXT")
    private String summary;

    @Column(name = "created_at")
    private Instant createdAt = Instant.now();

    public News() {
        this.id = "news_" + UUID.randomUUID().toString().replace("-", "").substring(0, 12);
        this.createdAt = Instant.now();
    }

    public News(String title, String sourceName, String url, String summary) {
        this.id = "news_" + UUID.randomUUID().toString().replace("-", "").substring(0, 12);
        this.title = title;
        this.sourceName = sourceName;
        this.url = url;
        this.summary = summary;
        this.publishedAt = Instant.now();
        this.createdAt = Instant.now();
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getSourceName() {
        return sourceName;
    }

    public void setSourceName(String sourceName) {
        this.sourceName = sourceName;
    }

    public String getUrl() {
        return url;
    }

    public void setUrl(String url) {
        this.url = url;
    }

    public Instant getPublishedAt() {
        return publishedAt;
    }

    public void setPublishedAt(Instant publishedAt) {
        this.publishedAt = publishedAt;
    }

    public String getSummary() {
        return summary;
    }

    public void setSummary(String summary) {
        this.summary = summary;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }
}
