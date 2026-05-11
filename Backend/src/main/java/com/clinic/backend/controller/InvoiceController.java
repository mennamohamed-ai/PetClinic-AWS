package com.clinic.backend.controller;

import com.clinic.backend.dto.invoice.CreateInvoiceRequest;
import com.clinic.backend.dto.invoice.InvoiceResponse;
import com.clinic.backend.exception.UnauthorizedException;
import com.clinic.backend.model.Invoice;
import com.clinic.backend.model.Role;
import com.clinic.backend.security.AuthGuard;
import com.clinic.backend.security.AuthenticatedUser;
import com.clinic.backend.security.RoleGuard;
import com.clinic.backend.service.DashboardPermissionService;
import com.clinic.backend.service.InvoiceService;
import com.clinic.backend.service.OwnerService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/invoices")
public class InvoiceController {

    private final InvoiceService invoiceService;
    private final OwnerService ownerService;
    private final DashboardPermissionService dashboardPermissionService;
    private final AuthGuard authGuard;
    private final RoleGuard roleGuard;

    public InvoiceController(
            InvoiceService invoiceService,
            OwnerService ownerService,
            DashboardPermissionService dashboardPermissionService,
            AuthGuard authGuard,
            RoleGuard roleGuard
    ) {
        this.invoiceService = invoiceService;
        this.ownerService = ownerService;
        this.dashboardPermissionService = dashboardPermissionService;
        this.authGuard = authGuard;
        this.roleGuard = roleGuard;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public InvoiceResponse create(HttpServletRequest request, @Valid @RequestBody CreateInvoiceRequest body) {
        AuthenticatedUser user = authGuard.requireAuthenticatedUser(request);
        roleGuard.requireRole(user, Role.RECEPTIONIST, Role.ADMIN);
        if (user.role() == Role.RECEPTIONIST) {
            dashboardPermissionService.requireEnabled(user, "RECEPTIONIST_TAB_INVOICES");
        } else {
            dashboardPermissionService.requireEnabled(user, "ADMIN_TAB_INVOICES");
        }
        return toResponse(invoiceService.create(body));
    }

    @GetMapping
    public List<InvoiceResponse> getAll(HttpServletRequest request) {
        AuthenticatedUser user = authGuard.requireAuthenticatedUser(request);
        roleGuard.requireRole(user, Role.ADMIN, Role.RECEPTIONIST);
        if (user.role() == Role.RECEPTIONIST) {
            dashboardPermissionService.requireEnabled(user, "RECEPTIONIST_TAB_INVOICES");
        } else {
            dashboardPermissionService.requireEnabled(user, "ADMIN_TAB_INVOICES");
        }
        return invoiceService.getAll().stream().map(this::toResponse).toList();
    }

    /** فواتير المريض — للـ PET_OWNER */
    @GetMapping("/owner/{ownerId}")
    public List<InvoiceResponse> getByOwner(@PathVariable Long ownerId,
                                            HttpServletRequest request) {
        AuthenticatedUser user = authGuard.requireAuthenticatedUser(request);
        roleGuard.requireRole(user, Role.PET_OWNER, Role.RECEPTIONIST, Role.ADMIN);
        if (user.role() == Role.PET_OWNER) {
            dashboardPermissionService.requireEnabled(user, "OWNER_TAB_BILLING");
            Long currentUserOwnerId = ownerService.getByUserId(user.userId()).getId();
            if (!currentUserOwnerId.equals(ownerId)) {
                throw new UnauthorizedException("Access denied. You can only view your own invoices.");
            }
        } else if (user.role() == Role.RECEPTIONIST) {
            dashboardPermissionService.requireEnabled(user, "RECEPTIONIST_TAB_INVOICES");
        } else {
            dashboardPermissionService.requireEnabled(user, "ADMIN_TAB_INVOICES");
        }
        return invoiceService.getByOwnerId(ownerId).stream().map(this::toResponse).toList();
    }

    @PutMapping("/{id}/pay")
    public InvoiceResponse pay(@PathVariable Long id, HttpServletRequest request) {
        AuthenticatedUser user = authGuard.requireAuthenticatedUser(request);
        roleGuard.requireRole(user, Role.PET_OWNER, Role.RECEPTIONIST, Role.ADMIN);
        if (user.role() == Role.PET_OWNER) {
            dashboardPermissionService.requireEnabled(user, "OWNER_TAB_BILLING");
            Invoice invoice = invoiceService.getById(id);
            Long currentUserOwnerId = ownerService.getByUserId(user.userId()).getId();
            if (!invoice.getOwnerId().equals(currentUserOwnerId)) {
                throw new UnauthorizedException("Access denied. You can only pay your own invoices.");
            }
        } else if (user.role() == Role.RECEPTIONIST) {
            dashboardPermissionService.requireEnabled(user, "RECEPTIONIST_TAB_INVOICES");
        } else {
            dashboardPermissionService.requireEnabled(user, "ADMIN_TAB_INVOICES");
        }
        return toResponse(invoiceService.pay(id));
    }

    private InvoiceResponse toResponse(Invoice i) {
        return new InvoiceResponse(i.getId(), i.getAppointmentId(), i.getOwnerId(),
                i.getAmount(), i.getStatus(), i.getIssuedAt(), i.getPaidAt());
    }
}