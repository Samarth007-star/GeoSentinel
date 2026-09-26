package com.geosentinel.news;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NewsRepository extends JpaRepository<News, String> {
    List<News> findByTitleContainingIgnoreCase(String keyword);
    List<News> findBySourceNameIgnoreCase(String sourceName);
}
