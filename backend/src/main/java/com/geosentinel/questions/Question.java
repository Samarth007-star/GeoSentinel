package com.geosentinel.questions;

import jakarta.persistence.*;

import java.time.Instant;

@Entity
@Table(name = "questions")
public class Question {

    @Id
    @Column(length = 64)
    private String id;

    @Column(name = "session_id", nullable = false, length = 64)
    private String sessionId;

    @Column(name = "question_text", nullable = false, columnDefinition = "TEXT")
    private String questionText;

    @Column(length = 64)
    private String intent;

    @Column(name = "requested_time_range", length = 64)
    private String requestedTimeRange;

    @Column(name = "created_at", updatable = false)
    private Instant createdAt = Instant.now();

    public Question() {
    }

    public Question(String id, String sessionId, String questionText, String intent, String requestedTimeRange, Instant createdAt) {
        this.id = id;
        this.sessionId = sessionId;
        this.questionText = questionText;
        this.intent = intent;
        this.requestedTimeRange = requestedTimeRange;
        this.createdAt = createdAt != null ? createdAt : Instant.now();
    }

    public static QuestionBuilder builder() {
        return new QuestionBuilder();
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getSessionId() {
        return sessionId;
    }

    public void setSessionId(String sessionId) {
        this.sessionId = sessionId;
    }

    public String getQuestionText() {
        return questionText;
    }

    public void setQuestionText(String questionText) {
        this.questionText = questionText;
    }

    public String getIntent() {
        return intent;
    }

    public void setIntent(String intent) {
        this.intent = intent;
    }

    public String getRequestedTimeRange() {
        return requestedTimeRange;
    }

    public void setRequestedTimeRange(String requestedTimeRange) {
        this.requestedTimeRange = requestedTimeRange;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }

    public static class QuestionBuilder {
        private String id;
        private String sessionId;
        private String questionText;
        private String intent;
        private String requestedTimeRange;
        private Instant createdAt = Instant.now();

        QuestionBuilder() {
        }

        public QuestionBuilder id(String id) {
            this.id = id;
            return this;
        }

        public QuestionBuilder sessionId(String sessionId) {
            this.sessionId = sessionId;
            return this;
        }

        public QuestionBuilder questionText(String questionText) {
            this.questionText = questionText;
            return this;
        }

        public QuestionBuilder intent(String intent) {
            this.intent = intent;
            return this;
        }

        public QuestionBuilder requestedTimeRange(String requestedTimeRange) {
            this.requestedTimeRange = requestedTimeRange;
            return this;
        }

        public QuestionBuilder createdAt(Instant createdAt) {
            this.createdAt = createdAt;
            return this;
        }

        public Question build() {
            return new Question(id, sessionId, questionText, intent, requestedTimeRange, createdAt);
        }
    }
}
