package com.geosentinel.sources;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface SourceRepository extends JpaRepository<Source, String> {
    Optional<Source> findBySourceKey(String sourceKey);
}
