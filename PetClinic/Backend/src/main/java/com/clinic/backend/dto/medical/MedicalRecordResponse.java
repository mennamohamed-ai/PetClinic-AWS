package com.clinic.backend.dto.medical;

import java.time.LocalDate;

public record MedicalRecordResponse(
        Long id,
        Long appointmentId,
        Long petId,
        Long vetId,
        String diagnosis,
        String prescription,
        String notes,
        LocalDate recordDate,
        LocalDate followUpDate
) {
}
