package com.clinic.backend.dto.admin;

import com.clinic.backend.model.Role;

public record AdminUserResponse(
        Long id,
        String name,
        String email,
        String phone,
        Role role
) {
}
