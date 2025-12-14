package com.library.dao;

import com.library.model.Book;
import com.library.model.BookCopy;
import com.library.model.Loan;
import com.library.model.Member;
import com.library.util.DBUtil;

import java.sql.*;
import java.util.ArrayList;
import java.util.List;

/**
 * Data Access Object for Loan entity.
 * Handles database operations for book loans/issues.
 */
public class LoanDAO {

    /**
     * Find all active loans.
     */
    public List<Loan> findActiveLoans() throws SQLException {
        return findByStatus("ISSUED");
    }

    /**
     * Find loans by status.
     */
    public List<Loan> findByStatus(String status) throws SQLException {
        List<Loan> loans = new ArrayList<>();
        Connection conn = null;
        PreparedStatement stmt = null;
        ResultSet rs = null;

        try {
            conn = DBUtil.getConnection();
            String sql = "SELECT l.id, l.book_copy_id, l.member_id, " +
                    "TO_CHAR(l.issue_date, 'YYYY-MM-DD') as issue_date, " +
                    "TO_CHAR(l.due_date, 'YYYY-MM-DD') as due_date, " +
                    "TO_CHAR(l.return_date, 'YYYY-MM-DD') as return_date, " +
                    "l.status, l.fine_amount, " +
                    "b.id as book_id, b.title, b.author, b.isbn, " +
                    "m.name as member_name, m.member_id as member_code, m.email as member_email, " +
                    "bc.copy_number " +
                    "FROM loans l " +
                    "JOIN book_copies bc ON l.book_copy_id = bc.id " +
                    "JOIN books b ON bc.book_id = b.id " +
                    "JOIN members m ON l.member_id = m.id " +
                    "WHERE l.status = ? " +
                    "ORDER BY l.issue_date DESC";

            stmt = conn.prepareStatement(sql);
            stmt.setString(1, status);
            rs = stmt.executeQuery();

            while (rs.next()) {
                loans.add(mapResultSetToLoan(rs));
            }
        } finally {
            DBUtil.closeResources(conn, stmt, rs);
        }

        return loans;
    }

    /**
     * Find loans by member ID.
     */
    public List<Loan> findByMemberId(String memberId) throws SQLException {
        List<Loan> loans = new ArrayList<>();
        Connection conn = null;
        PreparedStatement stmt = null;
        ResultSet rs = null;

        try {
            conn = DBUtil.getConnection();
            String sql = "SELECT l.id, l.book_copy_id, l.member_id, " +
                    "TO_CHAR(l.issue_date, 'YYYY-MM-DD') as issue_date, " +
                    "TO_CHAR(l.due_date, 'YYYY-MM-DD') as due_date, " +
                    "TO_CHAR(l.return_date, 'YYYY-MM-DD') as return_date, " +
                    "l.status, l.fine_amount, " +
                    "b.id as book_id, b.title, b.author, b.isbn, " +
                    "m.name as member_name, m.member_id as member_code, m.email as member_email, " +
                    "bc.copy_number " +
                    "FROM loans l " +
                    "JOIN book_copies bc ON l.book_copy_id = bc.id " +
                    "JOIN books b ON bc.book_id = b.id " +
                    "JOIN members m ON l.member_id = m.id " +
                    "WHERE l.member_id = ? " +
                    "ORDER BY l.issue_date DESC";

            stmt = conn.prepareStatement(sql);
            stmt.setString(1, memberId);
            rs = stmt.executeQuery();

            while (rs.next()) {
                loans.add(mapResultSetToLoan(rs));
            }
        } finally {
            DBUtil.closeResources(conn, stmt, rs);
        }

        return loans;
    }

    /**
     * Find loan by ID.
     */
    public Loan findById(String id) throws SQLException {
        Connection conn = null;
        PreparedStatement stmt = null;
        ResultSet rs = null;

        try {
            conn = DBUtil.getConnection();
            String sql = "SELECT l.id, l.book_copy_id, l.member_id, " +
                    "TO_CHAR(l.issue_date, 'YYYY-MM-DD') as issue_date, " +
                    "TO_CHAR(l.due_date, 'YYYY-MM-DD') as due_date, " +
                    "TO_CHAR(l.return_date, 'YYYY-MM-DD') as return_date, " +
                    "l.status, l.fine_amount, " +
                    "b.id as book_id, b.title, b.author, b.isbn, " +
                    "m.name as member_name, m.member_id as member_code, m.email as member_email, " +
                    "bc.copy_number " +
                    "FROM loans l " +
                    "JOIN book_copies bc ON l.book_copy_id = bc.id " +
                    "JOIN books b ON bc.book_id = b.id " +
                    "JOIN members m ON l.member_id = m.id " +
                    "WHERE l.id = ?";

            stmt = conn.prepareStatement(sql);
            stmt.setString(1, id);
            rs = stmt.executeQuery();

            if (rs.next()) {
                return mapResultSetToLoan(rs);
            }
            return null;
        } finally {
            DBUtil.closeResources(conn, stmt, rs);
        }
    }

    /**
     * Find active loan for a book copy.
     */
    public Loan findActiveLoanByBookCopyId(String bookCopyId) throws SQLException {
        Connection conn = null;
        PreparedStatement stmt = null;
        ResultSet rs = null;

        try {
            conn = DBUtil.getConnection();
            String sql = "SELECT l.id, l.book_copy_id, l.member_id, " +
                    "TO_CHAR(l.issue_date, 'YYYY-MM-DD') as issue_date, " +
                    "TO_CHAR(l.due_date, 'YYYY-MM-DD') as due_date, " +
                    "TO_CHAR(l.return_date, 'YYYY-MM-DD') as return_date, " +
                    "l.status, l.fine_amount, " +
                    "b.id as book_id, b.title, b.author, b.isbn, " +
                    "m.name as member_name, m.member_id as member_code, m.email as member_email, " +
                    "bc.copy_number " +
                    "FROM loans l " +
                    "JOIN book_copies bc ON l.book_copy_id = bc.id " +
                    "JOIN books b ON bc.book_id = b.id " +
                    "JOIN members m ON l.member_id = m.id " +
                    "WHERE l.book_copy_id = ? AND l.status = 'ISSUED'";

            stmt = conn.prepareStatement(sql);
            stmt.setString(1, bookCopyId);
            rs = stmt.executeQuery();

            if (rs.next()) {
                return mapResultSetToLoan(rs);
            }
            return null;
        } finally {
            DBUtil.closeResources(conn, stmt, rs);
        }
    }

    /**
     * Create a new loan (issue a book).
     */
    public Loan create(String bookCopyId, String memberId, int loanDays) throws SQLException {
        Connection conn = null;
        PreparedStatement stmt = null;

        try {
            conn = DBUtil.getConnection();
            String sql = "INSERT INTO loans (id, book_copy_id, member_id, issue_date, due_date, status) " +
                    "VALUES (?, ?, ?, SYSDATE, SYSDATE + ?, 'ISSUED')";

            String id = DBUtil.generateId();

            stmt = conn.prepareStatement(sql);
            stmt.setString(1, id);
            stmt.setString(2, bookCopyId);
            stmt.setString(3, memberId);
            stmt.setInt(4, loanDays);

            stmt.executeUpdate();

            return findById(id);
        } finally {
            DBUtil.closeResources(conn, stmt);
        }
    }

    /**
     * Return a book (update loan status).
     */
    public ReturnResult returnBook(String loanId, double fineAmount) throws SQLException {
        Connection conn = null;
        PreparedStatement stmt = null;

        try {
            conn = DBUtil.getConnection();
            String sql = "UPDATE loans SET return_date = SYSDATE, status = 'RETURNED', " +
                    "fine_amount = ? WHERE id = ?";

            stmt = conn.prepareStatement(sql);
            stmt.setDouble(1, fineAmount);
            stmt.setString(2, loanId);

            stmt.executeUpdate();

            Loan updatedLoan = findById(loanId);
            return new ReturnResult(true, "Book returned successfully.", updatedLoan);
        } catch (SQLException e) {
            return new ReturnResult(false, "Error returning book: " + e.getMessage(), null);
        } finally {
            DBUtil.closeResources(conn, stmt);
        }
    }

    /**
     * Count overdue loans.
     */
    public int countOverdue() throws SQLException {
        Connection conn = null;
        PreparedStatement stmt = null;
        ResultSet rs = null;

        try {
            conn = DBUtil.getConnection();
            String sql = "SELECT COUNT(*) FROM loans WHERE status = 'ISSUED' AND due_date < SYSDATE";
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
     * Count active loans.
     */
    public int countActive() throws SQLException {
        Connection conn = null;
        PreparedStatement stmt = null;
        ResultSet rs = null;

        try {
            conn = DBUtil.getConnection();
            String sql = "SELECT COUNT(*) FROM loans WHERE status = 'ISSUED'";
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
     * Count today's issues.
     */
    public int countTodayIssues() throws SQLException {
        Connection conn = null;
        PreparedStatement stmt = null;
        ResultSet rs = null;

        try {
            conn = DBUtil.getConnection();
            String sql = "SELECT COUNT(*) FROM loans WHERE TRUNC(issue_date) = TRUNC(SYSDATE)";
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
     * Count today's returns.
     */
    public int countTodayReturns() throws SQLException {
        Connection conn = null;
        PreparedStatement stmt = null;
        ResultSet rs = null;

        try {
            conn = DBUtil.getConnection();
            String sql = "SELECT COUNT(*) FROM loans WHERE TRUNC(return_date) = TRUNC(SYSDATE)";
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

    private Loan mapResultSetToLoan(ResultSet rs) throws SQLException {
        Loan loan = new Loan();
        loan.setId(rs.getString("id"));
        loan.setBookCopyId(rs.getString("book_copy_id"));
        loan.setMemberId(rs.getString("member_id"));
        loan.setIssueDate(rs.getString("issue_date"));
        loan.setDueDate(rs.getString("due_date"));
        loan.setReturnDate(rs.getString("return_date"));
        loan.setStatus(rs.getString("status"));
        loan.setFineAmount(rs.getDouble("fine_amount"));

        // Map related book
        Book book = new Book();
        book.setId(rs.getString("book_id"));
        book.setTitle(rs.getString("title"));
        book.setAuthor(rs.getString("author"));
        book.setIsbn(rs.getString("isbn"));
        loan.setBook(book);

        // Map related member
        Member member = new Member();
        member.setId(rs.getString("member_id"));
        member.setName(rs.getString("member_name"));
        member.setMemberId(rs.getString("member_code"));
        member.setEmail(rs.getString("member_email"));
        loan.setMember(member);

        // Map book copy
        BookCopy copy = new BookCopy();
        copy.setId(rs.getString("book_copy_id"));
        copy.setCopyNumber(rs.getString("copy_number"));
        loan.setBookCopy(copy);

        return loan;
    }

    public static class IssueResult {
        public boolean success;
        public String message;
        public Loan loan;

        public IssueResult(boolean success, String message, Loan loan) {
            this.success = success;
            this.message = message;
            this.loan = loan;
        }
    }

    public static class ReturnResult {
        public boolean success;
        public String message;
        public Loan loan;

        public ReturnResult(boolean success, String message, Loan loan) {
            this.success = success;
            this.message = message;
            this.loan = loan;
        }
    }

    public IssueResult issueBook(String memberId, String bookCopyId, String dueDate, String issuedBy) {
        Connection conn = null;
        PreparedStatement pstmt = null;

        try {
            conn = DBUtil.getConnection();

            // Check if book copy is available
            String checkSql = "SELECT status FROM book_copies WHERE id = ?";
            pstmt = conn.prepareStatement(checkSql);
            pstmt.setString(1, bookCopyId);
            ResultSet rs = pstmt.executeQuery();

            if (!rs.next()) {
                return new IssueResult(false, "Book copy not found", null);
            }

            String status = rs.getString("status");
            if (!"AVAILABLE".equals(status)) {
                return new IssueResult(false, "Book copy is not available", null);
            }

            // Create loan
            String insertSql = "INSERT INTO loans (id, member_id, book_copy_id, issue_date, due_date, issued_by, status) VALUES (?, ?, ?, CURRENT_TIMESTAMP, ?, ?, 'ACTIVE')";
            pstmt = conn.prepareStatement(insertSql);
            String loanId = java.util.UUID.randomUUID().toString();
            pstmt.setString(1, loanId);
            pstmt.setString(2, memberId);
            pstmt.setString(3, bookCopyId);
            pstmt.setString(4, dueDate);
            pstmt.setString(5, issuedBy);
            pstmt.executeUpdate();

            // Update book copy status
            String updateSql = "UPDATE book_copies SET status = 'ISSUED' WHERE id = ?";
            pstmt = conn.prepareStatement(updateSql);
            pstmt.setString(1, bookCopyId);
            pstmt.executeUpdate();

            // Fetch and return the created loan
            Loan loan = findById(loanId);
            return new IssueResult(true, "Book issued successfully", loan);

        } catch (Exception e) {
            e.printStackTrace();
            return new IssueResult(false, "Error issuing book: " + e.getMessage(), null);
        } finally {
            DBUtil.closeResources(conn, pstmt, null);
        }
    }
}