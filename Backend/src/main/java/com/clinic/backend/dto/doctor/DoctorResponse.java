package com.clinic.backend.dto.doctor;

public record DoctorResponse(
        Long id,
        String fullName,
        String specialty,
        String email,
        String phone,
        String bio
) {
}
