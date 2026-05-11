package com.clinic.backend.dto.medical;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;

public record UpdateMedicalRecordRequest(
        @NotBlank String diagnosis,
        @NotBlank String prescription,
        String notes,
        @NotNull LocalDate recordDate,
        LocalDate followUpDate
) {}