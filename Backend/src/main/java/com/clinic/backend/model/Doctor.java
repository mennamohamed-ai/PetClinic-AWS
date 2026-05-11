package com.clinic.backend.model;

import lombok.Builder;
import lombok.Value;

@Value
@Builder(toBuilder = true)
public class Doctor {
    Long id;
    String fullName;
    String specialty;
    String email;
    String phone;
    String bio;
}
