package com.clinic.backend.dto.admin;

import com.clinic.backend.model.Role;
import java.util.Map;

public record RolePermissionsResponse(
        Role role,
        Map<String, Boolean> permissions
) {
}
