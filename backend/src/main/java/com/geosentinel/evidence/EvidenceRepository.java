package com.geosentinel.evidence;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface EvidenceRepository extends JpaRepository<Evidence, String> {
    List<Evidence> findByTitleContainingIgnoreCase(String keyword);
    List<Evidence> findByGeographyIgnoreCase(String geography);
    List<Evidence> findByVerificationStatus(String status);
}
