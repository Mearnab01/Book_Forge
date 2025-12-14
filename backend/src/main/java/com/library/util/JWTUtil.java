package com.library.util;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;

import javax.crypto.SecretKey;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;

/**
 * JWT utility class for token generation and validation.
 * Uses JJWT library for JWT operations.
 */
public class JWTUtil {

    // Secret key for signing (in production, load from environment variable)
    private static final SecretKey SECRET_KEY = Keys.secretKeyFor(SignatureAlgorithm.HS256);

    // Token expiration time (24 hours)
    private static final long EXPIRATION_TIME = 24 * 60 * 60 * 1000;

    /**
     * Generate JWT token for authenticated user.
     * 
     * @param userId User ID
     * @param email  User email
     * @param role   User role
     * @param name   User name
     * @return JWT token string
     */
    public static String generateToken(String userId, String email, String role, String name) {
        Map<String, Object> claims = new HashMap<>();
        claims.put("userId", userId);
        claims.put("email", email);
        claims.put("role", role);
        claims.put("name", name);

        return Jwts.builder()
                .setClaims(claims)
                .setSubject(email)
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + EXPIRATION_TIME))
                .signWith(SECRET_KEY)
                .compact();
    }

    /**
     * Validate JWT token and return claims.
     * 
     * @param token JWT token
     * @return Claims if valid, null if invalid
     */
    public static Claims validateToken(String token) {
        try {
            return Jwts.parserBuilder()
                    .setSigningKey(SECRET_KEY)
                    .build()
                    .parseClaimsJws(token)
                    .getBody();
        } catch (Exception e) {
            return null;
        }
    }

    /**
     * Extract user ID from token.
     */
    public static String getUserId(String token) {
        Claims claims = validateToken(token);
        return claims != null ? claims.get("userId", String.class) : null;
    }

    /**
     * Extract user role from token.
     */
    public static String getRole(String token) {
        Claims claims = validateToken(token);
        return claims != null ? claims.get("role", String.class) : null;
    }

    /**
     * Check if token is expired.
     */
    public static boolean isTokenExpired(String token) {
        Claims claims = validateToken(token);
        if (claims == null)
            return true;
        return claims.getExpiration().before(new Date());
    }
}