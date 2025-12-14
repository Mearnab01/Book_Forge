package com.library.service;

import com.library.dao.*;
import com.library.model.User;
import com.library.util.JWTUtil;
import org.mindrot.jbcrypt.BCrypt;

import java.sql.SQLException;
import java.util.HashMap;
import java.util.Map;

/**
 * Service layer for authentication operations.
 * Handles login validation and JWT token generation.
 */
public class AuthService {

    private final UserDAO userDao;

    public AuthService() {
        this.userDao = new UserDAO();
    }

    /**
     * Authenticate user with email and password.
     * 
     * @param email    User email
     * @param password Plain text password
     * @return Map containing token and user info, or null if authentication fails
     */
    public Map<String, Object> login(String email, String password) throws SQLException {
        // Validate input
        if (email == null || email.trim().isEmpty()) {
            throw new IllegalArgumentException("Email is required");
        }
        if (password == null || password.trim().isEmpty()) {
            throw new IllegalArgumentException("Password is required");
        }

        // Find user by email
        User user = userDao.findByEmail(email.trim().toLowerCase());

        if (user == null) {
            return null; // User not found
        }

        // Verify password using BCrypt
        if (!BCrypt.checkpw(password, user.getPasswordHash())) {
            return null; // Password doesn't match
        }

        // Generate JWT token
        String token = JWTUtil.generateToken(
                user.getId(),
                user.getEmail(),
                user.getRole(),
                user.getName());

        // Build response
        Map<String, Object> result = new HashMap<>();
        result.put("token", token);

        Map<String, Object> userInfo = new HashMap<>();
        userInfo.put("id", user.getId());
        userInfo.put("email", user.getEmail());
        userInfo.put("name", user.getName());
        userInfo.put("role", user.getRole());
        result.put("user", userInfo);

        return result;
    }

    /**
     * Validate JWT token and return user info.
     */
    public User validateToken(String token) throws SQLException {
        String userId = JWTUtil.getUserId(token);
        if (userId == null) {
            return null;
        }
        return userDao.findById(userId);
    }

    /**
     * Register a new user.
     */
    public User register(String email, String password, String role) throws SQLException {
        // Validate input
        if (email == null || !email.contains("@")) {
            throw new IllegalArgumentException("Valid email is required");
        }
        if (password == null || password.length() < 6) {
            throw new IllegalArgumentException("Password must be at least 6 characters");
        }

        // Check if email already exists
        if (userDao.emailExists(email)) {
            throw new IllegalArgumentException("Email already registered");
        }

        // Hash password
        String passwordHash = BCrypt.hashpw(password, BCrypt.gensalt());

        // Create user
        User user = new User();
        user.setEmail(email.trim().toLowerCase());
        user.setPasswordHash(passwordHash);
        user.setRole(role != null ? role : "MEMBER");

        return userDao.create(user);
    }

    /**
     * Change user password.
     */
    public boolean changePassword(String userId, String oldPassword, String newPassword)
            throws SQLException {
        User user = userDao.findById(userId);
        if (user == null) {
            throw new IllegalArgumentException("User not found");
        }

        // Verify old password
        if (!BCrypt.checkpw(oldPassword, user.getPasswordHash())) {
            throw new IllegalArgumentException("Current password is incorrect");
        }

        // Hash and update new password
        String newPasswordHash = BCrypt.hashpw(newPassword, BCrypt.gensalt());
        return userDao.updatePassword(userId, newPasswordHash);
    }
}