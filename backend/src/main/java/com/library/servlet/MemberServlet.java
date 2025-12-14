package com.library.servlet;

import com.library.model.Member;
import com.library.service.MemberService;
import com.library.util.JsonUtil;
import com.library.util.JWTUtil;
import io.jsonwebtoken.Claims;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.Map;

/**
 * Servlet handling member operations.
 * GET /api/members - List all members (ADMIN/LIBRARIAN)
 * GET /api/members/{id} - Get single member
 * POST /api/members - Create new member (ADMIN/LIBRARIAN)
 * PUT /api/members/{id} - Update member
 * 
 * get working / post not working / put not working
 */
@WebServlet("/api/members/*")
public class MemberServlet extends HttpServlet {

    private MemberService memberService;

    @Override
    public void init() throws ServletException {
        memberService = new MemberService();
    }

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        try {
            String pathInfo = request.getPathInfo();

            if (pathInfo == null || "/".equals(pathInfo)) {
                // List all members - staff only
                if (!checkRole(request, "ADMIN", "LIBRARIAN")) {
                    JsonUtil.sendError(response, HttpServletResponse.SC_FORBIDDEN, "Staff access required");
                    return;
                }
                handleGetAllMembers(request, response);
            } else {
                // Get single member
                String memberId = pathInfo.substring(1);
                handleGetMember(request, memberId, response);
            }
        } catch (IllegalArgumentException e) {
            JsonUtil.sendError(response, HttpServletResponse.SC_BAD_REQUEST, e.getMessage());
        } catch (Exception e) {
            JsonUtil.sendError(response, HttpServletResponse.SC_INTERNAL_SERVER_ERROR, e.getMessage());
        }
    }

    @SuppressWarnings("unchecked")
    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        try {
            if (!checkRole(request, "ADMIN", "LIBRARIAN")) {
                JsonUtil.sendError(response, HttpServletResponse.SC_FORBIDDEN, "Staff access required");
                return;
            }

            // Parse request
            Map<String, Object> body = JsonUtil.parseRequest(request, Map.class);

            Member member = new Member();
            member.setName((String) body.get("name"));
            member.setEmail((String) body.get("email"));
            member.setPhone((String) body.get("phone"));
            member.setAddress((String) body.get("address"));
            member.setMembershipType((String) body.get("membershipType"));

            String password = (String) body.get("password");
            if (password == null || password.length() < 6) {
                JsonUtil.sendError(response, HttpServletResponse.SC_BAD_REQUEST,
                        "Password must be at least 6 characters");
                return;
            }

            Member created = memberService.createMember(member, password);
            JsonUtil.sendCreated(response, created);
        } catch (IllegalArgumentException e) {
            JsonUtil.sendError(response, HttpServletResponse.SC_BAD_REQUEST, e.getMessage());
        } catch (Exception e) {
            JsonUtil.sendError(response, HttpServletResponse.SC_INTERNAL_SERVER_ERROR, e.getMessage());
        }
    }

    @Override
    protected void doPut(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        try {
            String pathInfo = request.getPathInfo();
            if (pathInfo == null || "/".equals(pathInfo)) {
                JsonUtil.sendError(response, HttpServletResponse.SC_BAD_REQUEST, "Member ID required");
                return;
            }

            String memberId = pathInfo.substring(1);

            // Check authorization - staff or own profile
            Claims claims = getTokenClaims(request);
            if (claims == null) {
                JsonUtil.sendError(response, HttpServletResponse.SC_UNAUTHORIZED, "Authentication required");
                return;
            }

            String role = claims.get("role", String.class);
            String userId = claims.get("userId", String.class);

            boolean isStaff = "ADMIN".equals(role) || "LIBRARIAN".equals(role);
            Member existingMember = memberService.getMemberById(memberId);
            boolean isOwnProfile = existingMember.getUserId().equals(userId);

            if (!isStaff && !isOwnProfile) {
                JsonUtil.sendError(response, HttpServletResponse.SC_FORBIDDEN, "Not authorized");
                return;
            }

            Member member = JsonUtil.parseRequest(request, Member.class);
            Member updated = memberService.updateMember(memberId, member);

            JsonUtil.sendSuccess(response, updated);
        } catch (IllegalArgumentException e) {
            JsonUtil.sendError(response, HttpServletResponse.SC_BAD_REQUEST, e.getMessage());
        } catch (Exception e) {
            JsonUtil.sendError(response, HttpServletResponse.SC_INTERNAL_SERVER_ERROR, e.getMessage());
        }
    }

    private void handleGetAllMembers(HttpServletRequest request, HttpServletResponse response)
            throws Exception {
        String search = request.getParameter("search");
        String status = request.getParameter("status");
        int page = parseIntParam(request, "page", 1);
        int pageSize = parseIntParam(request, "pageSize", 10);

        Map<String, Object> result = memberService.getMembers(search, status, page, pageSize);

        JsonUtil.sendPaginated(
                response,
                result.get("data"),
                (int) result.get("total"),
                (int) result.get("page"),
                (int) result.get("pageSize"));
    }

    private void handleGetMember(HttpServletRequest request, String memberId,
            HttpServletResponse response) throws Exception {
        Member member = memberService.getMemberById(memberId);
        JsonUtil.sendSuccess(response, member);
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

    private int parseIntParam(HttpServletRequest request, String name, int defaultValue) {
        String value = request.getParameter(name);
        if (value != null) {
            try {
                return Integer.parseInt(value);
            } catch (NumberFormatException e) {
                return defaultValue;
            }
        }
        return defaultValue;
    }
}