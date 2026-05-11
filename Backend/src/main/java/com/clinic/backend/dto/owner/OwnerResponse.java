package com.clinic.backend.dto.owner;

public record OwnerResponse(
        Long id,
        Long userId,
        String name,
        String phone,
        String address,
        String city
) {
}
