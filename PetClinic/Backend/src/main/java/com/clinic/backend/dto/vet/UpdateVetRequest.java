package com.clinic.backend.dto.vet;

import jakarta.validation.constraints.*;

public record UpdateVetRequest(
        @NotBlank String name,
        @NotBlank String phone,
        @NotBlank String city,
        @NotBlank String address,
        @NotBlank String specialization,
        @NotNull @Positive Double consultationFee,
        @NotNull @Min(0) @Max(5) Double rating,
        @NotNull @Min(0) Integer experienceYears,
        @NotBlank String availableDays,
        @NotBlank String bio,
        boolean available
) {}