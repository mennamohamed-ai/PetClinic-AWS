package com.clinic.backend.service;

import com.clinic.backend.exception.ConflictException;
import com.clinic.backend.exception.UnauthorizedException;
import com.clinic.backend.model.Role;
import com.clinic.backend.security.AuthenticatedUser;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ConcurrentMap;
import org.springframework.stereotype.Service;

@Service
public class DashboardPermissionService {
    private static final List<String> SUPPORTED_KEYS = List.of(
            "ADMIN_TAB_SUMMARY",
            "ADMIN_TAB_VETS",
            "ADMIN_TAB_APPOINTMENTS",
            "ADMIN_TAB_INVOICES",
            "ADMIN_TAB_USERS",
            "ADMIN_TAB_PERMISSIONS",
            "RECEPTIONIST_TAB_APPOINTMENTS",
            "RECEPTIONIST_TAB_OWNERS",
            "RECEPTIONIST_TAB_INVOICES",
            "OWNER_TAB_APPOINTMENTS",
            "OWNER_TAB_BILLING",
            "OWNER_TAB_PROFILE",
            "VET_TAB_TODAY",
            "VET_TAB_ALL",
            "VET_TAB_RECORDS"
    );

    private final Map<Role, Map<String, Boolean>> defaults;
    private final ConcurrentMap<Role, ConcurrentMap<String, Boolean>> overrides = new ConcurrentHashMap<>();

    public DashboardPermissionService() {
        defaults = Map.of(
                Role.RECEPTIONIST, mapOf(
                        "RECEPTIONIST_TAB_APPOINTMENTS", true,
                        "RECEPTIONIST_TAB_OWNERS", true,
                        "RECEPTIONIST_TAB_INVOICES", true
                ),
                Role.PET_OWNER, mapOf(
                        "OWNER_TAB_APPOINTMENTS", true,
                        "OWNER_TAB_BILLING", true,
                        "OWNER_TAB_PROFILE", true
                ),
                Role.VET, mapOf(
                        "VET_TAB_TODAY", true,
                        "VET_TAB_ALL", true,
                        "VET_TAB_RECORDS", true
                ),
                Role.ADMIN, mapOf(
                        "ADMIN_TAB_SUMMARY", true,
                        "ADMIN_TAB_VETS", true,
                        "ADMIN_TAB_APPOINTMENTS", true,
                        "ADMIN_TAB_INVOICES", true,
                        "ADMIN_TAB_USERS", true,
                        "ADMIN_TAB_PERMISSIONS", true
                )
        );
    }

    public Map<String, Boolean> getPermissionsForRole(Role role) {
        Map<String, Boolean> result = new LinkedHashMap<>();
        for (String key : SUPPORTED_KEYS) {
            result.put(key, false);
        }
        result.putAll(defaults.getOrDefault(role, Map.of()));
        result.putAll(overrides.getOrDefault(role, new ConcurrentHashMap<>()));
        return result;
    }

    public Map<Role, Map<String, Boolean>> getAllByRole() {
        Map<Role, Map<String, Boolean>> result = new LinkedHashMap<>();
        for (Role role : Role.values()) {
            result.put(role, getPermissionsForRole(role));
        }
        return result;
    }

    public void updatePermission(Role role, String permissionKey, boolean enabled) {
        if (!SUPPORTED_KEYS.contains(permissionKey)) {
            throw new ConflictException("Unsupported permission key: " + permissionKey);
        }
        overrides.computeIfAbsent(role, r -> new ConcurrentHashMap<>()).put(permissionKey, enabled);
    }

    public boolean isEnabled(Role role, String permissionKey) {
        if (!SUPPORTED_KEYS.contains(permissionKey)) {
            return false;
        }
        return getPermissionsForRole(role).getOrDefault(permissionKey, false);
    }

    public void requireEnabled(AuthenticatedUser user, String permissionKey) {
        if (!isEnabled(user.role(), permissionKey)) {
            throw new UnauthorizedException("Access denied. Permission is disabled by admin.");
        }
    }

    private static Map<String, Boolean> mapOf(Object... pairs) {
        Map<String, Boolean> map = new LinkedHashMap<>();
        for (int i = 0; i < pairs.length; i += 2) {
            map.put((String) pairs[i], (Boolean) pairs[i + 1]);
        }
        return map;
    }
}
