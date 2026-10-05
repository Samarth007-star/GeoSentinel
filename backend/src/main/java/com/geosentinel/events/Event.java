package com.geosentinel.events;

import jakarta.persistence.*;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "events")
public class Event {

    @Id
    @Column(length = 64)
    private String id;

    @Column(nullable = false, length = 512)
    private String title;

    @Column(name = "event_type", nullable = false, length = 64)
    private String eventType;

    @Column(name = "start_time")
    private Instant startTime;

    @Column(name = "end_time")
    private Instant endTime;

    @Column(length = 32)
    private String status = "ACTIVE";

    @Column(length = 64)
    private String geography;

    @Column(name = "created_at")
    private Instant createdAt = Instant.now();

    public Event() {
        this.id = "evt_" + UUID.randomUUID().toString().replace("-", "").substring(0, 12);
        this.createdAt = Instant.now();
    }

    public Event(String title, String eventType, String geography) {
        this.id = "evt_" + UUID.randomUUID().toString().replace("-", "").substring(0, 12);
        this.title = title;
        this.eventType = eventType;
        this.geography = geography;
        this.status = "ACTIVE";
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

    public String getEventType() {
        return eventType;
    }

    public void setEventType(String eventType) {
        this.eventType = eventType;
    }

    public Instant getStartTime() {
        return startTime;
    }

    public void setStartTime(Instant startTime) {
        this.startTime = startTime;
    }

    public Instant getEndTime() {
        return endTime;
    }

    public void setEndTime(Instant endTime) {
        this.endTime = endTime;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getGeography() {
        return geography;
    }

    public void setGeography(String geography) {
        this.geography = geography;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }
}
