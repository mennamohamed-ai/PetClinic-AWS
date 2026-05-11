package com.clinic.backend.dto.owner;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record CreateOwnerRequest(
        @NotNull Long userId,
        @NotBlank String name,
        @NotBlank String phone,
        @NotBlank String address,
        @NotBlank String city
) {
}
