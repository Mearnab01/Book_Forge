package com.library.servlet;

import com.library.model.Reservation;
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
import java.util.List;
import java.util.Map;

/**
 * Servlet handling reservation operations.
 * GET /api/reservations - List reservations
 * POST /api/reservations - Create reservation
 * DELETE /api/reservations/{id} - Cancel reservation
 * working
 */
@WebServlet("/api/reservations/*")
public class ReservationServlet extends HttpServlet {

    private ReservationService reservationService;
    private MemberService memberService;

    @Override
    public void init() throws ServletException {
        reservationService = new ReservationService();
        memberService = new MemberService();
    }

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        try {
            Claims claims = getTokenClaims(request);
            if (claims == null) {
                JsonUtil.sendError(response, HttpServletResponse.SC_UNAUTHORIZED, "Authentication required");
                return;
            }

            String role = claims.get("role", String.class);
            String status = request.getParameter("status");

            List<Reservation> reservations;

            if ("ADMIN".equals(role) || "LIBRARIAN".equals(role)) {
                // Staff can see all reservations
                reservations = reservationService.getReservations(status);
            } else {
                // Members can only see their own
                String userId = claims.get("userId", String.class);
                var member = memberService.getMemberByUserId(userId);
                if (member != null) {
                    reservations = reservationService.getMemberReservations(member.getId());
                } else {
                    JsonUtil.sendError(response, HttpServletResponse.SC_NOT_FOUND, "Member not found");
                    return;
                }
            }

            JsonUtil.sendSuccess(response, reservations);
        } catch (Exception e) {
            JsonUtil.sendError(response, HttpServletResponse.SC_INTERNAL_SERVER_ERROR, e.getMessage());
        }
    }

    @SuppressWarnings("unchecked")
    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        try {
            Claims claims = getTokenClaims(request);
            if (claims == null) {
                JsonUtil.sendError(response, HttpServletResponse.SC_UNAUTHORIZED, "Authentication required");
                return;
            }

            Map<String, String> body = JsonUtil.parseRequest(request, Map.class);
            String bookId = body.get("bookId");
            String memberId = body.get("memberId");

            if (bookId == null) {
                JsonUtil.sendError(response, HttpServletResponse.SC_BAD_REQUEST, "bookId is required");
                return;
            }

            // If memberId not provided, use current user's member ID
            if (memberId == null) {
                String userId = claims.get("userId", String.class);
                var member = memberService.getMemberByUserId(userId);
                if (member != null) {
                    memberId = member.getId();
                } else {
                    JsonUtil.sendError(response, HttpServletResponse.SC_BAD_REQUEST,
                            "memberId required or user must be a member");
                    return;
                }
            }

            Reservation reservation = reservationService.createReservation(bookId, memberId);
            JsonUtil.sendCreated(response, reservation);
        } catch (IllegalArgumentException e) {
            JsonUtil.sendError(response, HttpServletResponse.SC_BAD_REQUEST, e.getMessage());
        } catch (Exception e) {
            JsonUtil.sendError(response, HttpServletResponse.SC_INTERNAL_SERVER_ERROR, e.getMessage());
        }
    }

    @Override
    protected void doDelete(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        try {
            Claims claims = getTokenClaims(request);
            if (claims == null) {
                JsonUtil.sendError(response, HttpServletResponse.SC_UNAUTHORIZED, "Authentication required");
                return;
            }

            String pathInfo = request.getPathInfo();
            if (pathInfo == null || "/".equals(pathInfo)) {
                JsonUtil.sendError(response, HttpServletResponse.SC_BAD_REQUEST, "Reservation ID required");
                return;
            }

            String reservationId = pathInfo.substring(1);
            String userId = claims.get("userId", String.class);
            String role = claims.get("role", String.class);

            // Get member ID for authorization check
            var member = memberService.getMemberByUserId(userId);
            String memberId = member != null ? member.getId() : null;

            reservationService.cancelReservation(reservationId, memberId, role);
            JsonUtil.sendSuccess(response, "Reservation cancelled successfully");
        } catch (IllegalArgumentException e) {
            JsonUtil.sendError(response, HttpServletResponse.SC_BAD_REQUEST, e.getMessage());
        } catch (Exception e) {
            JsonUtil.sendError(response, HttpServletResponse.SC_INTERNAL_SERVER_ERROR, e.getMessage());
        }
    }

    private Claims getTokenClaims(HttpServletRequest request) {
        String authHeader = request.getHeader("Authorization");
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return null;
        }
        return JWTUtil.validateToken(authHeader.substring(7));
    }
}