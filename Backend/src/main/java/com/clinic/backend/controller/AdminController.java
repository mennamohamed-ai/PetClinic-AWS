package com.clinic.backend.controller;

import com.clinic.backend.dto.admin.AdminUserResponse;
import com.clinic.backend.dto.admin.ReportSummaryResponse;
import com.clinic.backend.dto.admin.RolePermissionsResponse;
import com.clinic.backend.dto.admin.UpdateUserRoleRequest;
import com.clinic.backend.dto.admin.UpdatePermissionRequest;
import com.clinic.backend.dto.appointment.AppointmentResponse;
import com.clinic.backend.dto.invoice.InvoiceResponse;
import com.clinic.backend.model.*;
import com.clinic.backend.security.AuthGuard;
import com.clinic.backend.security.AuthenticatedUser;
import com.clinic.backend.security.RoleGuard;
import com.clinic.backend.service.*;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    private final PatientService patientService;
    private final AppointmentService appointmentService;
    private final InvoiceService invoiceService;
    private final OwnerService ownerService;
    private final PetService petService;
    private final VetService vetService;
    private final DashboardPermissionService dashboardPermissionService;
    private final AuthGuard authGuard;
    private final RoleGuard roleGuard;

    public AdminController(PatientService patientService, AppointmentService appointmentService,
                           InvoiceService invoiceService, OwnerService ownerService,
                           PetService petService, VetService vetService,
                           DashboardPermissionService dashboardPermissionService,
                           AuthGuard authGuard, RoleGuard roleGuard) {
        this.patientService = patientService;
        this.appointmentService = appointmentService;
        this.invoiceService = invoiceService;
        this.ownerService = ownerService;
        this.petService = petService;
        this.vetService = vetService;
        this.dashboardPermissionService = dashboardPermissionService;
        this.authGuard = authGuard;
        this.roleGuard = roleGuard;
    }

    private AuthenticatedUser requireAdmin(HttpServletRequest request) {
        AuthenticatedUser user = authGuard.requireAuthenticatedUser(request);
        roleGuard.requireRole(user, Role.ADMIN);
        return user;
    }

    @GetMapping("/reports/summary")
    public ReportSummaryResponse getSummary(HttpServletRequest request) {
        AuthenticatedUser user = requireAdmin(request);
        dashboardPermissionService.requireEnabled(user, "ADMIN_TAB_SUMMARY");
        var appointments = appointmentService.getAll();
        var invoices     = invoiceService.getAll();
        var patients     = patientService.getAll();
        long pending   = appointments.stream().filter(a -> a.getStatus() == AppointmentStatus.PENDING).count();
        long completed = appointments.stream().filter(a ->
                a.getStatus() == AppointmentStatus.COMPLETED || a.getStatus() == AppointmentStatus.DONE
        ).count();
        long cancelled = appointments.stream().filter(a -> a.getStatus() == AppointmentStatus.CANCELLED).count();
        double revenue = invoices.stream()
                .filter(i -> i.getStatus() != null && i.getStatus() == InvoiceStatus.PAID)
                .mapToDouble(i -> i.getAmount() != null ? i.getAmount() : 0).sum();
        return new ReportSummaryResponse(patients.size(), appointments.size(),
                pending, completed, cancelled, invoices.size(), revenue);
    }

    @GetMapping("/reports/appointments")
    public List<AppointmentResponse> getAllAppointments(HttpServletRequest request) {
        AuthenticatedUser user = requireAdmin(request);
        dashboardPermissionService.requireEnabled(user, "ADMIN_TAB_APPOINTMENTS");
        return appointmentService.getAll().stream().map(a -> {
            String ownerName = ownerService.displayName(ownerService.getById(a.getOwnerId()));
            String petName   = petService.getById(a.getPetId()).getName();
            String vetName   = vetService.getById(a.getVetId()).getName();
            return new AppointmentResponse(a.getId(), a.getOwnerId(), ownerName,
                    a.getPetId(), petName, a.getVetId(), vetName,
                    a.getAppointmentDate(), a.getStartTime(), a.getEndTime(),
                    a.getReason(), a.getStatus(), a.getCreatedAt());
        }).toList();
    }

    @GetMapping("/reports/invoices")
    public List<InvoiceResponse> getAllInvoices(HttpServletRequest request) {
        AuthenticatedUser user = requireAdmin(request);
        dashboardPermissionService.requireEnabled(user, "ADMIN_TAB_INVOICES");
        return invoiceService.getAll().stream()
                .map(i -> new InvoiceResponse(i.getId(), i.getAppointmentId(), i.getOwnerId(),
                        i.getAmount(), i.getStatus(), i.getIssuedAt(), i.getPaidAt()))
                .toList();
    }

    @GetMapping("/users")
    public List<AdminUserResponse> getAllUsers(HttpServletRequest request) {
        AuthenticatedUser user = requireAdmin(request);
        dashboardPermissionService.requireEnabled(user, "ADMIN_TAB_USERS");
        return patientService.getAll().stream()
                .map(p -> new AdminUserResponse(
                        p.getId(), p.getName(), p.getEmail(), p.getPhone(), p.getRole()))
                .toList();
    }

    @PutMapping("/users/{id}/role")
    public AdminUserResponse updateUserRole(
            @PathVariable Long id,
            @Valid @RequestBody UpdateUserRoleRequest body,
            HttpServletRequest request
    ) {
        AuthenticatedUser currentAdmin = requireAdmin(request);
        dashboardPermissionService.requireEnabled(currentAdmin, "ADMIN_TAB_USERS");
        if (currentAdmin.userId().equals(id)) {
            throw new com.clinic.backend.exception.ConflictException("Admin cannot change their own role.");
        }

        Patient updated = patientService.updateRole(id, body.role());
        return new AdminUserResponse(
                updated.getId(),
                updated.getName(),
                updated.getEmail(),
                updated.getPhone(),
                updated.getRole()
        );
    }

    @GetMapping("/permissions")
    public List<RolePermissionsResponse> getPermissions(HttpServletRequest request) {
        AuthenticatedUser user = requireAdmin(request);
        dashboardPermissionService.requireEnabled(user, "ADMIN_TAB_PERMISSIONS");
        return dashboardPermissionService.getAllByRole().entrySet().stream()
                .map(entry -> new RolePermissionsResponse(entry.getKey(), entry.getValue()))
                .toList();
    }

    @PutMapping("/permissions/{role}/{permissionKey}")
    public RolePermissionsResponse updatePermission(
            @PathVariable Role role,
            @PathVariable String permissionKey,
            @Valid @RequestBody UpdatePermissionRequest body,
            HttpServletRequest request
    ) {
        AuthenticatedUser user = requireAdmin(request);
        dashboardPermissionService.requireEnabled(user, "ADMIN_TAB_PERMISSIONS");
        dashboardPermissionService.updatePermission(role, permissionKey, body.enabled());
        return new RolePermissionsResponse(role, dashboardPermissionService.getPermissionsForRole(role));
    }
}