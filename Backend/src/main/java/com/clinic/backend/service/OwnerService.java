package com.clinic.backend.service;

import com.clinic.backend.dto.owner.CreateOwnerRequest;
import com.clinic.backend.dto.owner.UpdateOwnerRequest;
import com.clinic.backend.exception.ResourceNotFoundException;
import com.clinic.backend.model.Owner;
import com.clinic.backend.repository.OwnerRepository;
import java.util.List;
import org.springframework.stereotype.Service;

@Service
public class OwnerService {
    private final OwnerRepository ownerRepository;
    private final PatientService patientService;

    public OwnerService(OwnerRepository ownerRepository, PatientService patientService) {
        this.ownerRepository = ownerRepository;
        this.patientService = patientService;
    }

    public Owner create(CreateOwnerRequest request) {
        Owner owner = Owner.builder()
                .userId(request.userId()).phone(request.phone())
                .address(request.address()).city(request.city())
                .name(request.name()).build();
        return ownerRepository.save(owner);
    }

    public Owner getById(Long id) {
        return ownerRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Owner with id " + id + " was not found."));
    }

    /** يجيب الـ owner record بناءً على الـ userId من الـ users table */
    public Owner getByUserId(Long userId) {
        return ownerRepository.findByUserId(userId).orElseGet(() -> {
            // Auto-provision a minimal owner profile for newly registered PET_OWNER users.
            // Frontend expects /owners/me to work immediately after registration/login.
            var patient = patientService.getById(userId);
            Owner owner = Owner.builder()
                    .userId(userId)
                    .phone(patient.getPhone() == null || patient.getPhone().isBlank() ? "N/A" : patient.getPhone())
                    .address("N/A")
                    .city("N/A")
                    .build();
            return ownerRepository.save(owner);
        });
    }

    public List<Owner> getAll() { return ownerRepository.findAll(); }

    public Owner updateByUserId(Long userId, UpdateOwnerRequest request) {
        Owner existing = getByUserId(userId); // may auto-provision
        Owner updated = existing.toBuilder()
                .name(request.name())
                .phone(request.phone())
                .address(request.address())
                .city(request.city())
                .build();
        return ownerRepository.save(updated);
    }

    public String displayName(Owner owner) {
        return owner.getName() == null || owner.getName().isBlank()
                ? "Owner-" + owner.getId() : owner.getName();
    }
}