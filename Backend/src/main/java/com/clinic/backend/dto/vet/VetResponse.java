package com.clinic.backend.dto.vet;

import com.clinic.backend.model.AnimalType;

public record VetResponse(
        Long id,
        String name,
        String phone,
        String city,
        String address,
        String specialization,
        AnimalType animalType,
        Double consultationFee,
        Double rating,
        Integer experienceYears,
        String availableDays,
        String bio,
        boolean available
) {
}
