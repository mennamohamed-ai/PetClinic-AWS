package com.clinic.backend.dto.admin;

import jakarta.validation.constraints.NotNull;

public record UpdatePermissionRequest(
        @NotNull Boolean enabled
) {
}
