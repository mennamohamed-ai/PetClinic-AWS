package com.clinic.backend.config;

import com.clinic.backend.security.JwtAuthFilter;
import java.util.List;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;


@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http,
                                           JwtAuthFilter jwtAuthFilter) throws Exception {
        http
            // ✅ Stateless API — لا sessions
            .sessionManagement(sm -> sm.sessionCreationPolicy(SessionCreationPolicy.STATELESS))

            // ✅ CSRF مش محتاجينه لأن الـ JWT cookie بيستخدم SameSite
            // (في production غيّر SameSite من None لـ Strict أو Lax وفعّل Secure)
            .csrf(csrf -> csrf.disable())

            // ✅ Important: Enable CORS in Spring Security.
            // Without this, browsers can fail preflight (OPTIONS) with 403.
            .cors(cors -> {})

            // ✅ Authorization Rules
            .authorizeHttpRequests(auth -> auth
                // Public endpoints — تسجيل ودخول
                .requestMatchers("/api/auth/**").permitAll()
                // Public read-only
                .requestMatchers(HttpMethod.GET, "/api/vets/**", "/api/doctors/**").permitAll()
                // Health check
                .requestMatchers("/actuator/health").permitAll()
                // ✅ كل endpoint تاني محتاج authentication
                .anyRequest().authenticated()
            )

            // ✅ شيل الـ default login page — API فقط
            .formLogin(form -> form.disable())
            .httpBasic(basic -> basic.disable())

            // ✅ حط الـ JWT filter قبل UsernamePasswordAuthenticationFilter
            .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();
        // Dev origins (ports may vary). Use patterns so localhost/127.0.0.1 both work.
        config.setAllowedOriginPatterns(List.of(
                "http://localhost:*",
                "http://127.0.0.1:*"
        ));
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
        config.setAllowedHeaders(List.of("*"));
        config.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }

    /**
     * BCrypt Password Encoder
     * ✅ يستخدم salt تلقائياً — أمان أعلى بكتير من SHA-256
     * strength=12 يعني 2^12 iterations = بطيء عمداً لمقاومة brute force
     */
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder(12);
    }
}
