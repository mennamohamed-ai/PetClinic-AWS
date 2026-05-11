package com.clinic.backend.dto.invoice;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

public record CreateInvoiceRequest(
        @NotNull Long appointmentId,
        @NotNull Long ownerId,
        @NotNull @Positive Double amount
) {
}
