package com.clinic.backend.security;

import com.clinic.backend.exception.UnauthorizedException;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.stereotype.Component;

/**
 * Auth Guard — يجيب المستخدم الحالي المتحقق منه
 *
 * ✅ يعتمد على JwtAuthFilter اللي بيحط AuthenticatedUser
 *    كـ request attribute بعد التحقق من الـ JWT
 */
@Component
public class AuthGuard {

    /**
     * يجيب المستخدم الحالي من الـ request attribute
     * اللي JwtAuthFilter حطه بعد التحقق من الـ JWT
     *
     * @throws UnauthorizedException لو مفيش مستخدم متحقق منه
     */
    public AuthenticatedUser requireAuthenticatedUser(HttpServletRequest request) {
        AuthenticatedUser user = (AuthenticatedUser)
                request.getAttribute(JwtAuthFilter.ATTR_AUTHENTICATED_USER);
        if (user == null) {
            throw new UnauthorizedException("Authentication required.");
        }
        return user;
    }
}
