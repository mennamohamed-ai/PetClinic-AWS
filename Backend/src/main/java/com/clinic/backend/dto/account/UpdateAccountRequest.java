package com.clinic.backend.dto.account;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record UpdateAccountRequest(
        @NotBlank @Size(min = 3, max = 80) String name,
        @NotBlank @Size(min = 8, max = 20) String phone
) {
}
