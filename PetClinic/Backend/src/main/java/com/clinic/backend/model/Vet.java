package com.clinic.backend.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "vets", catalog = "petclinic_vet_db")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder(toBuilder = true)
public class Vet {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private String phone;

    @Column(nullable = false)
    private String city;

    @Column(nullable = false)
    private String address;

    @Column(nullable = false)
    private String specialization;

    @Enumerated(EnumType.STRING)
    @Column(name = "animal_type", insertable = false, updatable = false)
    private AnimalType animalType;

    @Column(name = "consultation_fee", nullable = false)
    private Double consultationFee;

    @Column(nullable = false)
    private Double rating;

    @Column(name = "experience_years", nullable = false)
    private Integer experienceYears;

    @Column(name = "available_days", nullable = false)
    private String availableDays;

    @Column
    private String bio;

    @Column(name = "is_available", nullable = false)
    private boolean available;

    @Column(name = "user_id", nullable = false)
    private Long userId;
}
