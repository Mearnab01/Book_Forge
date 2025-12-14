package com.library.servlet;

import com.library.model.BookCopy;
import com.library.service.BookService;
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
 * Servlet handling book copy operations.
 * GET /api/copy_books/{bookId}/copies - List copies for a book
 * POST /api/copy_books/{bookId}/copies - Add new copy (ADMIN/LIBRARIAN)
 * not working
 */
@WebServlet("/api/copy_books/*/copies")
public class BookCopyServlet extends HttpServlet {

    private BookService bookService;

    @Override
    public void init() throws ServletException {
        bookService = new BookService();
    }

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        try {
            String bookId = extractBookId(request);
            if (bookId == null) {
                JsonUtil.sendError(response, HttpServletResponse.SC_BAD_REQUEST, "Book ID required");
                return;
            }

            List<BookCopy> copies = bookService.getBookCopies(bookId);
            JsonUtil.sendSuccess(response, copies);
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
            // Check authorization
            if (!checkRole(request, "ADMIN", "LIBRARIAN")) {
                JsonUtil.sendError(response, HttpServletResponse.SC_FORBIDDEN,
                        "Admin or Librarian access required");
                return;
            }

            String bookId = extractBookId(request);
            if (bookId == null) {
                JsonUtil.sendError(response, HttpServletResponse.SC_BAD_REQUEST, "Book ID required");
                return;
            }

            // Parse request for optional location
            Map<String, String> body = JsonUtil.parseRequest(request, Map.class);
            String location = body != null ? body.get("location") : null;

            BookCopy copy = bookService.addBookCopy(bookId, location);
            JsonUtil.sendCreated(response, copy);
        } catch (IllegalArgumentException e) {
            JsonUtil.sendError(response, HttpServletResponse.SC_BAD_REQUEST, e.getMessage());
        } catch (Exception e) {
            JsonUtil.sendError(response, HttpServletResponse.SC_INTERNAL_SERVER_ERROR, e.getMessage());
        }
    }

    /**
     * Extract book ID from URL path.
     */
    private String extractBookId(HttpServletRequest request) {
        String path = request.getRequestURI();
        // Pattern: /api/books/{bookId}/copies
        String[] parts = path.split("/");
        for (int i = 0; i < parts.length; i++) {
            if ("books".equals(parts[i]) && i + 1 < parts.length) {
                return parts[i + 1];
            }
        }
        return null;
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