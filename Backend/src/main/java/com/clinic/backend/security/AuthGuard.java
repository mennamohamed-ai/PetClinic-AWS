package com.clinic.backend.security;

import com.clinic.backend.exception.UnauthorizedException;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.stereotype.Component;

@Component
public class AuthGuard {

    public AuthenticatedUser requireAuthenticatedUser(HttpServletRequest request) {
        AuthenticatedUser user = (AuthenticatedUser)
                request.getAttribute(JwtAuthFilter.ATTR_AUTHENTICATED_USER);
        if (user == null) {
            throw new UnauthorizedException("Authentication required.");
        }
        return user;
    }
}
