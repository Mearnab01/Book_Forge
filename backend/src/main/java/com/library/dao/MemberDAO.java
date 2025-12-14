package com.library.dao;

import com.library.model.Member;
import com.library.util.DBUtil;

import java.sql.*;
import java.util.ArrayList;
import java.util.List;

/**
 * Data Access Object for Member entity.
 * Handles database operations for library members.
 */
public class MemberDAO {

    /**
     * Find all members with pagination and search.
     */
    public List<Member> findAll(String search, String status, int page, int pageSize)
            throws SQLException {
        List<Member> members = new ArrayList<>();
        Connection conn = null;
        PreparedStatement stmt = null;
        ResultSet rs = null;

        try {
            conn = DBUtil.getConnection();

            StringBuilder sql = new StringBuilder();
            sql.append("SELECT * FROM (");
            sql.append("  SELECT m.*, ROWNUM rnum FROM (");
            sql.append("    SELECT id, user_id, member_id, name, email, phone, address, ");
            sql.append("           TO_CHAR(join_date, 'YYYY-MM-DD') as join_date, ");
            sql.append("           membership_type, status, max_books_allowed, ");
            sql.append(
                    "           (SELECT COUNT(*) FROM loans WHERE member_id = members.id AND status = 'ISSUED') as current_borrowed ");
            sql.append("    FROM members WHERE 1=1 ");

            List<Object> params = new ArrayList<>();

            if (search != null && !search.trim().isEmpty()) {
                sql.append("AND (LOWER(name) LIKE ? OR LOWER(email) LIKE ? OR LOWER(member_id) LIKE ?) ");
                String searchPattern = "%" + search.toLowerCase() + "%";
                params.add(searchPattern);
                params.add(searchPattern);
                params.add(searchPattern);
            }

            if (status != null && !status.trim().isEmpty()) {
                sql.append("AND status = ? ");
                params.add(status);
            }

            sql.append("    ORDER BY name ASC");
            sql.append("  ) m WHERE ROWNUM <= ?");
            sql.append(") WHERE rnum > ?");

            int offset = (page - 1) * pageSize;
            params.add(offset + pageSize);
            params.add(offset);

            stmt = conn.prepareStatement(sql.toString());
            for (int i = 0; i < params.size(); i++) {
                stmt.setObject(i + 1, params.get(i));
            }

            rs = stmt.executeQuery();

            while (rs.next()) {
                members.add(mapResultSetToMember(rs));
            }
        } finally {
            DBUtil.closeResources(conn, stmt, rs);
        }

        return members;
    }

    /**
     * Find member by ID.
     */
    public Member findById(String id) throws SQLException {
        Connection conn = null;
        PreparedStatement stmt = null;
        ResultSet rs = null;

        try {
            conn = DBUtil.getConnection();
            String sql = "SELECT id, user_id, member_id, name, email, phone, address, " +
                    "TO_CHAR(join_date, 'YYYY-MM-DD') as join_date, " +
                    "membership_type, status, max_books_allowed, " +
                    "(SELECT COUNT(*) FROM loans WHERE member_id = members.id AND status = 'ISSUED') as current_borrowed "
                    +
                    "FROM members WHERE id = ?";

            stmt = conn.prepareStatement(sql);
            stmt.setString(1, id);
            rs = stmt.executeQuery();

            if (rs.next()) {
                return mapResultSetToMember(rs);
            }
            return null;
        } finally {
            DBUtil.closeResources(conn, stmt, rs);
        }
    }

    /**
     * Find member by user ID.
     */
    public Member findByUserId(String userId) throws SQLException {
        Connection conn = null;
        PreparedStatement stmt = null;
        ResultSet rs = null;

        try {
            conn = DBUtil.getConnection();
            String sql = "SELECT id, user_id, member_id, name, email, phone, address, " +
                    "TO_CHAR(join_date, 'YYYY-MM-DD') as join_date, " +
                    "membership_type, status, max_books_allowed, " +
                    "(SELECT COUNT(*) FROM loans WHERE member_id = members.id AND status = 'ISSUED') as current_borrowed "
                    +
                    "FROM members WHERE user_id = ?";

            stmt = conn.prepareStatement(sql);
            stmt.setString(1, userId);
            rs = stmt.executeQuery();

            if (rs.next()) {
                return mapResultSetToMember(rs);
            }
            return null;
        } finally {
            DBUtil.closeResources(conn, stmt, rs);
        }
    }

    /**
     * Create a new member.
     */
    public Member create(Member member) throws SQLException {
        Connection conn = null;
        PreparedStatement stmt = null;

        try {
            conn = DBUtil.getConnection();
            String sql = "INSERT INTO members (id, user_id, name, email, phone, address, " +
                    "join_date, membership_type, status, max_books_allowed) " +
                    "VALUES (?, ?, ?, ?, ?, ?, SYSDATE, ?, ?, ?)";

            String id = DBUtil.generateId();
            member.setId(id);

            stmt = conn.prepareStatement(sql);
            stmt.setString(1, id);
            stmt.setString(2, member.getUserId());
            stmt.setString(3, member.getName());
            stmt.setString(4, member.getEmail());
            stmt.setString(5, member.getPhone());
            stmt.setString(6, member.getAddress());
            stmt.setString(7, member.getMembershipType() != null ? member.getMembershipType() : "STANDARD");
            stmt.setString(8, "ACTIVE");
            stmt.setInt(9, getMaxBooksForType(member.getMembershipType()));

            stmt.executeUpdate();

            return findById(id);
        } finally {
            DBUtil.closeResources(conn, stmt);
        }
    }

    /**
     * Update member details.
     */
    public Member update(String id, Member member) throws SQLException {
        Connection conn = null;
        PreparedStatement stmt = null;

        try {
            conn = DBUtil.getConnection();
            String sql = "UPDATE members SET name = ?, email = ?, phone = ?, address = ?, " +
                    "membership_type = ?, status = ?, max_books_allowed = ? WHERE id = ?";

            stmt = conn.prepareStatement(sql);
            stmt.setString(1, member.getName());
            stmt.setString(2, member.getEmail());
            stmt.setString(3, member.getPhone());
            stmt.setString(4, member.getAddress());
            stmt.setString(5, member.getMembershipType());
            stmt.setString(6, member.getStatus());
            stmt.setInt(7, getMaxBooksForType(member.getMembershipType()));
            stmt.setString(8, id);

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
     * Count total members matching criteria.
     */
    public int count(String search, String status) throws SQLException {
        Connection conn = null;
        PreparedStatement stmt = null;
        ResultSet rs = null;

        try {
            conn = DBUtil.getConnection();
            StringBuilder sql = new StringBuilder("SELECT COUNT(*) FROM members WHERE 1=1 ");
            List<Object> params = new ArrayList<>();

            if (search != null && !search.trim().isEmpty()) {
                sql.append("AND (LOWER(name) LIKE ? OR LOWER(email) LIKE ? OR LOWER(member_id) LIKE ?) ");
                String searchPattern = "%" + search.toLowerCase() + "%";
                params.add(searchPattern);
                params.add(searchPattern);
                params.add(searchPattern);
            }

            if (status != null && !status.trim().isEmpty()) {
                sql.append("AND status = ? ");
                params.add(status);
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
     * Get max books allowed based on membership type.
     */
    private int getMaxBooksForType(String membershipType) {
        if (membershipType == null)
            return 3;
        switch (membershipType) {
            case "PREMIUM":
                return 10;
            case "STUDENT":
                return 5;
            default:
                return 3;
        }
    }

    private Member mapResultSetToMember(ResultSet rs) throws SQLException {
        Member member = new Member();
        member.setId(rs.getString("id"));
        member.setUserId(rs.getString("user_id"));
        member.setMemberId(rs.getString("member_id"));
        member.setName(rs.getString("name"));
        member.setEmail(rs.getString("email"));
        member.setPhone(rs.getString("phone"));
        member.setAddress(rs.getString("address"));
        member.setMembershipDate(rs.getString("join_date"));
        member.setMembershipType(rs.getString("membership_type"));
        member.setStatus(rs.getString("status"));
        member.setMaxBooksAllowed(rs.getInt("max_books_allowed"));
        member.setCurrentBorrowed(rs.getInt("current_borrowed"));
        return member;
    }
}