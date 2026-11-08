package com.geosentinel.security;

import org.springframework.http.HttpMethod;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;
import java.util.List;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthFilter;

    public SecurityConfig(JwtAuthenticationFilter jwtAuthFilter) {
        this.jwtAuthFilter = jwtAuthFilter;
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf.disable())
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .sessionManagement(sess -> sess.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth -> auth
                // Public authentication and OpenAPI docs
                .requestMatchers(
                    "/api/v1/auth/**",
                    "/v3/api-docs/**",
                    "/swagger-ui/**",
                    "/swagger-ui.html"
                ).permitAll()

                // Admin-only management endpoints
                .requestMatchers("/api/v1/admin/**").hasRole("ADMIN")

                // Specialized role-governed endpoints
                .requestMatchers("/api/v1/strategy/**").hasAnyRole("DECISION_MAKER", "ADMIN")
                .requestMatchers("/api/v1/risk-review/**").hasAnyRole("RISK_AUDITOR", "ADMIN")
                .requestMatchers("/api/v1/connectors/**").hasAnyRole("DATA_ENGINEER", "ADMIN")

                // Analytical query execution & session creation
                .requestMatchers(HttpMethod.POST, "/api/v1/sessions/*/questions/**").hasAnyRole("ANALYST", "RESEARCHER", "DECISION_MAKER", "ADMIN")
                .requestMatchers(HttpMethod.POST, "/api/v1/pipeline/**").hasAnyRole("ANALYST", "RESEARCHER", "DECISION_MAKER", "ADMIN")
                .requestMatchers(HttpMethod.POST, "/api/v1/sessions/**").hasAnyRole("ANALYST", "RESEARCHER", "DECISION_MAKER", "DATA_ENGINEER", "ADMIN")
                .requestMatchers(HttpMethod.DELETE, "/api/v1/sessions/**").hasRole("ADMIN")

                // Read-only access for all seven canonical roles
                .requestMatchers(HttpMethod.GET, 
                    "/api/v1/dashboard/**",
                    "/api/v1/sources/**",
                    "/api/v1/sessions/**",
                    "/api/v1/countries/**",
                    "/api/v1/events/**",
                    "/api/v1/news/**",
                    "/api/v1/organizations/**",
                    "/api/v1/evidence/**",
                    "/api/v1/reports/**",
                    "/api/v1/search/**"
                ).hasAnyRole("VIEWER", "ANALYST", "RESEARCHER", "DECISION_MAKER", "RISK_AUDITOR", "DATA_ENGINEER", "ADMIN")

                .anyRequest().authenticated()
            )
            .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowedOriginPatterns(List.of("*"));
        config.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        config.setAllowedHeaders(Arrays.asList("Authorization", "Content-Type", "X-Internal-Service-Key"));
        config.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }
}
