package com.clinic.backend.repository;

import com.clinic.backend.model.Invoice;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface InvoiceRepository extends JpaRepository<Invoice, Long> {
    List<Invoice> findAllByOrderByIdAsc();
    List<Invoice> findByOwnerIdOrderByIssuedAtDesc(Long ownerId);
}