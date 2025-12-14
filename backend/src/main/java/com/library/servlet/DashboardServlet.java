package com.library.servlet;

import com.library.dao.*;
import com.library.service.LoanService;
import com.library.service.MemberService;
import com.library.service.ReservationService;
import com.library.util.JsonUtil;
import com.library.util.JWTUtil;
import io.jsonwebtoken.Claims;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.HashMap;
import java.util.Map;

/**
 * Servlet providing dashboard statistics.
 * GET /api/dashboard/stats - Get dashboard statistics (ADMIN/LIBRARIAN)
 * working
 */
@WebServlet("/api/dashboard/*")
public class DashboardServlet extends HttpServlet {

    private BookDAO bookDao;
    private LoanService loanService;
    private MemberService memberService;
    private ReservationService reservationService;

    @Override
    public void init() throws ServletException {
        bookDao = new BookDAO();
        loanService = new LoanService();
        memberService = new MemberService();
        reservationService = new ReservationService();
    }

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        try {
            String pathInfo = request.getPathInfo();

            if ("/stats".equals(pathInfo)) {
                // Check authorization - staff only
                if (!checkRole(request, "ADMIN", "LIBRARIAN")) {
                    JsonUtil.sendError(response, HttpServletResponse.SC_FORBIDDEN, "Staff access required");
                    return;
                }

                handleGetStats(response);
            } else {
                JsonUtil.sendError(response, HttpServletResponse.SC_NOT_FOUND, "Endpoint not found");
            }
        } catch (Exception e) {
            JsonUtil.sendError(response, HttpServletResponse.SC_INTERNAL_SERVER_ERROR, e.getMessage());
        }
    }

    /**
     * Handle GET /api/dashboard/stats
     * Returns comprehensive library statistics.
     */
    private void handleGetStats(HttpServletResponse response) throws Exception {
        Map<String, Object> stats = new HashMap<>();

        // Book statistics
        int totalBooks = bookDao.count(null, null);
        stats.put("totalBooks", totalBooks);
        stats.put("availableBooks", totalBooks);

        // Member statistics
        int totalMembers = memberService.countActiveMembers();
        stats.put("totalMembers", totalMembers);

        // Loan statistics
        Map<String, Integer> loanStats = loanService.getLoanStats();
        stats.put("activeLoans", loanStats.get("activeLoans"));
        stats.put("overdueLoans", loanStats.get("overdueLoans"));
        stats.put("todayIssues", loanStats.get("todayIssues"));
        stats.put("todayReturns", loanStats.get("todayReturns"));

        // Reservation statistics
        int pendingReservations = reservationService.countPending();
        stats.put("pendingReservations", pendingReservations);

        JsonUtil.sendSuccess(response, stats);
    }

    private boolean checkRole(HttpServletRequest request, String... requiredRoles) {
        String authHeader = request.getHeader("Authorization");
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return false;
        }

        String token = authHeader.substring(7);
        Claims claims = JWTUtil.validateToken(token);

        if (claims == null)
            return false;

        String userRole = claims.get("role", String.class);
        for (String role : requiredRoles) {
            if (role.equals(userRole))
                return true;
        }
        return false;
    }
}