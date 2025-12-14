package com.library.util;

import com.google.gson.Gson;
import com.google.gson.GsonBuilder;
import com.google.gson.JsonObject;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.BufferedReader;
import java.io.IOException;
import java.io.PrintWriter;

/**
 * JSON utility class for parsing requests and formatting responses.
 * Uses Gson library for JSON serialization/deserialization.
 */
public class JsonUtil {

    // Thread-safe Gson instance with pretty printing
    private static final Gson gson = new GsonBuilder()
            .setDateFormat("yyyy-MM-dd'T'HH:mm:ss.SSS'Z'")
            .setPrettyPrinting()
            .create();

    /**
     * Parse JSON request body into specified class type.
     * 
     * @param request HttpServletRequest
     * @param clazz   Target class type
     * @return Parsed object
     */
    public static <T> T parseRequest(HttpServletRequest request, Class<T> clazz)
            throws IOException {
        StringBuilder sb = new StringBuilder();
        BufferedReader reader = request.getReader();
        String line;
        while ((line = reader.readLine()) != null) {
            sb.append(line);
        }
        return gson.fromJson(sb.toString(), clazz);
    }

    /**
     * Parse JSON string into specified class type.
     */
    public static <T> T fromJson(String json, Class<T> clazz) {
        return gson.fromJson(json, clazz);
    }

    /**
     * Convert object to JSON string.
     */
    public static String toJson(Object obj) {
        return gson.toJson(obj);
    }

    /**
     * Send successful JSON response with data.
     */
    public static void sendSuccess(HttpServletResponse response, Object data)
            throws IOException {
        sendResponse(response, HttpServletResponse.SC_OK, true, data, null);
    }

    /**
     * Send successful JSON response with message.
     */
    public static void sendSuccess(HttpServletResponse response, String message)
            throws IOException {
        JsonObject result = new JsonObject();
        result.addProperty("success", true);
        result.addProperty("message", message);
        sendJson(response, HttpServletResponse.SC_OK, result);
    }

    /**
     * Send created response (201).
     */
    public static void sendCreated(HttpServletResponse response, Object data)
            throws IOException {
        sendResponse(response, HttpServletResponse.SC_CREATED, true, data, null);
    }

    /**
     * Send error JSON response.
     */
    public static void sendError(HttpServletResponse response, int statusCode, String message)
            throws IOException {
        sendResponse(response, statusCode, false, null, message);
    }

    /**
     * Send paginated response.
     */
    public static void sendPaginated(HttpServletResponse response, Object data,
            int total, int page, int pageSize) throws IOException {
        JsonObject result = new JsonObject();
        result.addProperty("success", true);
        result.add("data", gson.toJsonTree(data));
        result.addProperty("total", total);
        result.addProperty("page", page);
        result.addProperty("pageSize", pageSize);
        result.addProperty("totalPages", (int) Math.ceil((double) total / pageSize));
        sendJson(response, HttpServletResponse.SC_OK, result);
    }

    /**
     * Generic response sender.
     */
    private static void sendResponse(HttpServletResponse response, int statusCode,
            boolean success, Object data, String error) throws IOException {
        JsonObject result = new JsonObject();
        result.addProperty("success", success);
        if (data != null) {
            result.add("data", gson.toJsonTree(data));
        }
        if (error != null) {
            result.addProperty("error", error);
        }
        sendJson(response, statusCode, result);
    }

    /**
     * Write JSON to response.
     */
    private static void sendJson(HttpServletResponse response, int statusCode, Object obj)
            throws IOException {
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");
        response.setStatus(statusCode);
        PrintWriter writer = response.getWriter();
        writer.print(gson.toJson(obj));
        writer.flush();
    }
}