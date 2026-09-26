package com.geosentinel.organizations;

import jakarta.persistence.*;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "organizations")
public class Organization {

    @Id
    @Column(length = 64)
    private String id;

    @Column(nullable = false)
    private String name;

    @Column(name = "org_type", length = 64)
    private String orgType;

    @Column(name = "country_iso", length = 8)
    private String countryIso;

    @Column(name = "created_at")
    private Instant createdAt = Instant.now();

    public Organization() {
        this.id = "org_" + UUID.randomUUID().toString().replace("-", "").substring(0, 12);
        this.createdAt = Instant.now();
    }

    public Organization(String name, String orgType, String countryIso) {
        this.id = "org_" + UUID.randomUUID().toString().replace("-", "").substring(0, 12);
        this.name = name;
        this.orgType = orgType;
        this.countryIso = countryIso;
        this.createdAt = Instant.now();
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getOrgType() {
        return orgType;
    }

    public void setOrgType(String orgType) {
        this.orgType = orgType;
    }

    public String getCountryIso() {
        return countryIso;
    }

    public void setCountryIso(String countryIso) {
        this.countryIso = countryIso;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }
}
