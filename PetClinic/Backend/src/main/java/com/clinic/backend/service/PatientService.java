package com.clinic.backend.service;

import com.clinic.backend.dto.auth.RegisterRequest;
import com.clinic.backend.dto.account.UpdateAccountRequest;
import com.clinic.backend.exception.ConflictException;
import com.clinic.backend.exception.ResourceNotFoundException;
import com.clinic.backend.model.Patient;
import com.clinic.backend.model.Role;
import com.clinic.backend.repository.PatientRepository;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class PatientService {

    private final PatientRepository patientRepository;
    private final PasswordEncoder passwordEncoder;

    public List<Patient> getAll() { return patientRepository.findAll(); }

    public Patient getById(Long id) {
        return patientRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Patient with id " + id + " was not found."));
    }

    public Patient getByEmail(String email) {
        return patientRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Patient not found."));
    }

    public Patient register(RegisterRequest request) {
        patientRepository.findByEmail(request.email()).ifPresent(p -> {
            throw new ConflictException("Email is already registered.");
        });
        Patient patient = Patient.builder()
                .name(request.name()).email(request.email())
                .phone(request.phone())
                .password(passwordEncoder.encode(request.password()))
                .role(Role.PET_OWNER).build();
        return patientRepository.save(patient);
    }

    public Patient updateAccount(Long id, UpdateAccountRequest request) {
        Patient current = getById(id);
        return patientRepository.save(current.toBuilder()
                .name(request.name()).phone(request.phone()).build());
    }

    public Patient updateRole(Long id, Role role) {
        Patient current = getById(id);
        return patientRepository.save(current.toBuilder().role(role).build());
    }

    public void delete(Long id) {
        if (!patientRepository.existsById(id))
            throw new ResourceNotFoundException("Patient with id " + id + " was not found.");
        patientRepository.deleteById(id);
    }

    /**
     * [SECURITY FIX] BCrypt-only password check.
     *
     * Removed legacy branches:
     *  - "hashed_*" plain-text comparison — allowed login with seed/dev passwords
     *  - SHA-256 fallback           — weaker than BCrypt, no longer needed
     *
     * All passwords in the system must be BCrypt-encoded ($2a$ / $2b$).
     * Run a one-off migration script on any remaining legacy rows before deploying.
     */
    public boolean matchesPassword(Patient patient, String rawPassword) {
        return passwordEncoder.matches(rawPassword, patient.getPassword());
    }

    public void resetPassword(Long id, String oldPassword, String newPassword) {
        Patient patient = getById(id);
        if (!matchesPassword(patient, oldPassword))
            throw new ConflictException("Old password is incorrect.");
        patientRepository.save(patient.toBuilder()
                .password(passwordEncoder.encode(newPassword)).build());
    }
}