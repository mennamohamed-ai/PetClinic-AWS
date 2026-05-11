package com.clinic.backend.model;

public enum AppointmentStatus {
    PENDING,
    CONFIRMED,
    // DB seed uses DONE; keep both to avoid breaking existing data.
    DONE,
    COMPLETED,
    CANCELLED
}