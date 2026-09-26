package com.geosentinel.masterdata;

import com.geosentinel.common.ApiResponse;
import com.geosentinel.countries.Country;
import com.geosentinel.countries.CountryController;
import com.geosentinel.countries.CountryRepository;
import com.geosentinel.events.Event;
import com.geosentinel.events.EventController;
import com.geosentinel.events.EventRepository;
import com.geosentinel.evidence.Evidence;
import com.geosentinel.evidence.EvidenceRepository;
import com.geosentinel.news.News;
import com.geosentinel.news.NewsRepository;
import com.geosentinel.organizations.Organization;
import com.geosentinel.organizations.OrganizationRepository;
import com.geosentinel.search.SearchController;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.http.ResponseEntity;

import java.util.List;
import java.util.Map;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.when;

class MasterDataControllerTest {

    private CountryRepository countryRepository;
    private EventRepository eventRepository;
    private NewsRepository newsRepository;
    private EvidenceRepository evidenceRepository;
    private OrganizationRepository organizationRepository;

    private CountryController countryController;
    private EventController eventController;
    private SearchController searchController;

    @BeforeEach
    void setUp() {
        countryRepository = Mockito.mock(CountryRepository.class);
        eventRepository = Mockito.mock(EventRepository.class);
        newsRepository = Mockito.mock(NewsRepository.class);
        evidenceRepository = Mockito.mock(EvidenceRepository.class);
        organizationRepository = Mockito.mock(OrganizationRepository.class);

        countryController = new CountryController(countryRepository);
        eventController = new EventController(eventRepository);
        searchController = new SearchController(eventRepository, newsRepository, evidenceRepository, organizationRepository);
    }

    @Test
    @DisplayName("Should list and retrieve countries")
    void shouldListAndRetrieveCountries() {
        Country ind = new Country("IND", "India", "Asia", "Southern Asia");
        when(countryRepository.findAll()).thenReturn(List.of(ind));
        when(countryRepository.findById("IND")).thenReturn(Optional.of(ind));

        ResponseEntity<ApiResponse<List<Country>>> all = countryController.getAllCountries();
        assertEquals(200, all.getStatusCode().value());
        assertEquals(1, all.getBody().getData().size());

        ResponseEntity<ApiResponse<Country>> single = countryController.getCountryByIsoCode("IND");
        assertEquals(200, single.getStatusCode().value());
        assertEquals("India", single.getBody().getData().getName());
    }

    @Test
    @DisplayName("Should list and search events")
    void shouldListAndSearchEvents() {
        Event evt = new Event("Strait of Hormuz Naval Patrol", "MARITIME_SECURITY", "IRN");
        when(eventRepository.findAll()).thenReturn(List.of(evt));
        when(eventRepository.findByTitleContainingIgnoreCase("Hormuz")).thenReturn(List.of(evt));

        ResponseEntity<ApiResponse<List<Event>>> all = eventController.getAllEvents(null, null);
        assertEquals(200, all.getStatusCode().value());
        assertEquals(1, all.getBody().getData().size());

        ResponseEntity<ApiResponse<List<Event>>> searched = eventController.getAllEvents("Hormuz", null);
        assertEquals(200, searched.getStatusCode().value());
        assertEquals(1, searched.getBody().getData().size());
    }

    @Test
    @DisplayName("Should execute global search across multiple entity domains")
    void shouldExecuteGlobalSearch() {
        Event evt = new Event("Red Sea Escort Mission", "SECURITY", "YEM");
        News news = new News("Red Sea Transit Rate Update", "Maritime News", "https://example.com/news1", "Summary");
        Evidence ev = new Evidence("CONN_WB", "https://example.com/ev1", "Evidence Claim", "Claim text", "hash123");
        Organization org = new Organization("UNCTAD", "INTERNATIONAL", "CHE");

        when(eventRepository.findByTitleContainingIgnoreCase("Red Sea")).thenReturn(List.of(evt));
        when(newsRepository.findByTitleContainingIgnoreCase("Red Sea")).thenReturn(List.of(news));
        when(evidenceRepository.findByTitleContainingIgnoreCase("Red Sea")).thenReturn(List.of(ev));
        when(organizationRepository.findByNameContainingIgnoreCase("Red Sea")).thenReturn(List.of());

        ResponseEntity<ApiResponse<Map<String, Object>>> resp = searchController.globalSearch("Red Sea");
        assertEquals(200, resp.getStatusCode().value());
        Map<String, Object> data = resp.getBody().getData();
        assertEquals("Red Sea", data.get("query"));
        assertEquals(3, data.get("totalResults"));
    }
}
