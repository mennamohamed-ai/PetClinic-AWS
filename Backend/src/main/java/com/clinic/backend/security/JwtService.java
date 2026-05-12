package com.clinic.backend.security;

import com.clinic.backend.exception.UnauthorizedException;
import com.clinic.backend.model.Role;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.Date;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;
import javax.crypto.SecretKey;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class JwtService {
    private final SecretKey secretKey;
    private final long tokenTtlMs;
    private final Map<String, Instant> revokedTokens = new ConcurrentHashMap<>();

    public JwtService(
            @Value("${security.jwt.secret}") String secret,
            @Value("${security.jwt.expiration-ms:86400000}") long tokenTtlMs
    ) {
        if (secret == null || secret.isBlank()) {
            throw new IllegalStateException("Missing required property: security.jwt.secret");
        }
        if (secret.length() < 32) {
            throw new IllegalStateException("security.jwt.secret must be at least 32 characters");
        }
        this.secretKey = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
        this.tokenTtlMs = tokenTtlMs;
    }

    public String generateToken(Long userId, Role role) {
        Instant now = Instant.now();
        Instant expiry = now.plusMillis(tokenTtlMs);
        return Jwts.builder()
                .subject(userId.toString())
                .claim("role", role.name())
                .id(UUID.randomUUID().toString())
                .issuedAt(Date.from(now))
                .expiration(Date.from(expiry))
                .signWith(secretKey)
                .compact();
    }

    public AuthenticatedUser parseToken(String token) {
        try {
            if (isRevoked(token)) {
                throw new UnauthorizedException("Invalid or expired token.");
            }
            Claims claims = Jwts.parser()
                    .verifyWith(secretKey)
                    .build()
                    .parseSignedClaims(token)
                    .getPayload();
            return toUser(claims);
        } catch (Exception ex) {
            throw new UnauthorizedException("Invalid or expired token.");
        }
    }

    public void revokeToken(String token) {
        if (token == null || token.isBlank()) {
            return;
        }
        try {
            Claims claims = Jwts.parser()
                    .verifyWith(secretKey)
                    .build()
                    .parseSignedClaims(token)
                    .getPayload();
            Instant expiry = claims.getExpiration().toInstant();
            if (Instant.now().isBefore(expiry)) {
                revokedTokens.put(token, expiry);
            }
        } catch (Exception ignored) {
            // Ignore invalid tokens during logout while still clearing the cookie.
        }
    }

    private boolean isRevoked(String token) {
        Instant now = Instant.now();
        revokedTokens.entrySet().removeIf(entry -> !now.isBefore(entry.getValue()));
        return revokedTokens.containsKey(token);
    }

    private AuthenticatedUser toUser(Claims claims) {
        Long userId = Long.valueOf(claims.getSubject());
        Role role = Role.valueOf(claims.get("role", String.class));
        return new AuthenticatedUser(userId, role);
    }
}
