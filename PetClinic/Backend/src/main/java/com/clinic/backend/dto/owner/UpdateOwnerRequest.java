package com.clinic.backend.dto.owner;

import jakarta.validation.constraints.NotBlank;

public record UpdateOwnerRequest(
        @NotBlank String name,
        @NotBlank String phone,
        @NotBlank String address,
        @NotBlank String city
) {
}

