package com.library.servlet;

import com.library.model.Loan;
import com.library.service.LoanService;
import com.library.util.JsonUtil;
import com.library.util.JWTUtil;
import io.jsonwebtoken.Claims;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.List;
import java.util.Map;

/**
 * Servlet handling loan operations.
 * GET /api/loans/active - Get active loans (ADMIN/LIBRARIAN)
 * GET /api/loans/member/{id} - Get member's loans
 * POST /api/loans/issue - Issue a book (ADMIN/LIBRARIAN)
 * POST /api/loans/return - Return a book (ADMIN/LIBRARIAN)
 * get working / post not working
 */
@WebServlet("/api/loans/*")
public class LoanServlet extends HttpServlet {

    private LoanService loanService;

    @Override
    public void init() throws ServletException {
        loanService = new LoanService();
    }

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        try {
            String pathInfo = request.getPathInfo();

            if ("/active".equals(pathInfo)) {
                // Get active loans - staff only
                if (!checkRole(request, "ADMIN", "LIBRARIAN")) {
                    JsonUtil.sendError(response, HttpServletResponse.SC_FORBIDDEN, "Staff access required");
                    return;
                }
                List<Loan> loans = loanService.getActiveLoans();
                JsonUtil.sendSuccess(response, loans);

            } else if (pathInfo != null && pathInfo.startsWith("/member/")) {
                // Get member's loans
                String memberId = pathInfo.substring(8);
                handleGetMemberLoans(request, memberId, response);

            } else {
                JsonUtil.sendError(response, HttpServletResponse.SC_NOT_FOUND, "Endpoint not found");
            }
        } catch (IllegalArgumentException e) {
            JsonUtil.sendError(response, HttpServletResponse.SC_BAD_REQUEST, e.getMessage());
        } catch (Exception e) {
            JsonUtil.sendError(response, HttpServletResponse.SC_INTERNAL_SERVER_ERROR, e.getMessage());
        }
    }

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        try {
            // Staff only for issue/return
            if (!checkRole(request, "ADMIN", "LIBRARIAN")) {
                JsonUtil.sendError(response, HttpServletResponse.SC_FORBIDDEN, "Staff access required");
                return;
            }

            String pathInfo = request.getPathInfo();

            if ("/issue".equals(pathInfo)) {
                handleIssueBook(request, response);
            } else if ("/return".equals(pathInfo)) {
                handleReturnBook(request, response);
            } else {
                JsonUtil.sendError(response, HttpServletResponse.SC_NOT_FOUND, "Endpoint not found");
            }
        } catch (IllegalArgumentException e) {
            JsonUtil.sendError(response, HttpServletResponse.SC_BAD_REQUEST, e.getMessage());
        } catch (Exception e) {
            JsonUtil.sendError(response, HttpServletResponse.SC_INTERNAL_SERVER_ERROR, e.getMessage());
        }
    }

    /**
     * Handle GET /api/loans/member/{memberId}
     */
    private void handleGetMemberLoans(HttpServletRequest request, String memberId,
            HttpServletResponse response) throws Exception {
        // Check authorization - staff or own loans
        Claims claims = getTokenClaims(request);
        if (claims == null) {
            JsonUtil.sendError(response, HttpServletResponse.SC_UNAUTHORIZED, "Authentication required");
            return;
        }

        String role = claims.get("role", String.class);
        boolean isStaff = "ADMIN".equals(role) || "LIBRARIAN".equals(role);

        if (!isStaff) {
            // Additional verification could be added here
        }

        List<Loan> loans = loanService.getMemberLoans(memberId);
        JsonUtil.sendSuccess(response, loans);
    }

    /**
     * Handle POST /api/loans/issue
     */
    @SuppressWarnings("unchecked")
    private void handleIssueBook(HttpServletRequest request, HttpServletResponse response)
            throws Exception {
        Map<String, String> body = JsonUtil.parseRequest(request, Map.class);

        String bookCopyId = body.get("bookCopyId");
        String memberId = body.get("memberId");

        if (bookCopyId == null || memberId == null) {
            JsonUtil.sendError(response, HttpServletResponse.SC_BAD_REQUEST,
                    "bookCopyId and memberId are required");
            return;
        }

        Loan loan = loanService.issueBook(bookCopyId, memberId);
        JsonUtil.sendCreated(response, loan);
    }

    /**
     * Handle POST /api/loans/return
     */
    @SuppressWarnings("unchecked")
    private void handleReturnBook(HttpServletRequest request, HttpServletResponse response)
            throws Exception {
        Map<String, String> body = JsonUtil.parseRequest(request, Map.class);

        String loanId = body.get("loanId");

        if (loanId == null) {
            JsonUtil.sendError(response, HttpServletResponse.SC_BAD_REQUEST, "loanId is required");
            return;
        }

        Loan loan = loanService.returnBook(loanId);
        JsonUtil.sendSuccess(response, loan);
    }

    private Claims getTokenClaims(HttpServletRequest request) {
        String authHeader = request.getHeader("Authorization");
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return null;
        }
        return JWTUtil.validateToken(authHeader.substring(7));
    }

    private boolean checkRole(HttpServletRequest request, String... requiredRoles) {
        Claims claims = getTokenClaims(request);
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