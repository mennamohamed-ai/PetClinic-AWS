package com.clinic.backend.service;

import com.clinic.backend.dto.invoice.CreateInvoiceRequest;
import com.clinic.backend.exception.ResourceNotFoundException;
import com.clinic.backend.model.Invoice;
import com.clinic.backend.model.InvoiceStatus;
import com.clinic.backend.repository.InvoiceRepository;
import java.time.LocalDateTime;
import java.util.List;
import org.springframework.stereotype.Service;

@Service
public class InvoiceService {
    private final InvoiceRepository invoiceRepository;
    private final AppointmentService appointmentService;
    private final OwnerService ownerService;

    public InvoiceService(InvoiceRepository invoiceRepository,
                          AppointmentService appointmentService,
                          OwnerService ownerService) {
        this.invoiceRepository = invoiceRepository;
        this.appointmentService = appointmentService;
        this.ownerService = ownerService;
    }

    public Invoice create(CreateInvoiceRequest request) {
        appointmentService.getById(request.appointmentId());
        ownerService.getById(request.ownerId());
        Invoice invoice = Invoice.builder()
                .appointmentId(request.appointmentId())
                .ownerId(request.ownerId())
                .amount(request.amount())
                .status(InvoiceStatus.UNPAID)
                .issuedAt(LocalDateTime.now())
                .build();
        return invoiceRepository.save(invoice);
    }

    public Invoice pay(Long id) {
        Invoice invoice = getById(id);
        invoice.setStatus(InvoiceStatus.PAID);
        invoice.setPaidAt(LocalDateTime.now());
        return invoiceRepository.save(invoice);
    }

    public Invoice getById(Long id) {
        return invoiceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Invoice with id " + id + " was not found."));
    }

    public List<Invoice> getAll() { return invoiceRepository.findAllByOrderByIdAsc(); }

    /** فواتير مستخدم معين — للـ PET_OWNER */
    public List<Invoice> getByOwnerId(Long ownerId) {
        return invoiceRepository.findByOwnerIdOrderByIssuedAtDesc(ownerId);
    }
}