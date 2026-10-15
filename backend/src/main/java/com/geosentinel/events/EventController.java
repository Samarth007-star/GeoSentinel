package com.geosentinel.events;

import com.geosentinel.common.ApiResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/events")
public class EventController {

    private final EventRepository eventRepository;

    public EventController(EventRepository eventRepository) {
        this.eventRepository = eventRepository;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<Event>>> getAllEvents(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String geography) {
        if (search != null && !search.isBlank()) {
            return ResponseEntity.ok(ApiResponse.success(eventRepository.findByTitleContainingIgnoreCase(search)));
        }
        if (geography != null && !geography.isBlank()) {
            return ResponseEntity.ok(ApiResponse.success(eventRepository.findByGeographyIgnoreCase(geography)));
        }
        return ResponseEntity.ok(ApiResponse.success(eventRepository.findAll()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<Event>> getEventById(@PathVariable String id) {
        return eventRepository.findById(id)
                .map(e -> ResponseEntity.ok(ApiResponse.success(e)))
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<ApiResponse<Event>> createEvent(@RequestBody Event event) {
        Event saved = eventRepository.save(event);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success(saved));
    }
}
