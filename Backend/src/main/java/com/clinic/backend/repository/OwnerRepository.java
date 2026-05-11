package com.clinic.backend.repository;

import com.clinic.backend.model.Owner;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface OwnerRepository extends JpaRepository<Owner, Long> {
    Optional<Owner> findByUserId(Long userId);
}
