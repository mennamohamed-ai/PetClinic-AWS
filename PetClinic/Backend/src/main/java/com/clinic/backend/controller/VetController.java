package com.clinic.backend.controller;

import com.clinic.backend.dto.vet.CreateVetRequest;
import com.clinic.backend.dto.vet.UpdateVetRequest;
import com.clinic.backend.dto.vet.VetResponse;
import com.clinic.backend.model.AnimalType;
import com.clinic.backend.model.Role;
import com.clinic.backend.model.Vet;
import com.clinic.backend.security.AuthGuard;
import com.clinic.backend.security.AuthenticatedUser;
import com.clinic.backend.security.RoleGuard;
import com.clinic.backend.service.VetService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import java.util.List;
import java.util.Set;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/vets")
public class VetController {

    private final VetService vetService;
    private final AuthGuard authGuard;
    private final RoleGuard roleGuard;

    public VetController(VetService vetService, AuthGuard authGuard, RoleGuard roleGuard) {
        this.vetService = vetService;
        this.authGuard = authGuard;
        this.roleGuard = roleGuard;
    }

    @GetMapping
    public List<VetResponse> getAll() {
        return vetService.getAll().stream().map(this::toResponse).toList();
    }

    @GetMapping("/search")
    public List<VetResponse> search(
            @RequestParam(required = false) String city,
            @RequestParam(required = false) Double minPrice,
            @RequestParam(required = false) Double maxPrice,
            @RequestParam(required = false) AnimalType animalType,
            @RequestParam(required = false) String sortBy,
            @RequestParam(required = false) Boolean available) {
        return vetService.search(city, minPrice, maxPrice, animalType, available, sortBy)
                .stream().map(this::toResponse).toList();
    }

    @GetMapping("/cities")
    public Set<String> cities() { return vetService.getCities(); }

    @GetMapping("/me")
    public VetResponse getMyProfile(HttpServletRequest request) {
        AuthenticatedUser user = authGuard.requireAuthenticatedUser(request);
        roleGuard.requireRole(user, Role.VET);
        return toResponse(vetService.getByUserId(user.userId()));
    }

    @GetMapping("/{id}")
    public VetResponse getById(@PathVariable Long id) {
        return toResponse(vetService.getById(id));
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public VetResponse create(HttpServletRequest request, @Valid @RequestBody CreateVetRequest body) {
        AuthenticatedUser user = authGuard.requireAuthenticatedUser(request);
        roleGuard.requireRole(user, Role.ADMIN);
        return toResponse(vetService.create(body));
    }

    @PutMapping("/{id}")
    public VetResponse update(@PathVariable Long id, HttpServletRequest request,
                              @Valid @RequestBody UpdateVetRequest body) {
        AuthenticatedUser user = authGuard.requireAuthenticatedUser(request);
        roleGuard.requireRole(user, Role.ADMIN);
        return toResponse(vetService.update(id, body));
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id, HttpServletRequest request) {
        AuthenticatedUser user = authGuard.requireAuthenticatedUser(request);
        roleGuard.requireRole(user, Role.ADMIN);
        vetService.delete(id);
    }

    private VetResponse toResponse(Vet vet) {
        return new VetResponse(vet.getId(), vet.getName(), vet.getPhone(), vet.getCity(),
                vet.getAddress(), vet.getSpecialization(), vet.getAnimalType(),
                vet.getConsultationFee(), vet.getRating(), vet.getExperienceYears(),
                vet.getAvailableDays(), vet.getBio(), vet.isAvailable());
    }
}