package com.clinic.backend.dto.admin;

public record ReportSummaryResponse(
        long totalUsers,
        long totalAppointments,
        long pendingAppointments,
        long completedAppointments,
        long cancelledAppointments,
        long totalInvoices,
        double totalRevenue
) {}