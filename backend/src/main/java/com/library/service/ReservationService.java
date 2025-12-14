package com.library.service;

import com.library.dao.*;
import com.library.model.Book;
import com.library.model.Member;
import com.library.model.Reservation;

import java.sql.SQLException;
import java.util.List;

/**
 * Service layer for reservation operations.
 * Handles business logic for book reservations.
 */
public class ReservationService {

    private final ReservationDAO reservationDao;
    private final BookDAO bookDao;
    private final MemberDAO memberDao;

    public ReservationService() {
        this.reservationDao = new ReservationDAO();
        this.bookDao = new BookDAO();
        this.memberDao = new MemberDAO();
    }

    /**
     * Get all reservations with optional status filter.
     */
    public List<Reservation> getReservations(String status) throws SQLException {
        return reservationDao.findAll(status);
    }

    /**
     * Get reservations for a specific member.
     */
    public List<Reservation> getMemberReservations(String memberId) throws SQLException {
        Member member = memberDao.findById(memberId);
        if (member == null) {
            throw new IllegalArgumentException("Member not found");
        }
        return reservationDao.findByMemberId(memberId);
    }

    /**
     * Create a new reservation.
     */
    public Reservation createReservation(String bookId, String memberId) throws SQLException {
        // Validate member
        Member member = memberDao.findById(memberId);
        if (member == null) {
            throw new IllegalArgumentException("Member not found");
        }

        if (!"ACTIVE".equals(member.getStatus())) {
            throw new IllegalArgumentException("Member account is not active");
        }

        // Validate book
        Book book = bookDao.findById(bookId);
        if (book == null) {
            throw new IllegalArgumentException("Book not found");
        }

        // Check if member already has active reservation for this book
        if (reservationDao.hasActiveReservation(bookId, memberId)) {
            throw new IllegalArgumentException("You already have an active reservation for this book");
        }

        // If book is available, no need to reserve
        if (book.getAvailableCopies() > 0) {
            throw new IllegalArgumentException("Book is available - no reservation needed");
        }

        return reservationDao.create(bookId, memberId);
    }

    /**
     * Cancel a reservation.
     */
    public void cancelReservation(String id, String requestingMemberId, String userRole)
            throws SQLException {
        Reservation reservation = reservationDao.findById(id);
        if (reservation == null) {
            throw new IllegalArgumentException("Reservation not found");
        }

        // Check authorization - only owner or staff can cancel
        boolean isOwner = reservation.getMemberId().equals(requestingMemberId);
        boolean isStaff = "ADMIN".equals(userRole) || "LIBRARIAN".equals(userRole);

        if (!isOwner && !isStaff) {
            throw new IllegalArgumentException("Not authorized to cancel this reservation");
        }

        // Can only cancel pending reservations
        if (!"PENDING".equals(reservation.getStatus())) {
            throw new IllegalArgumentException("Can only cancel pending reservations");
        }

        reservationDao.cancel(id);
    }

    /**
     * Fulfill a reservation (when book becomes available).
     */
    public void fulfillReservation(String id) throws SQLException {
        Reservation reservation = reservationDao.findById(id);
        if (reservation == null) {
            throw new IllegalArgumentException("Reservation not found");
        }

        if (!"PENDING".equals(reservation.getStatus())) {
            throw new IllegalArgumentException("Reservation is not pending");
        }

        reservationDao.updateStatus(id, "FULFILLED");
    }

    /**
     * Count pending reservations.
     */
    public int countPending() throws SQLException {
        return reservationDao.countPending();
    }
}