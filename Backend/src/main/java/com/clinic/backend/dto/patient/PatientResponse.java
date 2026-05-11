package com.clinic.backend.dto.patient;

public record PatientResponse(
        Long id,
        String name,
        String email,
        String phone,
        String password
) {
}
