package com.clinic.backend.dto.admin;

import com.clinic.backend.model.Role;
import jakarta.validation.constraints.NotNull;

public record UpdateUserRoleRequest(
        @NotNull Role role
) {
}
