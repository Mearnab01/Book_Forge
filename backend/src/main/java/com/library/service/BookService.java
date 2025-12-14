package com.library.service;

import com.library.dao.*;
import com.library.model.Book;
import com.library.model.BookCopy;

import java.sql.SQLException;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Service layer for book operations.
 * Handles business logic for books and book copies.
 */
public class BookService {

    private final BookDAO bookDao;
    private final BookCopyDAO bookCopyDao;

    public BookService() {
        this.bookDao = new BookDAO();
        this.bookCopyDao = new BookCopyDAO();
    }

    /**
     * Get paginated list of books with search and filter.
     */
    public Map<String, Object> getBooks(String search, String category, int page, int pageSize)
            throws SQLException {
        // Validate pagination
        if (page < 1)
            page = 1;
        if (pageSize < 1 || pageSize > 100)
            pageSize = 10;

        // Get books and total count
        List<Book> books = bookDao.findAll(search, category, page, pageSize);
        int total = bookDao.count(search, category);

        // Build paginated response
        Map<String, Object> result = new HashMap<>();
        result.put("data", books);
        result.put("total", total);
        result.put("page", page);
        result.put("pageSize", pageSize);
        result.put("totalPages", (int) Math.ceil((double) total / pageSize));

        return result;
    }

    /**
     * Get a single book by ID.
     */
    public Book getBookById(String id) throws SQLException {
        if (id == null || id.trim().isEmpty()) {
            throw new IllegalArgumentException("Book ID is required");
        }

        Book book = bookDao.findById(id);
        if (book == null) {
            throw new IllegalArgumentException("Book not found");
        }

        return book;
    }

    /**
     * Create a new book.
     */
    public Book createBook(Book book) throws SQLException {
        // Validate required fields
        validateBook(book);

        // Check for duplicate ISBN
        if (bookDao.isbnExists(book.getIsbn(), null)) {
            throw new IllegalArgumentException("A book with this ISBN already exists");
        }

        return bookDao.create(book);
    }

    /**
     * Update an existing book.
     */
    public Book updateBook(String id, Book book) throws SQLException {
        // Check if book exists
        Book existing = bookDao.findById(id);
        if (existing == null) {
            throw new IllegalArgumentException("Book not found");
        }

        // Validate fields
        validateBook(book);

        // Check for duplicate ISBN (excluding current book)
        if (bookDao.isbnExists(book.getIsbn(), id)) {
            throw new IllegalArgumentException("A book with this ISBN already exists");
        }

        return bookDao.update(id, book);
    }

    /**
     * Delete a book.
     */
    public void deleteBook(String id) throws SQLException {
        Book existing = bookDao.findById(id);
        if (existing == null) {
            throw new IllegalArgumentException("Book not found");
        }

        // Check if any copies are currently issued
        List<BookCopy> copies = bookCopyDao.findByBookId(id);
        for (BookCopy copy : copies) {
            if ("ISSUED".equals(copy.getStatus())) {
                throw new IllegalArgumentException("Cannot delete book with issued copies");
            }
        }

        bookDao.delete(id);
    }

    /**
     * Get all copies of a book.
     */
    public List<BookCopy> getBookCopies(String bookId) throws SQLException {
        // Verify book exists
        Book book = bookDao.findById(bookId);
        if (book == null) {
            throw new IllegalArgumentException("Book not found");
        }

        return bookCopyDao.findByBookId(bookId);
    }

    /**
     * Add a new copy to a book.
     */
    public BookCopy addBookCopy(String bookId, String location) throws SQLException {
        // Verify book exists
        Book book = bookDao.findById(bookId);
        if (book == null) {
            throw new IllegalArgumentException("Book not found");
        }

        // Generate copy number
        String copyNumber = bookCopyDao.generateCopyNumber(bookId);

        BookCopy copy = new BookCopy();
        copy.setBookId(bookId);
        copy.setCopyNumber(copyNumber);
        copy.setStatus("AVAILABLE");
        copy.setLocation(location != null ? location : "Main Library");

        return bookCopyDao.create(copy);
    }

    /**
     * Get all book categories.
     */
    public List<String> getCategories() throws SQLException {
        return bookDao.getCategories();
    }

    /**
     * Validate book fields.
     */
    private void validateBook(Book book) {
        if (book.getTitle() == null || book.getTitle().trim().isEmpty()) {
            throw new IllegalArgumentException("Title is required");
        }
        if (book.getAuthor() == null || book.getAuthor().trim().isEmpty()) {
            throw new IllegalArgumentException("Author is required");
        }
        if (book.getIsbn() == null || book.getIsbn().trim().isEmpty()) {
            throw new IllegalArgumentException("ISBN is required");
        }
        if (book.getCategory() == null || book.getCategory().trim().isEmpty()) {
            throw new IllegalArgumentException("Category is required");
        }
    }
}