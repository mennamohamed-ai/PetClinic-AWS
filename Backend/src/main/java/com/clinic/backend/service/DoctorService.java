package com.clinic.backend.service;

import com.clinic.backend.exception.ResourceNotFoundException;
import com.clinic.backend.model.Doctor;
import jakarta.annotation.PostConstruct;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicLong;
import org.springframework.stereotype.Service;

@Service
public class DoctorService {
    private final Map<Long, Doctor> doctors = new ConcurrentHashMap<>();
    private final AtomicLong idGenerator = new AtomicLong(0);

    @PostConstruct
    void seedDoctors() {
        addDoctor("Dr. Sarah Ahmed", "Dermatology", "sarah@clinic.com", "+201000000001", "Skin specialist with 9 years of experience.");
        addDoctor("Dr. Omar Hassan", "Cardiology", "omar@clinic.com", "+201000000002", "Focuses on preventive heart care and follow-ups.");
        addDoctor("Dr. Nour Ali", "Pediatrics", "nour@clinic.com", "+201000000003", "Cares for infants and children.");
        addDoctor("Dr. Youssef Adel", "Orthopedics", "youssef@clinic.com", "+201000000004", "Treats bone and joint conditions.");
    }

    public List<Doctor> getAll(String specialty) {
        return doctors.values()
                .stream()
                .filter(d -> specialty == null || specialty.isBlank()
                        || d.getSpecialty().equalsIgnoreCase(specialty))
                .sorted(Comparator.comparing(Doctor::getId))
                .toList();
    }

    public Doctor getById(Long id) {
        Doctor doctor = doctors.get(id);
        if (doctor == null) {
            throw new ResourceNotFoundException("Doctor with id " + id + " was not found.");
        }
        return doctor;
    }

    private void addDoctor(String fullName, String specialty, String email, String phone, String bio) {
        long id = idGenerator.incrementAndGet();
        doctors.put(id, Doctor.builder()
                .id(id)
                .fullName(fullName)
                .specialty(specialty)
                .email(email)
                .phone(phone)
                .bio(bio)
                .build());
    }
}
