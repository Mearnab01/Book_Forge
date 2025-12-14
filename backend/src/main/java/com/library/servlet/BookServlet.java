package com.library.servlet;

import com.library.model.Book;
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
import java.util.Map;

/**
 * Servlet handling book CRUD operations.
 * GET /api/books - List all books (paginated)
 * GET /api/books/{id} - Get single book
 * POST /api/books - Create new book (ADMIN/LIBRARIAN)
 * PUT /api/books/{id} - Update book (ADMIN/LIBRARIAN)
 * DELETE /api/books/{id} - Delete book (ADMIN only)
 * working
 */
@WebServlet("/api/books/*")
public class BookServlet extends HttpServlet {

    private BookService bookService;

    @Override
    public void init() throws ServletException {
        bookService = new BookService();
    }

    /**
     * GET - Retrieve books or single book.
     */
    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        try {
            String pathInfo = request.getPathInfo();

            if (pathInfo == null || "/".equals(pathInfo)) {
                // GET /api/books - List all books
                handleGetAllBooks(request, response);
            } else {
                // GET /api/books/{id} - Get single book
                String bookId = pathInfo.substring(1);
                handleGetBook(bookId, response);
            }
        } catch (IllegalArgumentException e) {
            JsonUtil.sendError(response, HttpServletResponse.SC_BAD_REQUEST, e.getMessage());
        } catch (Exception e) {
            JsonUtil.sendError(response, HttpServletResponse.SC_INTERNAL_SERVER_ERROR, e.getMessage());
        }
    }

    /**
     * POST - Create a new book.
     */
    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        try {
            // Check authorization (ADMIN or LIBRARIAN required)
            if (!checkRole(request, "ADMIN", "LIBRARIAN")) {
                JsonUtil.sendError(response, HttpServletResponse.SC_FORBIDDEN,
                        "Admin or Librarian access required");
                return;
            }

            // Parse and create book
            Book book = JsonUtil.parseRequest(request, Book.class);
            Book createdBook = bookService.createBook(book);

            JsonUtil.sendCreated(response, createdBook);
        } catch (IllegalArgumentException e) {
            JsonUtil.sendError(response, HttpServletResponse.SC_BAD_REQUEST, e.getMessage());
        } catch (Exception e) {
            JsonUtil.sendError(response, HttpServletResponse.SC_INTERNAL_SERVER_ERROR, e.getMessage());
        }
    }

    /**
     * PUT - Update an existing book.
     */
    @Override
    protected void doPut(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        try {
            // Check authorization
            if (!checkRole(request, "ADMIN", "LIBRARIAN")) {
                JsonUtil.sendError(response, HttpServletResponse.SC_FORBIDDEN,
                        "Admin or Librarian access required");
                return;
            }

            String pathInfo = request.getPathInfo();
            if (pathInfo == null || "/".equals(pathInfo)) {
                JsonUtil.sendError(response, HttpServletResponse.SC_BAD_REQUEST, "Book ID required");
                return;
            }

            String bookId = pathInfo.substring(1);
            Book book = JsonUtil.parseRequest(request, Book.class);
            Book updatedBook = bookService.updateBook(bookId, book);

            JsonUtil.sendSuccess(response, updatedBook);
        } catch (IllegalArgumentException e) {
            JsonUtil.sendError(response, HttpServletResponse.SC_BAD_REQUEST, e.getMessage());
        } catch (Exception e) {
            JsonUtil.sendError(response, HttpServletResponse.SC_INTERNAL_SERVER_ERROR, e.getMessage());
        }
    }

    /**
     * DELETE - Delete a book.
     */
    @Override
    protected void doDelete(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        try {
            // Check authorization (ADMIN only)
            if (!checkRole(request, "ADMIN")) {
                JsonUtil.sendError(response, HttpServletResponse.SC_FORBIDDEN, "Admin access required");
                return;
            }

            String pathInfo = request.getPathInfo();
            if (pathInfo == null || "/".equals(pathInfo)) {
                JsonUtil.sendError(response, HttpServletResponse.SC_BAD_REQUEST, "Book ID required");
                return;
            }

            String bookId = pathInfo.substring(1);
            bookService.deleteBook(bookId);

            JsonUtil.sendSuccess(response, "Book deleted successfully");
        } catch (IllegalArgumentException e) {
            JsonUtil.sendError(response, HttpServletResponse.SC_BAD_REQUEST, e.getMessage());
        } catch (Exception e) {
            JsonUtil.sendError(response, HttpServletResponse.SC_INTERNAL_SERVER_ERROR, e.getMessage());
        }
    }

    /**
     * Handle GET /api/books - List all books with pagination.
     */
    private void handleGetAllBooks(HttpServletRequest request, HttpServletResponse response)
            throws Exception {
        // Parse query parameters
        String search = request.getParameter("search");
        String category = request.getParameter("category");
        int page = parseIntParam(request, "page", 1);
        int pageSize = parseIntParam(request, "pageSize", 10);

        // Get paginated books
        Map<String, Object> result = bookService.getBooks(search, category, page, pageSize);

        // Send paginated response
        JsonUtil.sendPaginated(
                response,
                result.get("data"),
                (int) result.get("total"),
                (int) result.get("page"),
                (int) result.get("pageSize"));
    }

    /**
     * Handle GET /api/books/{id} - Get single book.
     */
    private void handleGetBook(String bookId, HttpServletResponse response) throws Exception {
        Book book = bookService.getBookById(bookId);
        JsonUtil.sendSuccess(response, book);
    }

    /**
     * Check if user has required role.
     */
    private boolean checkRole(HttpServletRequest request, String... requiredRoles) {
        String authHeader = request.getHeader("Authorization");
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return false;
        }

        String token = authHeader.substring(7);
        Claims claims = JWTUtil.validateToken(token);

        if (claims == null) {
            return false;
        }

        String userRole = claims.get("role", String.class);
        for (String role : requiredRoles) {
            if (role.equals(userRole)) {
                return true;
            }
        }
        return false;
    }

    /**
     * Parse integer query parameter with default value.
     */
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