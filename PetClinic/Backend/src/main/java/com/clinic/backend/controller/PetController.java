package com.clinic.backend.controller;

import com.clinic.backend.dto.pet.CreatePetRequest;
import com.clinic.backend.dto.pet.PetResponse;
import com.clinic.backend.dto.pet.UpdatePetRequest;
import com.clinic.backend.model.Pet;
import com.clinic.backend.model.Role;
import com.clinic.backend.security.AuthGuard;
import com.clinic.backend.security.AuthenticatedUser;
import com.clinic.backend.security.RoleGuard;
import com.clinic.backend.service.DashboardPermissionService;
import com.clinic.backend.service.OwnerService;
import com.clinic.backend.service.PetService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/pets")
public class PetController {

    private final PetService petService;
    private final OwnerService ownerService;
    private final DashboardPermissionService dashboardPermissionService;
    private final AuthGuard authGuard;
    private final RoleGuard roleGuard;

    public PetController(PetService petService, OwnerService ownerService,
                         DashboardPermissionService dashboardPermissionService,
                         AuthGuard authGuard, RoleGuard roleGuard) {
        this.petService = petService;
        this.ownerService = ownerService;
        this.dashboardPermissionService = dashboardPermissionService;
        this.authGuard = authGuard;
        this.roleGuard = roleGuard;
    }

    // ✅ بس PET_OWNER يضيف pet
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public PetResponse create(HttpServletRequest request, @Valid @RequestBody CreatePetRequest body) {
        AuthenticatedUser currentUser = authGuard.requireAuthenticatedUser(request);
        roleGuard.requireRole(currentUser, Role.PET_OWNER, Role.ADMIN);
        if (currentUser.role() == Role.PET_OWNER) {
            dashboardPermissionService.requireEnabled(currentUser, "OWNER_TAB_PROFILE");
            Long myOwnerId = ownerService.getByUserId(currentUser.userId()).getId();
            if (!myOwnerId.equals(body.ownerId())) {
                throw new com.clinic.backend.exception.UnauthorizedException("You can only add pets to your own profile.");
            }
        }
        return toResponse(petService.create(body));
    }

    // ✅ بس صاحب الـ pets أو VET أو ADMIN يشوفهم
    @GetMapping("/owner/{ownerId}")
    public List<PetResponse> getByOwner(@PathVariable Long ownerId, HttpServletRequest request) {
        AuthenticatedUser currentUser = authGuard.requireAuthenticatedUser(request);
        if (currentUser.role() == Role.PET_OWNER) {
            dashboardPermissionService.requireEnabled(currentUser, "OWNER_TAB_PROFILE");
            Long myOwnerId = ownerService.getByUserId(currentUser.userId()).getId();
            if (!myOwnerId.equals(ownerId)) {
                throw new com.clinic.backend.exception.UnauthorizedException("You can only view your own pets.");
            }
        }
        return petService.getByOwnerId(ownerId).stream().map(this::toResponse).toList();
    }

    @GetMapping("/{id}")
    public PetResponse getById(@PathVariable Long id, HttpServletRequest request) {
        AuthenticatedUser currentUser = authGuard.requireAuthenticatedUser(request);
        Pet pet = petService.getById(id);
        if (currentUser.role() == Role.PET_OWNER) {
            dashboardPermissionService.requireEnabled(currentUser, "OWNER_TAB_PROFILE");
            Long myOwnerId = ownerService.getByUserId(currentUser.userId()).getId();
            if (!myOwnerId.equals(pet.getOwnerId())) {
                throw new com.clinic.backend.exception.UnauthorizedException("You can only view your own pets.");
            }
        }
        return toResponse(pet);
    }

    @PutMapping("/{id}")
    public PetResponse update(@PathVariable Long id, HttpServletRequest request,
                              @Valid @RequestBody UpdatePetRequest body) {
        AuthenticatedUser currentUser = authGuard.requireAuthenticatedUser(request);
        roleGuard.requireRole(currentUser, Role.PET_OWNER, Role.ADMIN);
        Pet existing = petService.getById(id);
        if (currentUser.role() == Role.PET_OWNER) {
            dashboardPermissionService.requireEnabled(currentUser, "OWNER_TAB_PROFILE");
            Long myOwnerId = ownerService.getByUserId(currentUser.userId()).getId();
            if (!myOwnerId.equals(existing.getOwnerId())) {
                throw new com.clinic.backend.exception.UnauthorizedException("You can only update your own pets.");
            }
        }
        return toResponse(petService.update(id, body));
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id, HttpServletRequest request) {
        AuthenticatedUser currentUser = authGuard.requireAuthenticatedUser(request);
        roleGuard.requireRole(currentUser, Role.PET_OWNER, Role.ADMIN);
        Pet existing = petService.getById(id);
        if (currentUser.role() == Role.PET_OWNER) {
            dashboardPermissionService.requireEnabled(currentUser, "OWNER_TAB_PROFILE");
            Long myOwnerId = ownerService.getByUserId(currentUser.userId()).getId();
            if (!myOwnerId.equals(existing.getOwnerId())) {
                throw new com.clinic.backend.exception.UnauthorizedException("You can only delete your own pets.");
            }
        }
        petService.delete(id);
    }

    private PetResponse toResponse(Pet pet) {
        String ownerName = ownerService.displayName(ownerService.getById(pet.getOwnerId()));
        return new PetResponse(pet.getId(), pet.getOwnerId(), ownerName, pet.getName(),
                pet.getType(), pet.getBreed(), pet.getBirthDate(), pet.getGender(), pet.getWeight());
    }
}
