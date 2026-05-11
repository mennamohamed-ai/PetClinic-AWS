package com.clinic.backend.service;

import com.clinic.backend.dto.appointment.BookAppointmentRequest;
import com.clinic.backend.exception.ConflictException;
import com.clinic.backend.exception.ResourceNotFoundException;
import com.clinic.backend.model.Appointment;
import com.clinic.backend.model.AppointmentStatus;
import com.clinic.backend.repository.AppointmentRepository;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import org.springframework.stereotype.Service;

@Service
public class AppointmentService {
    private final AppointmentRepository appointmentRepository;
    private final OwnerService ownerService;
    private final PetService petService;
    private final VetService vetService;

    public AppointmentService(AppointmentRepository appointmentRepository,
                              OwnerService ownerService, PetService petService,
                              VetService vetService) {
        this.appointmentRepository = appointmentRepository;
        this.ownerService = ownerService;
        this.petService = petService;
        this.vetService = vetService;
    }

    public List<Appointment> getAll() { return appointmentRepository.findAll(); }

    public Appointment book(BookAppointmentRequest request) {
        ownerService.getById(request.ownerId());
        petService.getById(request.petId());
        vetService.getById(request.vetId());

        if (!request.startTime().isBefore(request.endTime()))
            throw new ConflictException("startTime must be before endTime.");

        boolean hasConflict = appointmentRepository.hasConflict(
                request.vetId(), request.appointmentDate(),
                request.startTime(), request.endTime(), AppointmentStatus.CANCELLED);
        if (hasConflict)
            throw new ConflictException("Selected time conflicts with another appointment.");

        Appointment appointment = Appointment.builder()
                .ownerId(request.ownerId()).petId(request.petId()).vetId(request.vetId())
                .appointmentDate(request.appointmentDate())
                .startTime(request.startTime()).endTime(request.endTime())
                .reason(request.reason())
                .status(AppointmentStatus.PENDING)
                .createdAt(LocalDateTime.now())
                .build();
        return appointmentRepository.save(appointment);
    }

    public List<Appointment> getByVetAndDate(Long vetId, LocalDate date) {
        vetService.getById(vetId);
        if (date == null)
            return appointmentRepository.findAll().stream()
                    .filter(a -> a.getVetId().equals(vetId)).toList();
        return appointmentRepository.findByVetIdAndAppointmentDateOrderByStartTimeAsc(vetId, date);
    }

    /** كل appointments الـ vet بدون date filter — لصفحة المرضى */
    public List<Appointment> getAllByVetId(Long vetId) {
        vetService.getById(vetId);
        return appointmentRepository.findByVetIdOrderByAppointmentDateDescStartTimeAsc(vetId);
    }

    public List<Appointment> getByOwner(Long ownerId) {
        ownerService.getById(ownerId);
        return appointmentRepository.findByOwnerIdOrderByAppointmentDateAscStartTimeAsc(ownerId);
    }

    public Appointment updateStatus(Long id, AppointmentStatus status) {
        Appointment appointment = getById(id);
        appointment.setStatus(status);
        return appointmentRepository.save(appointment);
    }

    public Appointment cancel(Long id) { return updateStatus(id, AppointmentStatus.CANCELLED); }

    public Appointment getById(Long id) {
        return appointmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Appointment with id " + id + " was not found."));
    }
}