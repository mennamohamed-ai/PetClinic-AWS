package com.clinic.backend.controller;

import com.clinic.backend.dto.appointment.AppointmentResponse;
import com.clinic.backend.dto.appointment.BookAppointmentRequest;
import com.clinic.backend.dto.appointment.UpdateAppointmentStatusRequest;
import com.clinic.backend.exception.UnauthorizedException;
import com.clinic.backend.model.Appointment;
import com.clinic.backend.model.Role;
import com.clinic.backend.security.AuthGuard;
import com.clinic.backend.security.AuthenticatedUser;
import com.clinic.backend.security.RoleGuard;
import com.clinic.backend.service.AppointmentService;
import com.clinic.backend.service.DashboardPermissionService;
import com.clinic.backend.service.OwnerService;
import com.clinic.backend.service.PetService;
import com.clinic.backend.service.VetService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import java.time.LocalDate;
import java.util.List;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/appointments")
public class AppointmentController {

    private final AppointmentService appointmentService;
    private final OwnerService ownerService;
    private final PetService petService;
    private final VetService vetService;
    private final DashboardPermissionService dashboardPermissionService;
    private final AuthGuard authGuard;
    private final RoleGuard roleGuard;

    public AppointmentController(AppointmentService appointmentService,
                                 OwnerService ownerService, PetService petService,
                                 VetService vetService, DashboardPermissionService dashboardPermissionService,
                                 AuthGuard authGuard, RoleGuard roleGuard) {
        this.appointmentService = appointmentService;
        this.ownerService = ownerService;
        this.petService = petService;
        this.vetService = vetService;
        this.dashboardPermissionService = dashboardPermissionService;
        this.authGuard = authGuard;
        this.roleGuard = roleGuard;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public AppointmentResponse book(HttpServletRequest request,
                                    @Valid @RequestBody BookAppointmentRequest body) {
        AuthenticatedUser user = authGuard.requireAuthenticatedUser(request);
        roleGuard.requireRole(user, Role.PET_OWNER, Role.RECEPTIONIST);
        if (user.role() == Role.PET_OWNER) {
            dashboardPermissionService.requireEnabled(user, "OWNER_TAB_APPOINTMENTS");
            Long currentUserOwnerId = ownerService.getByUserId(user.userId()).getId();
            if (!currentUserOwnerId.equals(body.ownerId())) {
                throw new UnauthorizedException("Access denied. You can only book appointments for your own profile.");
            }
        } else {
            dashboardPermissionService.requireEnabled(user, "RECEPTIONIST_TAB_APPOINTMENTS");
        }
        return toResponse(appointmentService.book(body));
    }

    @GetMapping("/vet/{vetId}")
    public List<AppointmentResponse> getVetAppointments(
            @PathVariable Long vetId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
            HttpServletRequest request) {
        AuthenticatedUser user = authGuard.requireAuthenticatedUser(request);
        roleGuard.requireRole(user, Role.VET, Role.ADMIN, Role.RECEPTIONIST);
        if (user.role() == Role.VET) {
            dashboardPermissionService.requireEnabled(user, date == null ? "VET_TAB_ALL" : "VET_TAB_TODAY");
        } else if (user.role() == Role.RECEPTIONIST) {
            dashboardPermissionService.requireEnabled(user, "RECEPTIONIST_TAB_APPOINTMENTS");
        } else {
            dashboardPermissionService.requireEnabled(user, "ADMIN_TAB_APPOINTMENTS");
        }
        return appointmentService.getByVetAndDate(vetId, date).stream().map(this::toResponse).toList();
    }

    @GetMapping("/vet/{vetId}/all")
    public List<AppointmentResponse> getAllVetAppointments(
            @PathVariable Long vetId, HttpServletRequest request) {
        AuthenticatedUser user = authGuard.requireAuthenticatedUser(request);
        roleGuard.requireRole(user, Role.VET, Role.ADMIN, Role.RECEPTIONIST);
        if (user.role() == Role.VET) {
            dashboardPermissionService.requireEnabled(user, "VET_TAB_ALL");
        } else if (user.role() == Role.RECEPTIONIST) {
            dashboardPermissionService.requireEnabled(user, "RECEPTIONIST_TAB_APPOINTMENTS");
        } else {
            dashboardPermissionService.requireEnabled(user, "ADMIN_TAB_APPOINTMENTS");
        }
        return appointmentService.getAllByVetId(vetId).stream().map(this::toResponse).toList();
    }

    /**
     * [SECURITY FIX] Ownership check on GET /appointments/owner/{ownerId}
     *
     * Previously any authenticated PET_OWNER could pass any ownerId in the path
     * and read another owner's full appointment history (IDOR vulnerability).
     *
     * Fix: PET_OWNER may only request their own ownerId.
     * ADMIN and RECEPTIONIST may request any ownerId.
     */
    @GetMapping("/owner/{ownerId}")
    public List<AppointmentResponse> getOwnerAppointments(
            @PathVariable Long ownerId, HttpServletRequest request) {
        AuthenticatedUser user = authGuard.requireAuthenticatedUser(request);
        roleGuard.requireRole(user, Role.PET_OWNER, Role.ADMIN, Role.RECEPTIONIST);

        // PET_OWNER can only access appointments for their own owner profile id.
        Long currentUserOwnerId = ownerService.getByUserId(user.userId()).getId();
        if (user.role() == Role.PET_OWNER && !currentUserOwnerId.equals(ownerId)) {
            throw new UnauthorizedException("Access denied. You can only view your own appointments.");
        }
        if (user.role() == Role.PET_OWNER) {
            dashboardPermissionService.requireEnabled(user, "OWNER_TAB_APPOINTMENTS");
        } else if (user.role() == Role.RECEPTIONIST) {
            dashboardPermissionService.requireEnabled(user, "RECEPTIONIST_TAB_APPOINTMENTS");
        } else {
            dashboardPermissionService.requireEnabled(user, "ADMIN_TAB_APPOINTMENTS");
        }

        return appointmentService.getByOwner(ownerId).stream().map(this::toResponse).toList();
    }

    /**
     * [SECURITY FIX] Ownership check on PUT /appointments/{id}/cancel
     *
     * Previously any authenticated user (any role) could cancel any appointment
     * regardless of ownership — just by knowing the appointment ID.
     *
     * Fix:
     *  - PET_OWNER: can only cancel appointments where ownerId == their userId
     *  - RECEPTIONIST / ADMIN: can cancel any appointment
     *  - VET: not allowed to cancel (must use /status endpoint instead)
     */
    @PutMapping("/{id}/cancel")
    public AppointmentResponse cancel(@PathVariable Long id, HttpServletRequest request) {
        AuthenticatedUser user = authGuard.requireAuthenticatedUser(request);
        roleGuard.requireRole(user, Role.PET_OWNER, Role.RECEPTIONIST, Role.ADMIN);

        // [SECURITY FIX] Verify ownership for PET_OWNER before cancelling
        if (user.role() == Role.PET_OWNER) {
            dashboardPermissionService.requireEnabled(user, "OWNER_TAB_APPOINTMENTS");
            Appointment appointment = appointmentService.getById(id);
            Long currentUserOwnerId = ownerService.getByUserId(user.userId()).getId();
            if (!appointment.getOwnerId().equals(currentUserOwnerId)) {
                throw new UnauthorizedException("Access denied. You can only cancel your own appointments.");
            }
        } else if (user.role() == Role.RECEPTIONIST) {
            dashboardPermissionService.requireEnabled(user, "RECEPTIONIST_TAB_APPOINTMENTS");
        } else {
            dashboardPermissionService.requireEnabled(user, "ADMIN_TAB_APPOINTMENTS");
        }

        return toResponse(appointmentService.cancel(id));
    }

    @PutMapping("/{id}/status")
    public AppointmentResponse updateStatus(@PathVariable Long id,
                                            @Valid @RequestBody UpdateAppointmentStatusRequest body,
                                            HttpServletRequest request) {
        AuthenticatedUser user = authGuard.requireAuthenticatedUser(request);
        roleGuard.requireRole(user, Role.VET, Role.RECEPTIONIST, Role.ADMIN);
        if (user.role() == Role.VET) {
            dashboardPermissionService.requireEnabled(user, "VET_TAB_ALL");
        } else if (user.role() == Role.RECEPTIONIST) {
            dashboardPermissionService.requireEnabled(user, "RECEPTIONIST_TAB_APPOINTMENTS");
        } else {
            dashboardPermissionService.requireEnabled(user, "ADMIN_TAB_APPOINTMENTS");
        }
        return toResponse(appointmentService.updateStatus(id, body.status()));
    }

    private AppointmentResponse toResponse(Appointment a) {
        String ownerName = ownerService.displayName(ownerService.getById(a.getOwnerId()));
        String petName   = petService.getById(a.getPetId()).getName();
        String vetName   = vetService.getById(a.getVetId()).getName();
        return new AppointmentResponse(a.getId(), a.getOwnerId(), ownerName,
                a.getPetId(), petName, a.getVetId(), vetName,
                a.getAppointmentDate(), a.getStartTime(), a.getEndTime(),
                a.getReason(), a.getStatus(), a.getCreatedAt());
    }
}