package com.clinic.backend.security;

import com.clinic.backend.exception.UnauthorizedException;
import com.clinic.backend.model.Role;
import java.util.Arrays;
import org.springframework.stereotype.Component;

/**
 * Role Guard — يتحقق إن المستخدم عنده الرول المطلوب
 *
 * ✅ FIXED: بيقرأ الرول من الـ JWT المتحقق منه (AuthenticatedUser)
 *    مش من X-Role header اللي ممكن أي client يزوره
 */
@Component
public class RoleGuard {

    /**
     * يتحقق إن المستخدم عنده واحد على الأقل من الـ roles المسموح بيها
     *
     * @param user         المستخدم الحالي من الـ JWT
     * @param allowedRoles الـ roles المسموح بيها لهذه العملية
     * @throws UnauthorizedException لو الرول مش مسموح
     */
    public void requireRole(AuthenticatedUser user, Role... allowedRoles) {
        if (user == null) {
            throw new UnauthorizedException("Authentication required.");
        }
        for (Role allowed : allowedRoles) {
            if (user.role() == allowed) {
                return; // ✅ مسموح
            }
        }
        throw new UnauthorizedException(
            "Access denied. Your role (" + user.role() + ") does not have permission. " +
            "Required: " + Arrays.toString(allowedRoles)
        );
    }
}
