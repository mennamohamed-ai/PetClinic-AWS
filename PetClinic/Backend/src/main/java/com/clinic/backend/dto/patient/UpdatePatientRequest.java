package com.clinic.backend.dto.patient;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record UpdatePatientRequest(
        @NotBlank @Size(min = 3, max = 80) String fullName,
        @NotBlank @Size(min = 8, max = 20) String phone
) {
}
