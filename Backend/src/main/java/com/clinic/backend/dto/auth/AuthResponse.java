package com.clinic.backend.dto.auth;

import com.clinic.backend.model.Role;

public record AuthResponse(
        Long userId,
        String name,
        String email,
        String phone,
        Role role
) {
}
