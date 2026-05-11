package com.clinic.backend.dto.appointment;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;
import java.time.LocalTime;

public record BookAppointmentRequest(
        @NotNull Long ownerId,
        @NotNull Long petId,
        @NotNull Long vetId,
        @NotNull LocalDate appointmentDate,
        @NotNull LocalTime startTime,
        @NotNull LocalTime endTime,
        @NotBlank String reason
) {
}
