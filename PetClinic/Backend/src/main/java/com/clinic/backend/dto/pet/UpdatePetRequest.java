package com.clinic.backend.dto.pet;

import com.clinic.backend.model.AnimalType;
import com.clinic.backend.model.Gender;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PastOrPresent;
import jakarta.validation.constraints.Positive;
import java.time.LocalDate;

public record UpdatePetRequest(
        @NotBlank String name,
        @NotNull AnimalType type,
        @NotBlank String breed,
        @NotNull @PastOrPresent LocalDate birthDate,
        @NotNull Gender gender,
        @NotNull @Positive Double weight
) {
}

