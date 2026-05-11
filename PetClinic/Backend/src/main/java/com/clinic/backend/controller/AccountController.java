package com.clinic.backend.controller;

import com.clinic.backend.dto.account.AccountResponse;
import com.clinic.backend.dto.account.ResetPasswordRequest;
import com.clinic.backend.dto.account.UpdateAccountRequest;
import com.clinic.backend.exception.UnauthorizedException;
import com.clinic.backend.model.Role;
import com.clinic.backend.security.AuthGuard;
import com.clinic.backend.security.AuthenticatedUser;
import com.clinic.backend.security.JwtService;
import jakarta.servlet.http.Cookie;
import com.clinic.backend.service.PatientService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/account")
public class AccountController {

    private final AuthGuard authGuard;
    private final PatientService patientService;
    private final JwtService jwtService;

    @Value("${security.cookie.secure:true}")
    private boolean cookieSecure;

    @Value("${security.cookie.same-site:Strict}")
    private String cookieSameSite;

    public AccountController(AuthGuard authGuard, PatientService patientService, JwtService jwtService) {
        this.authGuard = authGuard;
        this.patientService = patientService;
        this.jwtService = jwtService;
    }

    @PutMapping("/{id}")
    public AccountResponse editAccount(
            @PathVariable Long id,
            HttpServletRequest request,
            @Valid @RequestBody UpdateAccountRequest body
    ) {
        AuthenticatedUser currentUser = authGuard.requireAuthenticatedUser(request);

        // ✅ FIXED: يتحقق إن المستخدم بيعدّل أكاونته هو بس (إلا لو ADMIN)
        if (!currentUser.userId().equals(id) && currentUser.role() != Role.ADMIN) {
            throw new UnauthorizedException("You can only edit your own account.");
        }

        var updated = patientService.updateAccount(id, body);
        return new AccountResponse(
                updated.getId(), updated.getName(),
                updated.getEmail(), updated.getPhone(), updated.getRole()
        );
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteAccount(@PathVariable Long id, HttpServletRequest request) {
        AuthenticatedUser currentUser = authGuard.requireAuthenticatedUser(request);

        // ✅ بس صاحب الأكاونت أو ADMIN يقدر يحذفه
        if (!currentUser.userId().equals(id) && currentUser.role() != Role.ADMIN) {
            throw new UnauthorizedException("You can only delete your own account.");
        }

        patientService.delete(id);
    }

    @PutMapping("/{id}/reset-password")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void resetPassword(
            @PathVariable Long id,
            HttpServletRequest request,
            @Valid @RequestBody ResetPasswordRequest body
    ) {
        AuthenticatedUser currentUser = authGuard.requireAuthenticatedUser(request);

        // ✅ بس صاحب الأكاونت يقدر يغير باسورده
        if (!currentUser.userId().equals(id)) {
            throw new UnauthorizedException("You can only reset your own password.");
        }

        patientService.resetPassword(id, body.oldPassword(), body.newPassword());
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logout(HttpServletRequest request, HttpServletResponse response) {
        jwtService.revokeToken(extractToken(request));
        removeJwtCookie(response);
        return ResponseEntity.ok("Logged out successfully");
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
