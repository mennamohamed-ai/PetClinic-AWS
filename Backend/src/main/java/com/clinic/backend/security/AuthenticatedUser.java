package com.clinic.backend.security;

import com.clinic.backend.model.Role;

public record AuthenticatedUser(
        Long userId,
        Role role
) {
}
