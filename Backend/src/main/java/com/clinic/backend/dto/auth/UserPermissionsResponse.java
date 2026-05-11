package com.clinic.backend.dto.auth;

import com.clinic.backend.model.Role;
import java.util.Map;

public record UserPermissionsResponse(
        Role role,
        Map<String, Boolean> permissions
) {
}
