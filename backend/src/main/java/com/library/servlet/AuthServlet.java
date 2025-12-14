package com.library.servlet;

import com.library.service.AuthService;
import com.library.util.JsonUtil;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.Map;

/**
 * Servlet handling authentication endpoints.
 * POST /api/auth/login - User login
 * 
 * works
 */
@WebServlet("/api/auth/*")
public class AuthServlet extends HttpServlet {

    private AuthService authService;

    @Override
    public void init() throws ServletException {
        authService = new AuthService();
    }

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        String pathInfo = request.getPathInfo();

        try {
            if ("/login".equals(pathInfo)) {
                handleLogin(request, response);
            } else {
                JsonUtil.sendError(response, HttpServletResponse.SC_NOT_FOUND, "Endpoint not found");
            }
        } catch (Exception e) {
            JsonUtil.sendError(response, HttpServletResponse.SC_INTERNAL_SERVER_ERROR, e.getMessage());
        }
    }

    /**
     * Handle POST /api/auth/login
     * Authenticates user and returns JWT token.
     */
    @SuppressWarnings("unchecked")
    private void handleLogin(HttpServletRequest request, HttpServletResponse response)
            throws IOException {
        try {
            // Parse request body
            Map<String, String> credentials = JsonUtil.parseRequest(request, Map.class);

            String email = credentials.get("email");
            String password = credentials.get("password");

            // Attempt login
            Map<String, Object> result = authService.login(email, password);

            if (result != null) {
                // Login successful
                JsonUtil.sendSuccess(response, result);
            } else {
                // Login failed
                JsonUtil.sendError(response, HttpServletResponse.SC_UNAUTHORIZED,
                        "Invalid email or password");
            }
        } catch (IllegalArgumentException e) {
            JsonUtil.sendError(response, HttpServletResponse.SC_BAD_REQUEST, e.getMessage());
        } catch (Exception e) {
            JsonUtil.sendError(response, HttpServletResponse.SC_INTERNAL_SERVER_ERROR,
                    "Login failed: " + e.getMessage());
        }
    }
}