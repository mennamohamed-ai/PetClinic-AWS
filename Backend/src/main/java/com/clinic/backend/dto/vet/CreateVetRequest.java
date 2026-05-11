package com.clinic.backend.dto.vet;

import com.clinic.backend.model.AnimalType;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.PositiveOrZero;

public record CreateVetRequest(
        @NotNull @PositiveOrZero Long userId,
        @NotBlank String name,
        @NotBlank String phone,
        @NotBlank String city,
        @NotBlank String address,
        @NotBlank String specialization,
        @NotNull AnimalType animalType,
        @NotNull @Positive Double consultationFee,
        @NotNull @Min(0) @Max(5) Double rating,
        @NotNull @Min(0) Integer experienceYears,
        @NotBlank String availableDays,
        @NotBlank String bio,
        boolean available
) {
}
