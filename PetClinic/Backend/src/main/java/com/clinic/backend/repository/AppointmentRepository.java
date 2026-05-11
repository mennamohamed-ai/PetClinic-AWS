package com.clinic.backend.repository;

import com.clinic.backend.model.Appointment;
import com.clinic.backend.model.AppointmentStatus;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface AppointmentRepository extends JpaRepository<Appointment, Long> {

    List<Appointment> findByVetIdAndAppointmentDateOrderByStartTimeAsc(Long vetId, LocalDate date);
    List<Appointment> findByOwnerIdOrderByAppointmentDateAscStartTimeAsc(Long ownerId);
    List<Appointment> findByVetIdOrderByAppointmentDateDescStartTimeAsc(Long vetId);

    @Query("SELECT DISTINCT a.ownerId FROM Appointment a WHERE a.vetId = :vetId")
    List<Long> findDistinctOwnerIdsByVetId(@Param("vetId") Long vetId);

    @Query("SELECT CASE WHEN COUNT(a) > 0 THEN true ELSE false END FROM Appointment a " +
            "WHERE a.vetId = :vetId AND a.appointmentDate = :appointmentDate " +
            "AND a.status <> :cancelledStatus " +
            "AND :startTime < a.endTime AND :endTime > a.startTime")
    boolean hasConflict(@Param("vetId") Long vetId,
                        @Param("appointmentDate") LocalDate date,
                        @Param("startTime") LocalTime startTime,
                        @Param("endTime") LocalTime endTime,
                        @Param("cancelledStatus") AppointmentStatus cancelledStatus);
}