package com.library.model;

/**
 * BookCopy entity representing a physical copy of a book.
 * Maps to the 'book_copies' table in the database.
 */
public class BookCopy {
    private String id;
    private String bookId;
    private String copyNumber;
    private String status; // AVAILABLE, ISSUED, RESERVED, DAMAGED, LOST
    private String location;
    private String addedDate;

    // Reference to parent book (for joined queries)
    private Book book;

    public BookCopy() {
    }

    public BookCopy(String id, String bookId, String copyNumber, String status,
            String location, String addedDate) {
        this.id = id;
        this.bookId = bookId;
        this.copyNumber = copyNumber;
        this.status = status;
        this.location = location;
        this.addedDate = addedDate;
    }

    // Getters and Setters
    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getBookId() {
        return bookId;
    }

    public void setBookId(String bookId) {
        this.bookId = bookId;
    }

    public String getCopyNumber() {
        return copyNumber;
    }

    public void setCopyNumber(String copyNumber) {
        this.copyNumber = copyNumber;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getLocation() {
        return location;
    }

    public void setLocation(String location) {
        this.location = location;
    }

    public String getAddedDate() {
        return addedDate;
    }

    public void setAddedDate(String addedDate) {
        this.addedDate = addedDate;
    }

    public Book getBook() {
        return book;
    }

    public void setBook(Book book) {
        this.book = book;
    }
}