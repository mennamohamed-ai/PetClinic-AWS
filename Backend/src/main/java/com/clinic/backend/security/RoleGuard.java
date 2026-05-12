package com.clinic.backend.security;

import com.clinic.backend.exception.UnauthorizedException;
import com.clinic.backend.model.Role;
import java.util.Arrays;
import org.springframework.stereotype.Component;

@Component
public class RoleGuard {

    public void requireRole(AuthenticatedUser user, Role... allowedRoles) {
        if (user == null) {
            throw new UnauthorizedException("Authentication required.");
        }
        for (Role allowed : allowedRoles) {
            if (user.role() == allowed) {
                return; 
            }
        }
        throw new UnauthorizedException(
            "Access denied. Your role (" + user.role() + ") does not have permission. " +
            "Required: " + Arrays.toString(allowedRoles)
        );
    }
}
