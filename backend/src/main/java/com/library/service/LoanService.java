package com.library.service;

import com.library.dao.*;
import com.library.model.BookCopy;
import com.library.model.Loan;
import com.library.model.Member;

import java.sql.SQLException;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoUnit;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Service layer for loan operations.
 * Handles business logic for issuing and returning books.
 */
public class LoanService {

    private final LoanDAO loanDao;
    private final MemberDAO memberDao;
    private final BookCopyDAO bookCopyDao;

    // Fine rate per day (in currency units)
    private static final double FINE_RATE_PER_DAY = 1.0;
    // Default loan period in days
    private static final int DEFAULT_LOAN_DAYS = 14;

    public LoanService() {
        this.loanDao = new LoanDAO();
        this.memberDao = new MemberDAO();
        this.bookCopyDao = new BookCopyDAO();
    }

    /**
     * Issue a book to a member.
     * 
     * @param bookCopyId ID of the book copy to issue
     * @param memberId   ID of the member borrowing
     * @return Created loan record
     */
    public Loan issueBook(String bookCopyId, String memberId) throws SQLException {
        // Validate member
        Member member = memberDao.findById(memberId);
        if (member == null) {
            throw new IllegalArgumentException("Member not found");
        }

        // Check member status
        if (!"ACTIVE".equals(member.getStatus())) {
            throw new IllegalArgumentException("Member account is not active");
        }

        // Check borrowing limit
        if (member.getCurrentBorrowed() >= member.getMaxBooksAllowed()) {
            throw new IllegalArgumentException(
                    "Member has reached maximum borrowing limit (" +
                            member.getMaxBooksAllowed() + " books)");
        }

        // Validate book copy
        BookCopy copy = bookCopyDao.findById(bookCopyId);
        if (copy == null) {
            throw new IllegalArgumentException("Book copy not found");
        }

        // Check copy availability
        if (!"AVAILABLE".equals(copy.getStatus())) {
            throw new IllegalArgumentException("Book copy is not available (Status: " + copy.getStatus() + ")");
        }

        // Create the loan
        Loan loan = loanDao.create(bookCopyId, memberId, DEFAULT_LOAN_DAYS);

        // Update book copy status to ISSUED
        bookCopyDao.updateStatus(bookCopyId, "ISSUED");

        return loan;
    }

    /**
     * Return a book.
     * 
     * @param loanId ID of the loan to return
     * @return Updated loan record with fine calculation
     */
    public Loan returnBook(String loanId) throws SQLException {
        // Find the loan
        Loan loan = loanDao.findById(loanId);
        if (loan == null) {
            throw new IllegalArgumentException("Loan record not found");
        }

        // Check if already returned
        if ("RETURNED".equals(loan.getStatus())) {
            throw new IllegalArgumentException("This book has already been returned");
        }

        // Calculate fine if overdue
        double fineAmount = calculateFine(loan.getDueDate());

        // Process return
        loanDao.returnBook(loanId, fineAmount);

        // Update book copy status to AVAILABLE
        bookCopyDao.updateStatus(loan.getBookCopyId(), "AVAILABLE");

        // Retrieve the updated loan record
        Loan updatedLoan = loanDao.findById(loanId);
        return updatedLoan;
    }

    /**
     * Get all active loans.
     */
    public List<Loan> getActiveLoans() throws SQLException {
        return loanDao.findActiveLoans();
    }

    /**
     * Get loans for a specific member.
     */
    public List<Loan> getMemberLoans(String memberId) throws SQLException {
        Member member = memberDao.findById(memberId);
        if (member == null) {
            throw new IllegalArgumentException("Member not found");
        }
        return loanDao.findByMemberId(memberId);
    }

    /**
     * Get loan by ID.
     */
    public Loan getLoanById(String id) throws SQLException {
        Loan loan = loanDao.findById(id);
        if (loan == null) {
            throw new IllegalArgumentException("Loan not found");
        }
        return loan;
    }

    /**
     * Get loan statistics for dashboard.
     */
    public Map<String, Integer> getLoanStats() throws SQLException {
        Map<String, Integer> stats = new HashMap<>();
        stats.put("activeLoans", loanDao.countActive());
        stats.put("overdueLoans", loanDao.countOverdue());
        stats.put("todayIssues", loanDao.countTodayIssues());
        stats.put("todayReturns", loanDao.countTodayReturns());
        return stats;
    }

    /**
     * Calculate fine based on due date.
     */
    private double calculateFine(String dueDateStr) {
        try {
            LocalDate dueDate = LocalDate.parse(dueDateStr, DateTimeFormatter.ISO_LOCAL_DATE);
            LocalDate today = LocalDate.now();

            long daysOverdue = ChronoUnit.DAYS.between(dueDate, today);

            if (daysOverdue > 0) {
                return daysOverdue * FINE_RATE_PER_DAY;
            }
            return 0.0;
        } catch (Exception e) {
            return 0.0;
        }
    }
}