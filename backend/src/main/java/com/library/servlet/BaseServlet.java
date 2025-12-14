package com.library.servlet;

import com.google.gson.Gson;
import com.library.util.ApiResponse;
import com.library.util.JWTUtil;
import io.jsonwebtoken.Claims;

import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.BufferedReader;
import java.io.IOException;
import java.io.PrintWriter;

public abstract class BaseServlet extends HttpServlet {
    protected final Gson gson = new Gson();

    protected void sendJson(HttpServletResponse resp, int status, Object data) throws IOException {
        resp.setContentType("application/json");
        resp.setCharacterEncoding("UTF-8");
        resp.setStatus(status);
        PrintWriter out = resp.getWriter();
        out.print(gson.toJson(data));
        out.flush();
    }

    protected void sendSuccess(HttpServletResponse resp, Object data) throws IOException {
        sendJson(resp, 200, ApiResponse.success(data));
    }

    protected void sendSuccess(HttpServletResponse resp, Object data, String message) throws IOException {
        sendJson(resp, 200, ApiResponse.success(data, message));
    }

    protected void sendCreated(HttpServletResponse resp, Object data, String message) throws IOException {
        sendJson(resp, 201, ApiResponse.success(data, message));
    }

    protected void sendError(HttpServletResponse resp, int status, String message) throws IOException {
        sendJson(resp, status, ApiResponse.error(message));
    }

    protected <T> T readBody(HttpServletRequest req, Class<T> clazz) throws IOException {
        StringBuilder sb = new StringBuilder();
        BufferedReader reader = req.getReader();
        String line;
        while ((line = reader.readLine()) != null) {
            sb.append(line);
        }
        return gson.fromJson(sb.toString(), clazz);
    }

    protected String getPathId(HttpServletRequest req) {
        String pathInfo = req.getPathInfo();
        if (pathInfo != null && pathInfo.length() > 1) {
            return pathInfo.substring(1); // Remove leading slash
        }
        return null;
    }

    protected Claims authenticate(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        String authHeader = req.getHeader("Authorization");

        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            sendError(resp, 401, "Missing or invalid authorization header");
            return null;
        }

        String token = authHeader.substring(7);

        try {
            return JWTUtil.validateToken(token);
        } catch (Exception e) {
            sendError(resp, 401, "Invalid or expired token");
            return null;
        }
    }

    protected boolean hasRole(Claims claims, String... roles) {
        String userRole = claims.get("role", String.class);
        for (String role : roles) {
            if (role.equals(userRole)) {
                return true;
            }
        }
        return false;
    }

    protected boolean requireRole(HttpServletRequest req, HttpServletResponse resp, String... roles)
            throws IOException {
        Claims claims = authenticate(req, resp);
        if (claims == null)
            return false;

        if (!hasRole(claims, roles)) {
            sendError(resp, 403, "Insufficient permissions");
            return false;
        }

        req.setAttribute("claims", claims);
        return true;
    }
}