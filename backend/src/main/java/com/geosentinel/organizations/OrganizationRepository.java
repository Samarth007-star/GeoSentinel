package com.geosentinel.organizations;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OrganizationRepository extends JpaRepository<Organization, String> {
    List<Organization> findByNameContainingIgnoreCase(String name);
    List<Organization> findByCountryIsoIgnoreCase(String countryIso);
}
