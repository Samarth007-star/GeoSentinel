package com.geosentinel.countries;

import com.geosentinel.common.ApiResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/countries")
public class CountryController {

    private final CountryRepository countryRepository;

    public CountryController(CountryRepository countryRepository) {
        this.countryRepository = countryRepository;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<Country>>> getAllCountries() {
        return ResponseEntity.ok(ApiResponse.success(countryRepository.findAll()));
    }

    @GetMapping("/{isoCode}")
    public ResponseEntity<ApiResponse<Country>> getCountryByIsoCode(@PathVariable String isoCode) {
        return countryRepository.findById(isoCode)
                .map(c -> ResponseEntity.ok(ApiResponse.success(c)))
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<ApiResponse<Country>> createCountry(@RequestBody Country country) {
        Country saved = countryRepository.save(country);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success(saved));
    }
}
