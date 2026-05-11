package com.clinic.backend.dto.account;

import com.clinic.backend.model.Role;

public record AccountResponse(
        Long id,
        String name,
        String email,
        String phone,
        Role role
) {
}
