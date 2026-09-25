package com.geosentinel.users;

import jakarta.persistence.*;
import java.time.Instant;
import java.util.Objects;

@Entity
@Table(name = "roles")
public class Role {

    @Id
    @Column(length = 64)
    private String id;

    @Column(name = "role_key", nullable = false, unique = true, length = 64)
    private String roleKey;

    @Column(length = 255)
    private String description;

    @Column(name = "created_at", updatable = false)
    private Instant createdAt = Instant.now();

    public Role() {}

    public Role(String id, String roleKey, String description, Instant createdAt) {
        this.id = id;
        this.roleKey = roleKey;
        this.description = description;
        this.createdAt = (createdAt != null) ? createdAt : Instant.now();
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getRoleKey() { return roleKey; }
    public void setRoleKey(String roleKey) { this.roleKey = roleKey; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof Role)) return false;
        Role role = (Role) o;
        return Objects.equals(id, role.id);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id);
    }

    public static Builder builder() { return new Builder(); }

    public static class Builder {
        private String id;
        private String roleKey;
        private String description;
        private Instant createdAt = Instant.now();

        public Builder id(String id) { this.id = id; return this; }
        public Builder roleKey(String roleKey) { this.roleKey = roleKey; return this; }
        public Builder description(String description) { this.description = description; return this; }
        public Builder createdAt(Instant createdAt) { this.createdAt = createdAt; return this; }
        public Role build() { return new Role(id, roleKey, description, createdAt); }
    }
}
