package com.library.dao;

import com.library.model.Book;
import com.library.model.Member;
import com.library.model.Reservation;
import com.library.util.DBUtil;

import java.sql.*;
import java.util.ArrayList;
import java.util.List;

/**
 * Data Access Object for Reservation entity.
 * Handles database operations for book reservations.
 */
public class ReservationDAO {

    /**
     * Find all reservations with optional status filter.
     */
    public List<Reservation> findAll(String status) throws SQLException {
        List<Reservation> reservations = new ArrayList<>();
        Connection conn = null;
        PreparedStatement stmt = null;
        ResultSet rs = null;

        try {
            conn = DBUtil.getConnection();
            StringBuilder sql = new StringBuilder();
            sql.append("SELECT r.id, r.book_id, r.member_id, ");
            sql.append("TO_CHAR(r.reservation_date, 'YYYY-MM-DD') as reservation_date, ");
            sql.append("TO_CHAR(r.expiry_date, 'YYYY-MM-DD') as expiry_date, ");
            sql.append("r.status, ");
            sql.append("b.title, b.author, b.isbn, ");
            sql.append("m.name as member_name, m.member_id as member_code, m.email as member_email ");
            sql.append("FROM reservations r ");
            sql.append("JOIN books b ON r.book_id = b.id ");
            sql.append("JOIN members m ON r.member_id = m.id ");

            if (status != null && !status.trim().isEmpty()) {
                sql.append("WHERE r.status = ? ");
            }
            sql.append("ORDER BY r.reservation_date DESC");

            stmt = conn.prepareStatement(sql.toString());
            if (status != null && !status.trim().isEmpty()) {
                stmt.setString(1, status);
            }

            rs = stmt.executeQuery();

            while (rs.next()) {
                reservations.add(mapResultSetToReservation(rs));
            }
        } finally {
            DBUtil.closeResources(conn, stmt, rs);
        }

        return reservations;
    }

    /**
     * Find reservations by member ID.
     */
    public List<Reservation> findByMemberId(String memberId) throws SQLException {
        List<Reservation> reservations = new ArrayList<>();
        Connection conn = null;
        PreparedStatement stmt = null;
        ResultSet rs = null;

        try {
            conn = DBUtil.getConnection();
            String sql = "SELECT r.id, r.book_id, r.member_id, " +
                    "TO_CHAR(r.reservation_date, 'YYYY-MM-DD') as reservation_date, " +
                    "TO_CHAR(r.expiry_date, 'YYYY-MM-DD') as expiry_date, " +
                    "r.status, " +
                    "b.title, b.author, b.isbn, " +
                    "m.name as member_name, m.member_id as member_code, m.email as member_email " +
                    "FROM reservations r " +
                    "JOIN books b ON r.book_id = b.id " +
                    "JOIN members m ON r.member_id = m.id " +
                    "WHERE r.member_id = ? " +
                    "ORDER BY r.reservation_date DESC";

            stmt = conn.prepareStatement(sql);
            stmt.setString(1, memberId);
            rs = stmt.executeQuery();

            while (rs.next()) {
                reservations.add(mapResultSetToReservation(rs));
            }
        } finally {
            DBUtil.closeResources(conn, stmt, rs);
        }

        return reservations;
    }

    /**
     * Find reservation by ID.
     */
    public Reservation findById(String id) throws SQLException {
        Connection conn = null;
        PreparedStatement stmt = null;
        ResultSet rs = null;

        try {
            conn = DBUtil.getConnection();
            String sql = "SELECT r.id, r.book_id, r.member_id, " +
                    "TO_CHAR(r.reservation_date, 'YYYY-MM-DD') as reservation_date, " +
                    "TO_CHAR(r.expiry_date, 'YYYY-MM-DD') as expiry_date, " +
                    "r.status, " +
                    "b.title, b.author, b.isbn, " +
                    "m.name as member_name, m.member_id as member_code, m.email as member_email " +
                    "FROM reservations r " +
                    "JOIN books b ON r.book_id = b.id " +
                    "JOIN members m ON r.member_id = m.id " +
                    "WHERE r.id = ?";

            stmt = conn.prepareStatement(sql);
            stmt.setString(1, id);
            rs = stmt.executeQuery();

            if (rs.next()) {
                return mapResultSetToReservation(rs);
            }
            return null;
        } finally {
            DBUtil.closeResources(conn, stmt, rs);
        }
    }

    /**
     * Create a new reservation.
     */
    public Reservation create(String bookId, String memberId) throws SQLException {
        Connection conn = null;
        PreparedStatement stmt = null;

        try {
            conn = DBUtil.getConnection();
            String sql = "INSERT INTO reservations (id, book_id, member_id, reservation_date, expiry_date, status) " +
                    "VALUES (?, ?, ?, SYSDATE, SYSDATE + 7, 'PENDING')";

            String id = DBUtil.generateId();

            stmt = conn.prepareStatement(sql);
            stmt.setString(1, id);
            stmt.setString(2, bookId);
            stmt.setString(3, memberId);

            stmt.executeUpdate();

            return findById(id);
        } finally {
            DBUtil.closeResources(conn, stmt);
        }
    }

    /**
     * Update reservation status.
     */
    public boolean updateStatus(String id, String status) throws SQLException {
        Connection conn = null;
        PreparedStatement stmt = null;

        try {
            conn = DBUtil.getConnection();
            String sql = "UPDATE reservations SET status = ? WHERE id = ?";

            stmt = conn.prepareStatement(sql);
            stmt.setString(1, status);
            stmt.setString(2, id);

            return stmt.executeUpdate() > 0;
        } finally {
            DBUtil.closeResources(conn, stmt);
        }
    }

    /**
     * Cancel a reservation.
     */
    public boolean cancel(String id) throws SQLException {
        return updateStatus(id, "CANCELLED");
    }

    /**
     * Count pending reservations.
     */
    public int countPending() throws SQLException {
        Connection conn = null;
        PreparedStatement stmt = null;
        ResultSet rs = null;

        try {
            conn = DBUtil.getConnection();
            String sql = "SELECT COUNT(*) FROM reservations WHERE status = 'PENDING'";
            stmt = conn.prepareStatement(sql);
            rs = stmt.executeQuery();

            if (rs.next()) {
                return rs.getInt(1);
            }
            return 0;
        } finally {
            DBUtil.closeResources(conn, stmt, rs);
        }
    }

    /**
     * Check if member already has pending reservation for book.
     */
    public boolean hasActiveReservation(String bookId, String memberId) throws SQLException {
        Connection conn = null;
        PreparedStatement stmt = null;
        ResultSet rs = null;

        try {
            conn = DBUtil.getConnection();
            String sql = "SELECT COUNT(*) FROM reservations " +
                    "WHERE book_id = ? AND member_id = ? AND status = 'PENDING'";
            stmt = conn.prepareStatement(sql);
            stmt.setString(1, bookId);
            stmt.setString(2, memberId);
            rs = stmt.executeQuery();

            if (rs.next()) {
                return rs.getInt(1) > 0;
            }
            return false;
        } finally {
            DBUtil.closeResources(conn, stmt, rs);
        }
    }

    private Reservation mapResultSetToReservation(ResultSet rs) throws SQLException {
        Reservation reservation = new Reservation();
        reservation.setId(rs.getString("id"));
        reservation.setBookId(rs.getString("book_id"));
        reservation.setMemberId(rs.getString("member_id"));
        reservation.setReservationDate(rs.getString("reservation_date"));
        reservation.setExpiryDate(rs.getString("expiry_date"));
        reservation.setStatus(rs.getString("status"));

        // Map related book
        Book book = new Book();
        book.setId(rs.getString("book_id"));
        book.setTitle(rs.getString("title"));
        book.setAuthor(rs.getString("author"));
        book.setIsbn(rs.getString("isbn"));
        reservation.setBook(book);

        // Map related member
        Member member = new Member();
        member.setId(rs.getString("member_id"));
        member.setName(rs.getString("member_name"));
        member.setMemberId(rs.getString("member_code"));
        member.setEmail(rs.getString("member_email"));
        reservation.setMember(member);

        return reservation;
    }
}