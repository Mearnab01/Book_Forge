package com.library.dao;

import com.library.model.Book;
import com.library.util.DBUtil;

import java.sql.*;
import java.util.ArrayList;
import java.util.List;

/**
 * Data Access Object for Book entity.
 * Handles all database operations related to books.
 */
public class BookDAO {

    /**
     * Find all books with pagination and optional search.
     * 
     * @param search   Search term for title, author, or ISBN
     * @param category Category filter
     * @param page     Page number (1-based)
     * @param pageSize Number of items per page
     * @return List of books
     */
    public List<Book> findAll(String search, String category, int page, int pageSize)
            throws SQLException {
        List<Book> books = new ArrayList<>();
        Connection conn = null;
        PreparedStatement stmt = null;
        ResultSet rs = null;

        try {
            conn = DBUtil.getConnection();

            // Build dynamic query with search and category filters
            StringBuilder sql = new StringBuilder();
            sql.append("SELECT * FROM (");
            sql.append("  SELECT b.*, ROWNUM rnum FROM (");
            sql.append("    SELECT id, isbn, title, author, publisher, published_year, ");
            sql.append("           category, description, cover_image, ");
            sql.append("           (SELECT COUNT(*) FROM book_copies WHERE book_id = books.id) as total_copies, ");
            sql.append(
                    "           (SELECT COUNT(*) FROM book_copies WHERE book_id = books.id AND status = 'AVAILABLE') as available_copies ");
            sql.append("    FROM books WHERE 1=1 ");

            List<Object> params = new ArrayList<>();

            // Add search filter
            if (search != null && !search.trim().isEmpty()) {
                sql.append("AND (LOWER(title) LIKE ? OR LOWER(author) LIKE ? OR LOWER(isbn) LIKE ?) ");
                String searchPattern = "%" + search.toLowerCase() + "%";
                params.add(searchPattern);
                params.add(searchPattern);
                params.add(searchPattern);
            }

            // Add category filter
            if (category != null && !category.trim().isEmpty()) {
                sql.append("AND category = ? ");
                params.add(category);
            }

            sql.append("    ORDER BY title ASC");
            sql.append("  ) b WHERE ROWNUM <= ?");
            sql.append(") WHERE rnum > ?");

            int offset = (page - 1) * pageSize;
            params.add(offset + pageSize);
            params.add(offset);

            stmt = conn.prepareStatement(sql.toString());

            // Set parameters
            for (int i = 0; i < params.size(); i++) {
                stmt.setObject(i + 1, params.get(i));
            }

            rs = stmt.executeQuery();

            while (rs.next()) {
                books.add(mapResultSetToBook(rs));
            }
        } finally {
            DBUtil.closeResources(conn, stmt, rs);
        }

        return books;
    }

    /**
     * Find book by ID.
     * 
     * @param id Book ID
     * @return Book or null if not found
     */
    public Book findById(String id) throws SQLException {
        Connection conn = null;
        PreparedStatement stmt = null;
        ResultSet rs = null;

        try {
            conn = DBUtil.getConnection();
            String sql = "SELECT id, isbn, title, author, publisher, published_year, " +
                    "category, description, cover_image, " +
                    "(SELECT COUNT(*) FROM book_copies WHERE book_id = books.id) as total_copies, " +
                    "(SELECT COUNT(*) FROM book_copies WHERE book_id = books.id AND status = 'AVAILABLE') as available_copies "
                    +
                    "FROM books WHERE id = ?";

            stmt = conn.prepareStatement(sql);
            stmt.setString(1, id);
            rs = stmt.executeQuery();

            if (rs.next()) {
                return mapResultSetToBook(rs);
            }
            return null;
        } finally {
            DBUtil.closeResources(conn, stmt, rs);
        }
    }

    /**
     * Find book by ISBN.
     */
    public Book findByIsbn(String isbn) throws SQLException {
        Connection conn = null;
        PreparedStatement stmt = null;
        ResultSet rs = null;

        try {
            conn = DBUtil.getConnection();
            String sql = "SELECT id, isbn, title, author, publisher, published_year, " +
                    "category, description, cover_image, " +
                    "(SELECT COUNT(*) FROM book_copies WHERE book_id = books.id) as total_copies, " +
                    "(SELECT COUNT(*) FROM book_copies WHERE book_id = books.id AND status = 'AVAILABLE') as available_copies "
                    +
                    "FROM books WHERE isbn = ?";

            stmt = conn.prepareStatement(sql);
            stmt.setString(1, isbn);
            rs = stmt.executeQuery();

            if (rs.next()) {
                return mapResultSetToBook(rs);
            }
            return null;
        } finally {
            DBUtil.closeResources(conn, stmt, rs);
        }
    }

    /**
     * Create a new book.
     * 
     * @param book Book object to create
     * @return Created book with generated ID
     */
    public Book create(Book book) throws SQLException {
        Connection conn = null;
        PreparedStatement stmt = null;

        try {
            conn = DBUtil.getConnection();
            String sql = "INSERT INTO books (id, isbn, title, author, publisher, " +
                    "published_year, category, description, cover_image) " +
                    "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)";

            String id = DBUtil.generateId();
            book.setId(id);

            stmt = conn.prepareStatement(sql);
            stmt.setString(1, id);
            stmt.setString(2, book.getIsbn());
            stmt.setString(3, book.getTitle());
            stmt.setString(4, book.getAuthor());
            stmt.setString(5, book.getPublisher());
            stmt.setInt(6, book.getPublishedYear());
            stmt.setString(7, book.getCategory());
            stmt.setString(8, book.getDescription());
            stmt.setString(9, book.getCoverImage());

            stmt.executeUpdate();

            // Return the created book with counts
            return findById(id);
        } finally {
            DBUtil.closeResources(conn, stmt);
        }
    }

    /**
     * Update an existing book.
     * 
     * @param id   Book ID
     * @param book Updated book data
     * @return Updated book
     */
    public Book update(String id, Book book) throws SQLException {
        Connection conn = null;
        PreparedStatement stmt = null;

        try {
            conn = DBUtil.getConnection();
            String sql = "UPDATE books SET isbn = ?, title = ?, author = ?, " +
                    "publisher = ?, published_year = ?, category = ?, " +
                    "description = ?, cover_image = ? WHERE id = ?";

            stmt = conn.prepareStatement(sql);
            stmt.setString(1, book.getIsbn());
            stmt.setString(2, book.getTitle());
            stmt.setString(3, book.getAuthor());
            stmt.setString(4, book.getPublisher());
            stmt.setInt(5, book.getPublishedYear());
            stmt.setString(6, book.getCategory());
            stmt.setString(7, book.getDescription());
            stmt.setString(8, book.getCoverImage());
            stmt.setString(9, id);

            int rowsAffected = stmt.executeUpdate();

            if (rowsAffected > 0) {
                return findById(id);
            }
            return null;
        } finally {
            DBUtil.closeResources(conn, stmt);
        }
    }

    /**
     * Delete a book by ID.
     * 
     * @param id Book ID
     * @return true if deleted, false if not found
     */
    public boolean delete(String id) throws SQLException {
        Connection conn = null;
        PreparedStatement stmt = null;

        try {
            conn = DBUtil.getConnection();

            // First delete all book copies
            String deleteCopiesSql = "DELETE FROM book_copies WHERE book_id = ?";
            stmt = conn.prepareStatement(deleteCopiesSql);
            stmt.setString(1, id);
            stmt.executeUpdate();
            stmt.close();

            // Then delete the book
            String sql = "DELETE FROM books WHERE id = ?";
            stmt = conn.prepareStatement(sql);
            stmt.setString(1, id);

            return stmt.executeUpdate() > 0;
        } finally {
            DBUtil.closeResources(conn, stmt);
        }
    }

    /**
     * Count total books matching search criteria.
     */
    public int count(String search, String category) throws SQLException {
        Connection conn = null;
        PreparedStatement stmt = null;
        ResultSet rs = null;

        try {
            conn = DBUtil.getConnection();
            StringBuilder sql = new StringBuilder("SELECT COUNT(*) FROM books WHERE 1=1 ");
            List<Object> params = new ArrayList<>();

            if (search != null && !search.trim().isEmpty()) {
                sql.append("AND (LOWER(title) LIKE ? OR LOWER(author) LIKE ? OR LOWER(isbn) LIKE ?) ");
                String searchPattern = "%" + search.toLowerCase() + "%";
                params.add(searchPattern);
                params.add(searchPattern);
                params.add(searchPattern);
            }

            if (category != null && !category.trim().isEmpty()) {
                sql.append("AND category = ? ");
                params.add(category);
            }

            stmt = conn.prepareStatement(sql.toString());
            for (int i = 0; i < params.size(); i++) {
                stmt.setObject(i + 1, params.get(i));
            }

            rs = stmt.executeQuery();
            if (rs.next()) {
                return rs.getInt(1);
            }
            return 0;
        } finally {
            DBUtil.closeResources(conn, stmt, rs);
        }
    }

    /**
     * Check if ISBN already exists (excluding a specific book ID).
     */
    public boolean isbnExists(String isbn, String excludeId) throws SQLException {
        Connection conn = null;
        PreparedStatement stmt = null;
        ResultSet rs = null;

        try {
            conn = DBUtil.getConnection();
            String sql = "SELECT COUNT(*) FROM books WHERE isbn = ? AND id != ?";
            stmt = conn.prepareStatement(sql);
            stmt.setString(1, isbn);
            stmt.setString(2, excludeId != null ? excludeId : "");
            rs = stmt.executeQuery();

            if (rs.next()) {
                return rs.getInt(1) > 0;
            }
            return false;
        } finally {
            DBUtil.closeResources(conn, stmt, rs);
        }
    }

    /**
     * Get all unique categories.
     */
    public List<String> getCategories() throws SQLException {
        List<String> categories = new ArrayList<>();
        Connection conn = null;
        PreparedStatement stmt = null;
        ResultSet rs = null;

        try {
            conn = DBUtil.getConnection();
            String sql = "SELECT DISTINCT category FROM books ORDER BY category";
            stmt = conn.prepareStatement(sql);
            rs = stmt.executeQuery();

            while (rs.next()) {
                categories.add(rs.getString("category"));
            }
        } finally {
            DBUtil.closeResources(conn, stmt, rs);
        }

        return categories;
    }

    /**
     * Map ResultSet row to Book object.
     */
    private Book mapResultSetToBook(ResultSet rs) throws SQLException {
        Book book = new Book();
        book.setId(rs.getString("id"));
        book.setIsbn(rs.getString("isbn"));
        book.setTitle(rs.getString("title"));
        book.setAuthor(rs.getString("author"));
        book.setPublisher(rs.getString("publisher"));
        book.setPublishedYear(rs.getInt("published_year"));
        book.setCategory(rs.getString("category"));
        book.setDescription(rs.getString("description"));
        book.setCoverImage(rs.getString("cover_image"));
        book.setTotalCopies(rs.getInt("total_copies"));
        book.setAvailableCopies(rs.getInt("available_copies"));
        return book;
    }
}