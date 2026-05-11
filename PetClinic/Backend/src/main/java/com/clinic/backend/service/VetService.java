package com.clinic.backend.service;

import com.clinic.backend.dto.vet.CreateVetRequest;
import com.clinic.backend.dto.vet.UpdateVetRequest;
import com.clinic.backend.exception.ResourceNotFoundException;
import com.clinic.backend.model.AnimalType;
import com.clinic.backend.model.Vet;
import com.clinic.backend.repository.VetRepository;
import java.util.Comparator;
import java.util.List;
import java.util.Set;
import org.springframework.stereotype.Service;

@Service
public class VetService {

    private final VetRepository vetRepository;

    public VetService(VetRepository vetRepository) {
        this.vetRepository = vetRepository;
    }

    public Vet create(CreateVetRequest request) {
        Vet vet = Vet.builder()
                .name(request.name()).phone(request.phone())
                .city(request.city()).address(request.address())
                .specialization(request.specialization())
                .animalType(request.animalType())
                .consultationFee(request.consultationFee())
                .rating(request.rating())
                .experienceYears(request.experienceYears())
                .availableDays(request.availableDays())
                .bio(request.bio()).available(request.available())
                // Link vet profile to an existing user (patients table) id.
                .userId(request.userId())
                .build();
        return vetRepository.save(vet);
    }

    public Vet update(Long id, UpdateVetRequest request) {
        Vet existing = getById(id);
        Vet updated = existing.toBuilder()
                .name(request.name()).phone(request.phone())
                .city(request.city()).address(request.address())
                .specialization(request.specialization())
                .consultationFee(request.consultationFee())
                .rating(request.rating())
                .experienceYears(request.experienceYears())
                .availableDays(request.availableDays())
                .bio(request.bio()).available(request.available())
                .build();
        return vetRepository.save(updated);
    }

    public void delete(Long id) {
        if (!vetRepository.existsById(id))
            throw new ResourceNotFoundException("Vet with id " + id + " was not found.");
        vetRepository.deleteById(id);
    }

    public Vet getById(Long id) {
        return vetRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Vet with id " + id + " was not found."));
    }

    public Vet getByUserId(Long userId) {
        return vetRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "No vet profile found for user id " + userId));
    }

    public List<Vet> search(String city, Double minPrice, Double maxPrice,
                            AnimalType animalType, Boolean available, String sortBy) {
        List<Vet> result = vetRepository.searchVets(city, minPrice, maxPrice, available);
        if (animalType != null)
            result = result.stream().filter(v -> v.getAnimalType() == animalType).toList();
        Comparator<Vet> comparator = switch (sortBy == null ? "" : sortBy.toLowerCase()) {
            case "price"      -> Comparator.comparing(Vet::getConsultationFee);
            case "rating"     -> Comparator.comparing(Vet::getRating).reversed();
            case "experience" -> Comparator.comparing(Vet::getExperienceYears).reversed();
            default           -> Comparator.comparing(Vet::getId);
        };
        return result.stream().sorted(comparator).toList();
    }

    public List<Vet> getAll() { return vetRepository.findAll(); }
    public Set<String> getCities() { return vetRepository.findAllCities(); }
}