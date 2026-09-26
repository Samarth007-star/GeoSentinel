package com.geosentinel.organizations;

import com.geosentinel.common.ApiResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/organizations")
public class OrganizationController {

    private final OrganizationRepository organizationRepository;

    public OrganizationController(OrganizationRepository organizationRepository) {
        this.organizationRepository = organizationRepository;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<Organization>>> getAllOrganizations(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String country) {
        if (search != null && !search.isBlank()) {
            return ResponseEntity.ok(ApiResponse.success(organizationRepository.findByNameContainingIgnoreCase(search)));
        }
        if (country != null && !country.isBlank()) {
            return ResponseEntity.ok(ApiResponse.success(organizationRepository.findByCountryIsoIgnoreCase(country)));
        }
        return ResponseEntity.ok(ApiResponse.success(organizationRepository.findAll()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<Organization>> getOrganizationById(@PathVariable String id) {
        return organizationRepository.findById(id)
                .map(o -> ResponseEntity.ok(ApiResponse.success(o)))
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<ApiResponse<Organization>> createOrganization(@RequestBody Organization org) {
        Organization saved = organizationRepository.save(org);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success(saved));
    }
}
