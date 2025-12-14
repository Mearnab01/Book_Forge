package com.library.dao;

import com.library.model.BookCopy;
import com.library.util.DBUtil;

import java.sql.*;
import java.util.ArrayList;
import java.util.List;

/**
 * Data Access Object for BookCopy entity.
 * Handles database operations for physical book copies.
 */
public class BookCopyDAO {

    /**
     * Find all copies of a specific book.
     */
    public List<BookCopy> findByBookId(String bookId) throws SQLException {
        List<BookCopy> copies = new ArrayList<>();
        Connection conn = null;
        PreparedStatement stmt = null;
        ResultSet rs = null;

        try {
            conn = DBUtil.getConnection();
            String sql = "SELECT id, book_id, copy_number, status, location, " +
                    "TO_CHAR(created_at, 'YYYY-MM-DD') as created_at " +
                    "FROM book_copies WHERE book_id = ? ORDER BY copy_number";

            stmt = conn.prepareStatement(sql);
            stmt.setString(1, bookId);
            rs = stmt.executeQuery();

            while (rs.next()) {
                copies.add(mapResultSetToBookCopy(rs));
            }
        } finally {
            DBUtil.closeResources(conn, stmt, rs);
        }

        return copies;
    }

    /**
     * Find a specific book copy by ID.
     */
    public BookCopy findById(String id) throws SQLException {
        Connection conn = null;
        PreparedStatement stmt = null;
        ResultSet rs = null;

        try {
            conn = DBUtil.getConnection();
            String sql = "SELECT id, book_id, copy_number, status, location, " +
                    "TO_CHAR(created_at, 'YYYY-MM-DD') as created_at " +
                    "FROM book_copies WHERE id = ?";

            stmt = conn.prepareStatement(sql);
            stmt.setString(1, id);
            rs = stmt.executeQuery();

            if (rs.next()) {
                return mapResultSetToBookCopy(rs);
            }
            return null;
        } finally {
            DBUtil.closeResources(conn, stmt, rs);
        }
    }

    /**
     * Find first available copy of a book.
     */
    public BookCopy findFirstAvailable(String bookId) throws SQLException {
        Connection conn = null;
        PreparedStatement stmt = null;
        ResultSet rs = null;

        try {
            conn = DBUtil.getConnection();
            String sql = "SELECT id, book_id, copy_number, status, location, " +
                    "TO_CHAR(created_at, 'YYYY-MM-DD') as created_at " +
                    "FROM book_copies WHERE book_id = ? AND status = 'AVAILABLE' " +
                    "AND ROWNUM = 1 ORDER BY copy_number";

            stmt = conn.prepareStatement(sql);
            stmt.setString(1, bookId);
            rs = stmt.executeQuery();

            if (rs.next()) {
                return mapResultSetToBookCopy(rs);
            }
            return null;
        } finally {
            DBUtil.closeResources(conn, stmt, rs);
        }
    }

    /**
     * Create a new book copy.
     */
    public BookCopy create(BookCopy copy) throws SQLException {
        Connection conn = null;
        PreparedStatement stmt = null;

        try {
            conn = DBUtil.getConnection();
            String sql = "INSERT INTO book_copies (id, book_id, copy_number, status, location, created_at) " +
                    "VALUES (?, ?, ?, ?, ?, SYSDATE)";

            String id = DBUtil.generateId();
            copy.setId(id);

            stmt = conn.prepareStatement(sql);
            stmt.setString(1, id);
            stmt.setString(2, copy.getBookId());
            stmt.setString(3, copy.getCopyNumber());
            stmt.setString(4, copy.getStatus() != null ? copy.getStatus() : "AVAILABLE");
            stmt.setString(5, copy.getLocation());

            stmt.executeUpdate();

            return findById(id);
        } finally {
            DBUtil.closeResources(conn, stmt);
        }
    }

    /**
     * Update book copy status.
     */
    public boolean updateStatus(String id, String status) throws SQLException {
        Connection conn = null;
        PreparedStatement stmt = null;

        try {
            conn = DBUtil.getConnection();
            String sql = "UPDATE book_copies SET status = ? WHERE id = ?";

            stmt = conn.prepareStatement(sql);
            stmt.setString(1, status);
            stmt.setString(2, id);

            return stmt.executeUpdate() > 0;
        } finally {
            DBUtil.closeResources(conn, stmt);
        }
    }

    /**
     * Delete a book copy.
     */
    public boolean delete(String id) throws SQLException {
        Connection conn = null;
        PreparedStatement stmt = null;

        try {
            conn = DBUtil.getConnection();
            String sql = "DELETE FROM book_copies WHERE id = ?";

            stmt = conn.prepareStatement(sql);
            stmt.setString(1, id);

            return stmt.executeUpdate() > 0;
        } finally {
            DBUtil.closeResources(conn, stmt);
        }
    }

    /**
     * Generate next copy number for a book.
     */
    public String generateCopyNumber(String bookId) throws SQLException {
        Connection conn = null;
        PreparedStatement stmt = null;
        ResultSet rs = null;

        try {
            conn = DBUtil.getConnection();
            String sql = "SELECT MAX(TO_NUMBER(REGEXP_SUBSTR(copy_number, '\\d+$'))) as max_num " +
                    "FROM book_copies WHERE book_id = ?";

            stmt = conn.prepareStatement(sql);
            stmt.setString(1, bookId);
            rs = stmt.executeQuery();

            int nextNum = 1;
            if (rs.next() && rs.getObject("max_num") != null) {
                nextNum = rs.getInt("max_num") + 1;
            }

            return String.format("COPY-%04d", nextNum);
        } finally {
            DBUtil.closeResources(conn, stmt, rs);
        }
    }

    private BookCopy mapResultSetToBookCopy(ResultSet rs) throws SQLException {
        BookCopy copy = new BookCopy();
        copy.setId(rs.getString("id"));
        copy.setBookId(rs.getString("book_id"));
        copy.setCopyNumber(rs.getString("copy_number"));
        copy.setStatus(rs.getString("status"));
        copy.setLocation(rs.getString("location"));
        copy.setAddedDate(rs.getString("created_at"));
        return copy;
    }
}