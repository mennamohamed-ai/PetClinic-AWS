package com.clinic.backend.dto.appointment;

import com.clinic.backend.model.AppointmentStatus;
import jakarta.validation.constraints.NotNull;

public record UpdateAppointmentStatusRequest(
        @NotNull AppointmentStatus status
) {
}
