package com.clinic.backend.dto.appointment;

import com.clinic.backend.model.AppointmentStatus;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

public record AppointmentResponse(
        Long id,
        Long ownerId,
        String ownerName,
        Long petId,
        String petName,
        Long vetId,
        String vetName,
        LocalDate appointmentDate,
        LocalTime startTime,
        LocalTime endTime,
        String reason,
        AppointmentStatus status,
        LocalDateTime createdAt
) {
}
