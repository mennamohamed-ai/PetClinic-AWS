package com.clinic.backend.repository;

import com.clinic.backend.model.Pet;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PetRepository extends JpaRepository<Pet, Long> {
    List<Pet> findByOwnerIdOrderByIdAsc(Long ownerId);
}
