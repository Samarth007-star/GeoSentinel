package com.geosentinel.countries;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "countries")
public class Country {

    @Id
    @Column(name = "iso_code", length = 8)
    private String isoCode;

    @Column(nullable = false, length = 255)
    private String name;

    @Column(length = 128)
    private String region;

    @Column(length = 128)
    private String subregion;

    @Column(name = "created_at")
    private Instant createdAt = Instant.now();

    public Country() {
    }

    public Country(String isoCode, String name, String region, String subregion) {
        this.isoCode = isoCode;
        this.name = name;
        this.region = region;
        this.subregion = subregion;
        this.createdAt = Instant.now();
    }

    public String getIsoCode() {
        return isoCode;
    }

    public void setIsoCode(String isoCode) {
        this.isoCode = isoCode;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getRegion() {
        return region;
    }

    public void setRegion(String region) {
        this.region = region;
    }

    public String getSubregion() {
        return subregion;
    }

    public void setSubregion(String subregion) {
        this.subregion = subregion;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }
}
