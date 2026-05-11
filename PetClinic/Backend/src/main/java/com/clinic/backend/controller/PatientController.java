package com.clinic.backend.controller;

import com.clinic.backend.dto.patient.PatientResponse;
import com.clinic.backend.model.Patient;
import com.clinic.backend.model.Role;
import com.clinic.backend.security.AuthGuard;
import com.clinic.backend.security.AuthenticatedUser;
import com.clinic.backend.security.RoleGuard;
import com.clinic.backend.service.PatientService;
import jakarta.servlet.http.HttpServletRequest;
import java.util.List;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/patients")
public class PatientController {

    private final PatientService patientService;
    private final AuthGuard authGuard;
    private final RoleGuard roleGuard;

    public PatientController(PatientService patientService, AuthGuard authGuard, RoleGuard roleGuard) {
        this.patientService = patientService;
        this.authGuard = authGuard;
        this.roleGuard = roleGuard;
    }

    // ✅ بس ADMIN يشوف كل المرضى
    @GetMapping
    public List<PatientResponse> getAll(HttpServletRequest request) {
        AuthenticatedUser currentUser = authGuard.requireAuthenticatedUser(request);
        roleGuard.requireRole(currentUser, Role.ADMIN);
        return patientService.getAll().stream().map(this::toResponse).toList();
    }

    // ✅ بس ADMIN أو صاحب الأكاونت يشوف بياناته
    @GetMapping("/{id}")
    public PatientResponse getById(@PathVariable Long id, HttpServletRequest request) {
        AuthenticatedUser currentUser = authGuard.requireAuthenticatedUser(request);
        if (!currentUser.userId().equals(id) && currentUser.role() != Role.ADMIN) {
            throw new com.clinic.backend.exception.UnauthorizedException(
                "You can only view your own profile.");
        }
        // ✅ لاحظ: مش بنرجع الباسورد في الـ response
        return toResponse(patientService.getById(id));
    }

    private PatientResponse toResponse(Patient patient) {
        // ✅ مش بنبعت الباسورد للـ client أبداً
        return new PatientResponse(patient.getId(), patient.getName(),
                patient.getEmail(), patient.getPhone(), null);
    }
}
