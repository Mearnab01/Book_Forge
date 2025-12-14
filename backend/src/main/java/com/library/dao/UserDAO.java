package com.library.dao;

import com.library.model.User;
import com.library.util.DBUtil;

import java.sql.*;

/**
 * Data Access Object for User entity.
 * Handles database operations for user authentication.
 */
public class UserDAO {

    /**
     * Find user by email.
     */
    public User findByEmail(String email) throws SQLException {
        Connection conn = null;
        PreparedStatement stmt = null;
        ResultSet rs = null;

        try {
            conn = DBUtil.getConnection();
            String sql = "SELECT u.id, u.email, u.password_hash, u.role, " +
                    "COALESCE(m.name, u.email) as name, " +
                    "TO_CHAR(u.created_at, 'YYYY-MM-DD') as created_at " +
                    "FROM users u " +
                    "LEFT JOIN members m ON u.id = m.user_id " +
                    "WHERE u.email = ?";

            stmt = conn.prepareStatement(sql);
            stmt.setString(1, email);
            rs = stmt.executeQuery();

            if (rs.next()) {
                return mapResultSetToUser(rs);
            }
            return null;
        } finally {
            DBUtil.closeResources(conn, stmt, rs);
        }
    }

    /**
     * Find user by ID.
     */
    public User findById(String id) throws SQLException {
        Connection conn = null;
        PreparedStatement stmt = null;
        ResultSet rs = null;

        try {
            conn = DBUtil.getConnection();
            String sql = "SELECT u.id, u.email, u.password_hash, u.role, " +
                    "COALESCE(m.name, u.email) as name, " +
                    "TO_CHAR(u.created_at, 'YYYY-MM-DD') as created_at " +
                    "FROM users u " +
                    "LEFT JOIN members m ON u.id = m.user_id " +
                    "WHERE u.id = ?";

            stmt = conn.prepareStatement(sql);
            stmt.setString(1, id);
            rs = stmt.executeQuery();

            if (rs.next()) {
                return mapResultSetToUser(rs);
            }
            return null;
        } finally {
            DBUtil.closeResources(conn, stmt, rs);
        }
    }

    /**
     * Create a new user.
     */
    public User create(User user) throws SQLException {
        Connection conn = null;
        PreparedStatement stmt = null;

        try {
            conn = DBUtil.getConnection();
            String sql = "INSERT INTO users (id, email, password_hash, role, created_at) " +
                    "VALUES (?, ?, ?, ?, SYSDATE)";

            String id = DBUtil.generateId();
            user.setId(id);

            stmt = conn.prepareStatement(sql);
            stmt.setString(1, id);
            stmt.setString(2, user.getEmail());
            stmt.setString(3, user.getPasswordHash());
            stmt.setString(4, user.getRole() != null ? user.getRole() : "MEMBER");

            stmt.executeUpdate();

            return findById(id);
        } finally {
            DBUtil.closeResources(conn, stmt);
        }
    }

    /**
     * Update user password.
     */
    public boolean updatePassword(String id, String newPasswordHash) throws SQLException {
        Connection conn = null;
        PreparedStatement stmt = null;

        try {
            conn = DBUtil.getConnection();
            String sql = "UPDATE users SET password_hash = ? WHERE id = ?";

            stmt = conn.prepareStatement(sql);
            stmt.setString(1, newPasswordHash);
            stmt.setString(2, id);

            return stmt.executeUpdate() > 0;
        } finally {
            DBUtil.closeResources(conn, stmt);
        }
    }

    /**
     * Check if email already exists.
     */
    public boolean emailExists(String email) throws SQLException {
        Connection conn = null;
        PreparedStatement stmt = null;
        ResultSet rs = null;

        try {
            conn = DBUtil.getConnection();
            String sql = "SELECT COUNT(*) FROM users WHERE email = ?";
            stmt = conn.prepareStatement(sql);
            stmt.setString(1, email);
            rs = stmt.executeQuery();

            if (rs.next()) {
                return rs.getInt(1) > 0;
            }
            return false;
        } finally {
            DBUtil.closeResources(conn, stmt, rs);
        }
    }

    private User mapResultSetToUser(ResultSet rs) throws SQLException {
        User user = new User();
        user.setId(rs.getString("id"));
        user.setEmail(rs.getString("email"));
        user.setPasswordHash(rs.getString("password_hash"));
        user.setRole(rs.getString("role"));
        user.setName(rs.getString("name"));
        user.setCreatedAt(rs.getString("created_at"));
        return user;
    }
}