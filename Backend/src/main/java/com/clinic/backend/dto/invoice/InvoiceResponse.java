package com.clinic.backend.dto.invoice;

import com.clinic.backend.model.InvoiceStatus;
import java.time.LocalDateTime;

public record InvoiceResponse(
        Long id,
        Long appointmentId,
        Long ownerId,
        Double amount,
        InvoiceStatus status,
        LocalDateTime issuedAt,
        LocalDateTime paidAt
) {
}
