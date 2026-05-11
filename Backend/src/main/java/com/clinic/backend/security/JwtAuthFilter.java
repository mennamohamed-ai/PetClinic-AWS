package com.clinic.backend.security;

import com.clinic.backend.service.PatientService;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.List;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

/**
 * JWT Authentication Filter
 * يقرأ الـ JWT من الـ Cookie أو Authorization header,
 * يتحقق منه، ويحط المستخدم في الـ SecurityContext.
 */
@Component
public class JwtAuthFilter extends OncePerRequestFilter {

    public static final String ATTR_AUTHENTICATED_USER = "authenticatedUser";
    private static final String COOKIE_NAME = "token";
    private static final String BEARER_PREFIX = "Bearer ";

    private final JwtService jwtService;
    private final PatientService patientService;

    public JwtAuthFilter(JwtService jwtService, PatientService patientService) {
        this.jwtService = jwtService;
        this.patientService = patientService;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain)
            throws ServletException, IOException {

        String token = extractTokenFromCookie(request);
        if (token == null) {
            token = extractTokenFromHeader(request);
        }

        if (token != null && !token.isBlank()) {
            try {
                AuthenticatedUser tokenUser = jwtService.parseToken(token);
                var patient = patientService.getById(tokenUser.userId());
                AuthenticatedUser user = new AuthenticatedUser(patient.getId(), patient.getRole());

                // حط المستخدم كـ request attribute عشان Controllers تقدر توصله
                request.setAttribute(ATTR_AUTHENTICATED_USER, user);

                // حط المستخدم في Spring Security Context
                var authorities = List.of(new SimpleGrantedAuthority("ROLE_" + user.role().name()));
                var auth = new UsernamePasswordAuthenticationToken(user, null, authorities);
                SecurityContextHolder.getContext().setAuthentication(auth);

            } catch (Exception ex) {
                // Token غلط أو منتهي — مش بنرجع error هنا,
                // Spring Security هيتكلف بالـ endpoints المحمية
            }
        }

        filterChain.doFilter(request, response);
    }

    private String extractTokenFromCookie(HttpServletRequest request) {
        if (request.getCookies() == null) return null;
        for (Cookie cookie : request.getCookies()) {
            if (COOKIE_NAME.equals(cookie.getName())) {
                return cookie.getValue();
            }
        }
        return null;
    }

    private String extractTokenFromHeader(HttpServletRequest request) {
        String header = request.getHeader("Authorization");
        if (header != null && header.startsWith(BEARER_PREFIX)) {
            return header.substring(BEARER_PREFIX.length()).trim();
        }
        return null;
    }
}
