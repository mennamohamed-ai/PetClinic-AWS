package com.clinic.backend.dto.pet;

import com.clinic.backend.model.AnimalType;
import com.clinic.backend.model.Gender;
import java.time.LocalDate;

public record PetResponse(
        Long id,
        Long ownerId,
        String ownerName,
        String name,
        AnimalType type,
        String breed,
        LocalDate birthDate,
        Gender gender,
        Double weight
) {
}
