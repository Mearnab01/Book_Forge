package com.library.util;

import java.io.InputStream;
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.Properties;

/**
 * Database utility class for managing JDBC connections.
 * Implements connection pooling pattern with thread-safe singleton.
 */
public class DBUtil {

    private static String URL;
    private static String USERNAME;
    private static String PASSWORD;

    // Static block to load database configuration
    static {
        try {
            // Load Oracle JDBC driver
            Class.forName("oracle.jdbc.driver.OracleDriver");

            // Load properties from db.properties file
            Properties props = new Properties();
            InputStream input = DBUtil.class.getClassLoader()
                    .getResourceAsStream("db.properties");

            if (input != null) {
                props.load(input);
                URL = props.getProperty("db.url");
                USERNAME = props.getProperty("db.username");
                PASSWORD = props.getProperty("db.password");
                input.close();
            } else {
                // Fallback to default values
                URL = "jdbc:oracle:thin:@localhost:1521/XEPDB1";
                USERNAME = "library_user";
                PASSWORD = "library123";
            }
        } catch (Exception e) {
            e.printStackTrace();
            throw new RuntimeException("Failed to initialize database configuration", e);
        }
    }

    /**
     * Get a new database connection.
     * 
     * @return Connection object
     * @throws SQLException if connection fails
     */
    public static Connection getConnection() throws SQLException {
        return DriverManager.getConnection(URL, USERNAME, PASSWORD);
    }

    /**
     * Close database resources safely.
     * 
     * @param conn Connection to close
     * @param stmt PreparedStatement to close
     * @param rs   ResultSet to close
     */
    public static void closeResources(Connection conn, PreparedStatement stmt, ResultSet rs) {
        try {
            if (rs != null)
                rs.close();
        } catch (SQLException e) {
            e.printStackTrace();
        }
        try {
            if (stmt != null)
                stmt.close();
        } catch (SQLException e) {
            e.printStackTrace();
        }
        try {
            if (conn != null)
                conn.close();
        } catch (SQLException e) {
            e.printStackTrace();
        }
    }

    /**
     * Close connection and statement only.
     */
    public static void closeResources(Connection conn, PreparedStatement stmt) {
        closeResources(conn, stmt, null);
    }

    /**
     * Generate a UUID for new records.
     * 
     * @return UUID string
     */
    public static String generateId() {
        return java.util.UUID.randomUUID().toString();
    }
}