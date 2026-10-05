package com.geosentinel.news;

import com.geosentinel.common.ApiResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/news")
public class NewsController {

    private final NewsRepository newsRepository;

    public NewsController(NewsRepository newsRepository) {
        this.newsRepository = newsRepository;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<News>>> getAllNews(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String source) {
        if (search != null && !search.isBlank()) {
            return ResponseEntity.ok(ApiResponse.success(newsRepository.findByTitleContainingIgnoreCase(search)));
        }
        if (source != null && !source.isBlank()) {
            return ResponseEntity.ok(ApiResponse.success(newsRepository.findBySourceNameIgnoreCase(source)));
        }
        return ResponseEntity.ok(ApiResponse.success(newsRepository.findAll()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<News>> getNewsById(@PathVariable String id) {
        return newsRepository.findById(id)
                .map(n -> ResponseEntity.ok(ApiResponse.success(n)))
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<ApiResponse<News>> createNews(@RequestBody News news) {
        News saved = newsRepository.save(news);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success(saved));
    }
}
