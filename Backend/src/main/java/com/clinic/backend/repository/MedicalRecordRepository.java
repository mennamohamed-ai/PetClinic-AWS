package com.clinic.backend.repository;

import com.clinic.backend.model.MedicalRecord;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface MedicalRecordRepository extends JpaRepository<MedicalRecord, Long> {
    List<MedicalRecord> findByPetIdOrderByRecordDateDesc(Long petId);
    List<MedicalRecord> findByVetIdOrderByRecordDateDesc(Long vetId);
}
