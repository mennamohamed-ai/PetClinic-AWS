package com.clinic.backend.repository;

import com.clinic.backend.model.AnimalType;
import com.clinic.backend.model.Vet;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface VetRepository extends JpaRepository<Vet, Long> {

    Optional<Vet> findByUserId(Long userId);

    @Query("SELECT v FROM Vet v WHERE " +
            "(:city IS NULL OR LOWER(v.city) = LOWER(:city)) AND " +
            "(:minPrice IS NULL OR v.consultationFee >= :minPrice) AND " +
            "(:maxPrice IS NULL OR v.consultationFee <= :maxPrice) AND " +
            "(:available IS NULL OR v.available = :available)")
    List<Vet> searchVets(@Param("city") String city,
                         @Param("minPrice") Double minPrice,
                         @Param("maxPrice") Double maxPrice,
                         @Param("available") Boolean available);

    @Query("SELECT DISTINCT v.city FROM Vet v ORDER BY v.city")
    java.util.Set<String> findAllCities();

    List<Vet> findByAnimalType(AnimalType animalType);
}