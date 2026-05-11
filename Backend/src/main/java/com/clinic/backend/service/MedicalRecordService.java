package com.clinic.backend.service;

import com.clinic.backend.dto.medical.CreateMedicalRecordRequest;
import com.clinic.backend.dto.medical.UpdateMedicalRecordRequest;
import com.clinic.backend.exception.ResourceNotFoundException;
import com.clinic.backend.model.MedicalRecord;
import com.clinic.backend.repository.MedicalRecordRepository;
import java.util.List;
import org.springframework.stereotype.Service;

@Service
public class MedicalRecordService {
    private final MedicalRecordRepository medicalRecordRepository;
    private final AppointmentService appointmentService;
    private final PetService petService;
    private final VetService vetService;

    public MedicalRecordService(MedicalRecordRepository medicalRecordRepository,
                                AppointmentService appointmentService,
                                PetService petService, VetService vetService) {
        this.medicalRecordRepository = medicalRecordRepository;
        this.appointmentService = appointmentService;
        this.petService = petService;
        this.vetService = vetService;
    }

    public MedicalRecord create(CreateMedicalRecordRequest request) {
        appointmentService.getById(request.appointmentId());
        petService.getById(request.petId());
        vetService.getById(request.vetId());
        MedicalRecord record = MedicalRecord.builder()
                .appointmentId(request.appointmentId())
                .petId(request.petId()).vetId(request.vetId())
                .diagnosis(request.diagnosis())
                .prescription(request.prescription())
                .notes(request.notes())
                .recordDate(request.recordDate())
                .followUpDate(request.followUpDate())
                .build();
        return medicalRecordRepository.save(record);
    }

    public MedicalRecord update(Long id, UpdateMedicalRecordRequest request) {
        MedicalRecord existing = medicalRecordRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Medical record with id " + id + " was not found."));
        MedicalRecord updated = existing.toBuilder()
                .diagnosis(request.diagnosis())
                .prescription(request.prescription())
                .notes(request.notes())
                .recordDate(request.recordDate())
                .followUpDate(request.followUpDate())
                .build();
        return medicalRecordRepository.save(updated);
    }

    public List<MedicalRecord> getByPetId(Long petId) {
        petService.getById(petId);
        return medicalRecordRepository.findByPetIdOrderByRecordDateDesc(petId);
    }

    public List<MedicalRecord> getByVetId(Long vetId) {
        vetService.getById(vetId);
        return medicalRecordRepository.findByVetIdOrderByRecordDateDesc(vetId);
    }

    public MedicalRecord update() {
        return null;
    }
}