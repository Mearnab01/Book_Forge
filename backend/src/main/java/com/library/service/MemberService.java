package com.library.service;

import com.library.dao.*;
import com.library.model.Member;
import com.library.model.User;
import org.mindrot.jbcrypt.BCrypt;

import java.sql.SQLException;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Service layer for member operations.
 * Handles business logic for library members.
 */
public class MemberService {

    private final MemberDAO memberDao;
    private final UserDAO userDao;

    public MemberService() {
        this.memberDao = new MemberDAO();
        this.userDao = new UserDAO();
    }

    /**
     * Get paginated list of members.
     */
    public Map<String, Object> getMembers(String search, String status, int page, int pageSize)
            throws SQLException {
        // Validate pagination
        if (page < 1)
            page = 1;
        if (pageSize < 1 || pageSize > 100)
            pageSize = 10;

        List<Member> members = memberDao.findAll(search, status, page, pageSize);
        int total = memberDao.count(search, status);

        Map<String, Object> result = new HashMap<>();
        result.put("data", members);
        result.put("total", total);
        result.put("page", page);
        result.put("pageSize", pageSize);
        result.put("totalPages", (int) Math.ceil((double) total / pageSize));

        return result;
    }

    /**
     * Get member by ID.
     */
    public Member getMemberById(String id) throws SQLException {
        Member member = memberDao.findById(id);
        if (member == null) {
            throw new IllegalArgumentException("Member not found");
        }
        return member;
    }

    /**
     * Get member by user ID.
     */
    public Member getMemberByUserId(String userId) throws SQLException {
        return memberDao.findByUserId(userId);
    }

    /**
     * Create a new member with user account.
     */
    public Member createMember(Member member, String password) throws SQLException {
        // Validate required fields
        validateMember(member);

        // Check if email already exists
        if (userDao.emailExists(member.getEmail())) {
            throw new IllegalArgumentException("Email already registered");
        }

        // Create user account first
        User user = new User();
        user.setName(member.getName().trim());
        user.setEmail(member.getEmail().trim().toLowerCase());
        user.setPasswordHash(BCrypt.hashpw(password, BCrypt.gensalt()));
        user.setRole("MEMBER");

        User createdUser = userDao.create(user);

        // Create member linked to user
        member.setUserId(createdUser.getId());

        return memberDao.create(member);
    }

    /**
     * Update member details.
     */
    public Member updateMember(String id, Member member) throws SQLException {
        // Check if member exists
        Member existing = memberDao.findById(id);
        if (existing == null) {
            throw new IllegalArgumentException("Member not found");
        }

        // Validate fields
        validateMember(member);

        return memberDao.update(id, member);
    }

    /**
     * Suspend a member.
     */
    public Member suspendMember(String id) throws SQLException {
        Member member = memberDao.findById(id);
        if (member == null) {
            throw new IllegalArgumentException("Member not found");
        }

        member.setStatus("SUSPENDED");
        return memberDao.update(id, member);
    }

    /**
     * Activate a member.
     */
    public Member activateMember(String id) throws SQLException {
        Member member = memberDao.findById(id);
        if (member == null) {
            throw new IllegalArgumentException("Member not found");
        }

        member.setStatus("ACTIVE");
        return memberDao.update(id, member);
    }

    /**
     * Count total active members.
     */
    public int countActiveMembers() throws SQLException {
        return memberDao.count(null, "ACTIVE");
    }

    /**
     * Validate member fields.
     */
    private void validateMember(Member member) {
        if (member.getName() == null || member.getName().trim().isEmpty()) {
            throw new IllegalArgumentException("Name is required");
        }
        if (member.getEmail() == null || !member.getEmail().contains("@")) {
            throw new IllegalArgumentException("Valid email is required");
        }
        if (member.getPhone() == null || member.getPhone().trim().isEmpty()) {
            throw new IllegalArgumentException("Phone is required");
        }
    }
}