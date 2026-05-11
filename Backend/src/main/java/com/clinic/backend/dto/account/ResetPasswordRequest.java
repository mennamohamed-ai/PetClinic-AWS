package com.clinic.backend.dto.account;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

/**
 * ✅ Password Validation — يطبق قواعد الباسورد القوي
 */
public record ResetPasswordRequest(
        @NotBlank String oldPassword,
        @NotBlank
        @Size(min = 8, max = 100)
        @Pattern(
                regexp = "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[^A-Za-z\\d]).+$",
                message = "newPassword must include upper, lower, number, and special character"
        ) String newPassword
) {}
