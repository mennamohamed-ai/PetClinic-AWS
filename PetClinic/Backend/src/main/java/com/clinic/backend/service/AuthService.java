package com.clinic.backend.service;

import com.clinic.backend.dto.auth.AuthResponse;
import com.clinic.backend.dto.auth.LoginRequest;
import com.clinic.backend.dto.auth.RegisterRequest;
import com.clinic.backend.exception.ResourceNotFoundException;
import com.clinic.backend.exception.UnauthorizedException;
import com.clinic.backend.model.Patient;
import org.springframework.stereotype.Service;

@Service
public class AuthService {
    private final PatientService patientService;

    public AuthService(PatientService patientService) {
        this.patientService = patientService;
    }

    public AuthResponse register(RegisterRequest request) {
        Patient patient = patientService.register(request);
        return toResponse(patient);
    }

    /**
     * [SECURITY FIX] Email enumeration prevention.
     *
     * Previously, a missing email threw ResourceNotFoundException with the message
     * "Patient with email X was not found" — leaking which emails are registered.
     *
     * Now both "email not found" and "wrong password" return the same generic
     * UnauthorizedException("Invalid credentials.") so an attacker cannot
     * distinguish between the two cases.
     */
    public AuthResponse login(LoginRequest request) {
        try {
            Patient patient = patientService.getByEmail(request.email());
            if (!patientService.matchesPassword(patient, request.password())) {
                throw new UnauthorizedException("Invalid credentials.");
            }
            return toResponse(patient);
        } catch (ResourceNotFoundException ex) {
            // [SECURITY] Do NOT propagate the "not found" message — it reveals
            // whether the email exists. Return the same generic error as a wrong password.
            throw new UnauthorizedException("Invalid credentials.");
        }
    }

    private AuthResponse toResponse(Patient patient) {
        return new AuthResponse(
                patient.getId(),
                patient.getName(),
                patient.getEmail(),
                patient.getPhone(),
                patient.getRole()
        );
    }
}