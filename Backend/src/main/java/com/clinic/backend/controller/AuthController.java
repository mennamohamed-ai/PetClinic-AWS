package com.clinic.backend.controller;

import com.clinic.backend.dto.auth.AuthResponse;
import com.clinic.backend.dto.auth.LoginRequest;
import com.clinic.backend.dto.auth.RegisterRequest;
import com.clinic.backend.dto.auth.UserPermissionsResponse;
import com.clinic.backend.exception.UnauthorizedException;
import com.clinic.backend.security.AuthGuard;
import com.clinic.backend.security.LoginAttemptService;
import com.clinic.backend.security.JwtService;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import com.clinic.backend.service.AuthService;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseCookie;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;
    private final JwtService jwtService;
    private final LoginAttemptService loginAttemptService;
    private final AuthGuard authGuard;
    private final com.clinic.backend.service.DashboardPermissionService dashboardPermissionService;


    @Value("${security.cookie.secure:true}")
    private boolean cookieSecure;

    @Value("${security.cookie.same-site:Strict}")
    private String cookieSameSite;

    public AuthController(
            AuthService authService,
            JwtService jwtService,
            LoginAttemptService loginAttemptService,
            AuthGuard authGuard,
            com.clinic.backend.service.DashboardPermissionService dashboardPermissionService
    ) {
        this.authService = authService;
        this.jwtService = jwtService;
        this.loginAttemptService = loginAttemptService;
        this.authGuard = authGuard;
        this.dashboardPermissionService = dashboardPermissionService;
    }

    @PostMapping("/register")
    @ResponseStatus(HttpStatus.CREATED)
    public AuthResponse register(@Valid @RequestBody RegisterRequest request, HttpServletResponse response) {
        AuthResponse authResponse = authService.register(request);
        String token = jwtService.generateToken(authResponse.userId(), authResponse.role());
        addJwtCookie(response, token);
        return authResponse;
    }

    @PostMapping("/login")
    public AuthResponse login(
            @Valid @RequestBody LoginRequest request,
            HttpServletRequest servletRequest,
            HttpServletResponse response
    ) {
        String clientIp = servletRequest.getRemoteAddr();
        loginAttemptService.assertNotBlocked(request.email(), clientIp);

        try {
            AuthResponse authResponse = authService.login(request);
            loginAttemptService.recordSuccess(request.email(), clientIp);
            String token = jwtService.generateToken(authResponse.userId(), authResponse.role());
            addJwtCookie(response, token);
            return authResponse;
        } catch (UnauthorizedException ex) {
            loginAttemptService.recordFailure(request.email(), clientIp);
            throw ex;
        }
    }

    @PostMapping("/logout")
    public void logout(HttpServletRequest request, HttpServletResponse response) {
        String token = extractToken(request);
        jwtService.revokeToken(token);
        removeJwtCookie(response);
    }

    @GetMapping("/me/permissions")
    public UserPermissionsResponse getMyPermissions(HttpServletRequest request) {
        var user = authGuard.requireAuthenticatedUser(request);
        return new UserPermissionsResponse(
                user.role(),
                dashboardPermissionService.getPermissionsForRole(user.role())
        );
    }

    private void addJwtCookie(HttpServletResponse response, String token) {
        ResponseCookie cookie = ResponseCookie.from("token", token)
                .httpOnly(true)
                .secure(cookieSecure)
                .path("/")
                .sameSite(cookieSameSite)
                .maxAge(86400)
                .build();
        response.addHeader("Set-Cookie", cookie.toString());
    }

    private void removeJwtCookie(HttpServletResponse response) {
        ResponseCookie cookie = ResponseCookie.from("token", "")
                .httpOnly(true)
                .secure(cookieSecure)
                .path("/")
                .sameSite(cookieSameSite)
                .maxAge(0)
                .build();
        response.addHeader("Set-Cookie", cookie.toString());
    }

    private String extractToken(HttpServletRequest request) {
        if (request.getCookies() != null) {
            for (Cookie cookie : request.getCookies()) {
                if ("token".equals(cookie.getName())) {
                    return cookie.getValue();
                }
            }
        }
        String header = request.getHeader("Authorization");
        if (header != null && header.startsWith("Bearer ")) {
            return header.substring(7).trim();
        }
        return null;
    }
}