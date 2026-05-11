package com.clinic.backend.security;

import com.clinic.backend.exception.TooManyRequestsException;
import java.time.Duration;
import java.time.Instant;
import java.util.Locale;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ConcurrentMap;
import org.springframework.stereotype.Service;

@Service
public class LoginAttemptService {
    private static final int MAX_ATTEMPTS = 5;
    private static final Duration WINDOW = Duration.ofMinutes(15);
    private static final Duration LOCKOUT = Duration.ofMinutes(15);

    private final ConcurrentMap<String, AttemptState> attempts = new ConcurrentHashMap<>();

    public void assertNotBlocked(String email, String clientIp) {
        String key = toKey(email, clientIp);
        AttemptState state = attempts.get(key);
        if (state == null) {
            return;
        }

        Instant now = Instant.now();
        if (state.lockedUntil != null && now.isBefore(state.lockedUntil)) {
            throw new TooManyRequestsException("Too many login attempts. Please try again later.");
        }

        if (state.windowStartedAt != null && now.isAfter(state.windowStartedAt.plus(WINDOW))) {
            attempts.remove(key, state);
        }
    }

    public void recordFailure(String email, String clientIp) {
        String key = toKey(email, clientIp);
        Instant now = Instant.now();

        attempts.compute(key, (k, current) -> {
            AttemptState state = current == null ? new AttemptState(now, 0, null) : current;

            if (state.windowStartedAt == null || now.isAfter(state.windowStartedAt.plus(WINDOW))) {
                state.windowStartedAt = now;
                state.failures = 0;
                state.lockedUntil = null;
            }

            state.failures++;
            if (state.failures >= MAX_ATTEMPTS) {
                state.lockedUntil = now.plus(LOCKOUT);
            }
            return state;
        });
    }

    public void recordSuccess(String email, String clientIp) {
        attempts.remove(toKey(email, clientIp));
    }

    private String toKey(String email, String clientIp) {
        String normalizedEmail = email == null ? "" : email.trim().toLowerCase(Locale.ROOT);
        String normalizedIp = clientIp == null ? "unknown" : clientIp.trim();
        return normalizedEmail + "|" + normalizedIp;
    }

    private static final class AttemptState {
        private Instant windowStartedAt;
        private int failures;
        private Instant lockedUntil;

        private AttemptState(Instant windowStartedAt, int failures, Instant lockedUntil) {
            this.windowStartedAt = windowStartedAt;
            this.failures = failures;
            this.lockedUntil = lockedUntil;
        }
    }
}
