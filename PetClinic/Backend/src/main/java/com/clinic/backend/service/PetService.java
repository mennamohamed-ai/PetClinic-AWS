package com.clinic.backend.service;

import com.clinic.backend.dto.pet.CreatePetRequest;
import com.clinic.backend.dto.pet.UpdatePetRequest;
import com.clinic.backend.exception.ResourceNotFoundException;
import com.clinic.backend.model.Pet;
import com.clinic.backend.repository.PetRepository;
import java.util.List;
import org.springframework.stereotype.Service;

@Service
public class PetService {
    private final PetRepository petRepository;
    private final OwnerService ownerService;

    public PetService(PetRepository petRepository, OwnerService ownerService) {
        this.petRepository = petRepository;
        this.ownerService = ownerService;
    }

    public Pet create(CreatePetRequest request) {
        ownerService.getById(request.ownerId());
        Pet pet = Pet.builder()
                .ownerId(request.ownerId())
                .name(request.name())
                .type(request.type())
                .breed(request.breed())
                .birthDate(request.birthDate())
                .gender(request.gender())
                .weight(request.weight())
                .build();
        return petRepository.save(pet);
    }

    public Pet getById(Long id) {
        return petRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Pet with id " + id + " was not found."));
    }

    public List<Pet> getByOwnerId(Long ownerId) {
        ownerService.getById(ownerId);
        return petRepository.findByOwnerIdOrderByIdAsc(ownerId);
    }

    public Pet update(Long id, UpdatePetRequest request) {
        Pet existing = getById(id);
        Pet updated = existing.toBuilder()
                .name(request.name())
                .type(request.type())
                .breed(request.breed())
                .birthDate(request.birthDate())
                .gender(request.gender())
                .weight(request.weight())
                .build();
        return petRepository.save(updated);
    }

    public void delete(Long id) {
        if (!petRepository.existsById(id)) {
            throw new ResourceNotFoundException("Pet with id " + id + " was not found.");
        }
        petRepository.deleteById(id);
    }
}
