package com.clinic.backend.controller;

import com.clinic.backend.dto.medical.CreateMedicalRecordRequest;
import com.clinic.backend.dto.medical.MedicalRecordResponse;
import com.clinic.backend.dto.medical.UpdateMedicalRecordRequest;
import com.clinic.backend.model.MedicalRecord;
import com.clinic.backend.model.Role;
import com.clinic.backend.security.AuthGuard;
import com.clinic.backend.security.AuthenticatedUser;
import com.clinic.backend.security.RoleGuard;
import com.clinic.backend.service.DashboardPermissionService;
import com.clinic.backend.service.MedicalRecordService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/medical-records")
public class MedicalRecordController {

    private final MedicalRecordService medicalRecordService;
    private final DashboardPermissionService dashboardPermissionService;
    private final AuthGuard authGuard;
    private final RoleGuard roleGuard;

    public MedicalRecordController(MedicalRecordService medicalRecordService,
                                   DashboardPermissionService dashboardPermissionService,
                                   AuthGuard authGuard, RoleGuard roleGuard) {
        this.medicalRecordService = medicalRecordService;
        this.dashboardPermissionService = dashboardPermissionService;
        this.authGuard = authGuard;
        this.roleGuard = roleGuard;
    }

    /** VET يضيف visit documentation */
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public MedicalRecordResponse create(HttpServletRequest request,
                                        @Valid @RequestBody CreateMedicalRecordRequest body) {
        AuthenticatedUser user = authGuard.requireAuthenticatedUser(request);
        roleGuard.requireRole(user, Role.VET, Role.ADMIN);
        if (user.role() == Role.VET) {
            dashboardPermissionService.requireEnabled(user, "VET_TAB_RECORDS");
        } else {
            dashboardPermissionService.requireEnabled(user, "ADMIN_TAB_APPOINTMENTS");
        }
        return toResponse(medicalRecordService.create(body));
    }

    /** VET يعدّل medical record */
    @PutMapping("/{id}")
    public MedicalRecordResponse update(@PathVariable Long id,
                                        HttpServletRequest request,
                                        @Valid @RequestBody com.clinic.backend.controller.UpdateMedicalRecordRequest body) {
        AuthenticatedUser user = authGuard.requireAuthenticatedUser(request);
        roleGuard.requireRole(user, Role.VET, Role.ADMIN);
        if (user.role() == Role.VET) {
            dashboardPermissionService.requireEnabled(user, "VET_TAB_RECORDS");
        } else {
            dashboardPermissionService.requireEnabled(user, "ADMIN_TAB_APPOINTMENTS");
        }
        return toResponse(medicalRecordService.update());
    }

    /** Records لـ pet معين */
    @GetMapping("/pet/{petId}")
    public List<MedicalRecordResponse> getByPet(@PathVariable Long petId,
                                                HttpServletRequest request) {
        AuthenticatedUser user = authGuard.requireAuthenticatedUser(request);
        roleGuard.requireRole(user, Role.PET_OWNER, Role.VET, Role.ADMIN, Role.RECEPTIONIST);
        return medicalRecordService.getByPetId(petId).stream().map(this::toResponse).toList();
    }

    /** كل records الـ vet — للـ DoctorHome */
    @GetMapping("/vet/{vetId}")
    public List<MedicalRecordResponse> getByVet(@PathVariable Long vetId,
                                                HttpServletRequest request) {
        AuthenticatedUser user = authGuard.requireAuthenticatedUser(request);
        roleGuard.requireRole(user, Role.VET, Role.ADMIN);
        if (user.role() == Role.VET) {
            dashboardPermissionService.requireEnabled(user, "VET_TAB_RECORDS");
        } else {
            dashboardPermissionService.requireEnabled(user, "ADMIN_TAB_APPOINTMENTS");
        }
        return medicalRecordService.getByVetId(vetId).stream().map(this::toResponse).toList();
    }

    private MedicalRecordResponse toResponse(MedicalRecord r) {
        return new MedicalRecordResponse(r.getId(), r.getAppointmentId(), r.getPetId(),
                r.getVetId(), r.getDiagnosis(), r.getPrescription(), r.getNotes(),
                r.getRecordDate(), r.getFollowUpDate());
    }
}
