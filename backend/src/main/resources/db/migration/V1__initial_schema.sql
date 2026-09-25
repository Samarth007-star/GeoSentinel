-- ========================================================
-- GeoSentinel V1 Initial Relational Schema
-- Database: MySQL 8.x
-- System of Record: Users, Evidence, Runs, Events, Strategies
-- ========================================================

-- 1. Identity & RBAC
CREATE TABLE IF NOT EXISTS roles (
    id VARCHAR(64) PRIMARY KEY,
    role_key VARCHAR(64) UNIQUE NOT NULL,
    description VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(64) PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    display_name VARCHAR(255),
    status VARCHAR(32) DEFAULT 'ACTIVE',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    last_login_at TIMESTAMP NULL
);

CREATE TABLE IF NOT EXISTS user_roles (
    user_id VARCHAR(64) NOT NULL,
    role_id VARCHAR(64) NOT NULL,
    assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, role_id),
    CONSTRAINT fk_ur_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_ur_role FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE
);

-- 2. Sessions & Topic Isolation
CREATE TABLE IF NOT EXISTS sessions (
    id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(64) NULL,
    title VARCHAR(255),
    topic_fingerprint VARCHAR(255),
    status VARCHAR(32) DEFAULT 'ACTIVE',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_activity_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP NOT NULL,
    CONSTRAINT fk_sess_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- 3. Questions & Analysis Runs
CREATE TABLE IF NOT EXISTS questions (
    id VARCHAR(64) PRIMARY KEY,
    session_id VARCHAR(64) NOT NULL,
    question_text TEXT NOT NULL,
    intent VARCHAR(64),
    entities_json JSON,
    requested_time_range VARCHAR(64),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_q_session FOREIGN KEY (session_id) REFERENCES sessions(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS analysis_runs (
    id VARCHAR(64) PRIMARY KEY,
    question_id VARCHAR(64) NOT NULL,
    status VARCHAR(32) DEFAULT 'PENDING',
    pipeline_version VARCHAR(32) DEFAULT '1.0.0',
    model_id VARCHAR(64) DEFAULT 'local_v1',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP NULL,
    summary_json JSON,
    limitations_json JSON,
    CONSTRAINT fk_ar_question FOREIGN KEY (question_id) REFERENCES questions(id) ON DELETE CASCADE
);

-- 4. Sources & Connector Registry
CREATE TABLE IF NOT EXISTS sources (
    id VARCHAR(64) PRIMARY KEY,
    source_key VARCHAR(64) UNIQUE NOT NULL,
    category VARCHAR(64) NOT NULL,
    provider VARCHAR(255) NOT NULL,
    terms_url VARCHAR(512) NOT NULL,
    license VARCHAR(64) NOT NULL,
    attribution VARCHAR(255),
    approved_use VARCHAR(64) DEFAULT 'RESEARCH_AI_PERMITTED',
    status VARCHAR(32) DEFAULT 'ACTIVE',
    terms_reviewed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    rate_limit_config JSON
);

CREATE TABLE IF NOT EXISTS connector_runs (
    id VARCHAR(64) PRIMARY KEY,
    source_id VARCHAR(64) NOT NULL,
    analysis_run_id VARCHAR(64) NOT NULL,
    status VARCHAR(32) DEFAULT 'COMPLETED',
    started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP NULL,
    records_fetched INT DEFAULT 0,
    safe_error_code VARCHAR(64) NULL,
    safe_error_message VARCHAR(512) NULL,
    CONSTRAINT fk_cr_source FOREIGN KEY (source_id) REFERENCES sources(id),
    CONSTRAINT fk_cr_run FOREIGN KEY (analysis_run_id) REFERENCES analysis_runs(id) ON DELETE CASCADE
);

-- 5. Evidence & Provenance
CREATE TABLE IF NOT EXISTS evidence (
    id VARCHAR(64) PRIMARY KEY,
    source_id VARCHAR(64) NOT NULL,
    source_record_id VARCHAR(255),
    canonical_url VARCHAR(1024) NOT NULL,
    title VARCHAR(512) NOT NULL,
    claim_text TEXT NOT NULL,
    evidence_type VARCHAR(64),
    published_at TIMESTAMP NULL,
    retrieved_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    geography VARCHAR(64),
    content_hash VARCHAR(64) NOT NULL,
    verification_status VARCHAR(32) DEFAULT 'UNVERIFIED',
    verification_notes TEXT,
    license_id VARCHAR(64),
    CONSTRAINT fk_ev_source FOREIGN KEY (source_id) REFERENCES sources(id)
);

CREATE TABLE IF NOT EXISTS run_evidence (
    analysis_run_id VARCHAR(64) NOT NULL,
    evidence_id VARCHAR(64) NOT NULL,
    relevance_reason VARCHAR(512),
    used_by_agent VARCHAR(64),
    PRIMARY KEY (analysis_run_id, evidence_id),
    CONSTRAINT fk_re_run FOREIGN KEY (analysis_run_id) REFERENCES analysis_runs(id) ON DELETE CASCADE,
    CONSTRAINT fk_re_evidence FOREIGN KEY (evidence_id) REFERENCES evidence(id) ON DELETE CASCADE
);

-- 6. Events, News, Organizations, Entities
CREATE TABLE IF NOT EXISTS countries (
    iso_code VARCHAR(8) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    region VARCHAR(128),
    subregion VARCHAR(128),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS events (
    id VARCHAR(64) PRIMARY KEY,
    title VARCHAR(512) NOT NULL,
    event_type VARCHAR(64) NOT NULL,
    start_time TIMESTAMP NULL,
    end_time TIMESTAMP NULL,
    status VARCHAR(32) DEFAULT 'ACTIVE',
    geography VARCHAR(64),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS event_evidence (
    event_id VARCHAR(64) NOT NULL,
    evidence_id VARCHAR(64) NOT NULL,
    relation_type VARCHAR(64) DEFAULT 'SUPPORTS',
    PRIMARY KEY (event_id, evidence_id),
    CONSTRAINT fk_ee_event FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE,
    CONSTRAINT fk_ee_evidence FOREIGN KEY (evidence_id) REFERENCES evidence(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS news (
    id VARCHAR(64) PRIMARY KEY,
    title VARCHAR(512) NOT NULL,
    source_name VARCHAR(255) NOT NULL,
    url VARCHAR(1024) NOT NULL,
    published_at TIMESTAMP NULL,
    summary TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS organizations (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    org_type VARCHAR(64),
    country_iso VARCHAR(8),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS entities (
    id VARCHAR(64) PRIMARY KEY,
    canonical_name VARCHAR(255) NOT NULL,
    entity_type VARCHAR(64) NOT NULL,
    aliases_json JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS entity_relationships (
    id VARCHAR(64) PRIMARY KEY,
    source_entity_id VARCHAR(64) NOT NULL,
    target_entity_id VARCHAR(64) NOT NULL,
    relationship_type VARCHAR(64) NOT NULL,
    valid_from TIMESTAMP NULL,
    valid_to TIMESTAMP NULL,
    evidence_id VARCHAR(64) NULL,
    CONSTRAINT fk_er_source FOREIGN KEY (source_entity_id) REFERENCES entities(id) ON DELETE CASCADE,
    CONSTRAINT fk_er_target FOREIGN KEY (target_entity_id) REFERENCES entities(id) ON DELETE CASCADE,
    CONSTRAINT fk_er_evidence FOREIGN KEY (evidence_id) REFERENCES evidence(id) ON DELETE SET NULL
);

-- 7. Strategies, Mandatory Risk Reviews & Mitigations
CREATE TABLE IF NOT EXISTS strategy_options (
    id VARCHAR(64) PRIMARY KEY,
    question_id VARCHAR(64) NOT NULL,
    title VARCHAR(512) NOT NULL,
    objective TEXT NOT NULL,
    mechanism TEXT NOT NULL,
    prerequisites JSON,
    time_horizon VARCHAR(64),
    benefits JSON,
    tradeoffs JSON,
    evidence_ids JSON,
    fallback_option TEXT,
    status VARCHAR(32) DEFAULT 'PENDING_REVIEW',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_so_question FOREIGN KEY (question_id) REFERENCES questions(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS strategy_risk_reviews (
    id VARCHAR(64) PRIMARY KEY,
    strategy_option_id VARCHAR(64) NOT NULL,
    reviewer VARCHAR(128) NOT NULL,
    review_status VARCHAR(32) NOT NULL,
    findings TEXT NOT NULL,
    unintended_consequences JSON,
    second_order_harms JSON,
    escalation_risks JSON,
    affected_groups JSON,
    residual_risk_disclosure TEXT,
    reviewed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_srr_strategy FOREIGN KEY (strategy_option_id) REFERENCES strategy_options(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS strategy_mitigations (
    id VARCHAR(64) PRIMARY KEY,
    strategy_option_id VARCHAR(64) NOT NULL,
    risk_review_id VARCHAR(64) NOT NULL,
    mitigation_description TEXT NOT NULL,
    trigger_indicator VARCHAR(255),
    fallback_action TEXT,
    CONSTRAINT fk_sm_strat FOREIGN KEY (strategy_option_id) REFERENCES strategy_options(id) ON DELETE CASCADE,
    CONSTRAINT fk_sm_review FOREIGN KEY (risk_review_id) REFERENCES strategy_risk_reviews(id) ON DELETE CASCADE
);

-- 8. Reports & Tamper-Evident Audit Logs
CREATE TABLE IF NOT EXISTS reports (
    id VARCHAR(64) PRIMARY KEY,
    analysis_run_id VARCHAR(64) NOT NULL,
    user_id VARCHAR(64) NULL,
    title VARCHAR(255) NOT NULL,
    format VARCHAR(16) DEFAULT 'PDF',
    file_reference VARCHAR(512),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP NULL,
    CONSTRAINT fk_rpt_run FOREIGN KEY (analysis_run_id) REFERENCES analysis_runs(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS audit_logs (
    id VARCHAR(64) PRIMARY KEY,
    actor_id VARCHAR(64) NULL,
    action VARCHAR(64) NOT NULL,
    resource_type VARCHAR(64) NOT NULL,
    resource_id VARCHAR(64),
    ip_address VARCHAR(64),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    redacted_metadata JSON
);

-- Initial Roles Seed
INSERT IGNORE INTO roles (id, role_key, description) VALUES
('role_admin', 'ROLE_ADMIN', 'Administrator with full system & connector management'),
('role_analyst', 'ROLE_ANALYST', 'Geopolitical Analyst with query & scenario authority'),
('role_viewer', 'ROLE_VIEWER', 'Read-only observer access to reports and evidence');
