package com.clinic.backend.model;

import jakarta.persistence.*;
import lombok.*;
@Entity
@Table(name = "users", catalog = "petclinic_auth_db")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder(toBuilder = true)
public class Patient {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;

    private String email;

    private String phone;

    private String password;

    @Enumerated(EnumType.STRING)
    private Role role;
}