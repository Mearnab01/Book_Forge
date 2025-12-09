/**
 * API Service Layer for Library Management System
 * 
 * This module handles all HTTP requests to the Java Servlet backend.
 * Base URL should be configured based on environment.
 */

import type {
  User,
  Book,
  BookCopy,
  Member,
  Loan,
  Reservation,
  ApiResponse,
  PaginatedResponse,
  DashboardStats,
} from '@/types';

// Configure base URL - update this to match your Java Servlet backend
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/library-api';

/**
 * Generic fetch wrapper with authentication and error handling
 */
async function fetchApi<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const token = localStorage.getItem('authToken');

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    const data = await response.json();

    if (!response.ok) {
      // Handle 401 Unauthorized - redirect to login
      if (response.status === 401) {
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }

      return {
        success: false,
        error: data.message || `HTTP Error: ${response.status}`,
      };
    }

    return { success: true, data };
  } catch (error) {
    console.error('API Error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Network error occurred',
    };
  }
}

// ============================================
// AUTHENTICATION API
// ============================================

export const authApi = {
  /**
   * Login user with email and password
   * POST /auth/login
   */
  login: async (email: string, password: string): Promise<ApiResponse<{ user: User; token: string }>> => {
    return fetchApi('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  },

  /**
   * Logout current user
   * POST /auth/logout
   */
  logout: async (): Promise<ApiResponse<void>> => {
    return fetchApi('/auth/logout', { method: 'POST' });
  },

  /**
   * Get current user profile
   * GET /auth/me
   */
  getCurrentUser: async (): Promise<ApiResponse<User>> => {
    return fetchApi('/auth/me');
  },

  /**
   * Update user profile
   * PUT /auth/profile
   */
  updateProfile: async (data: Partial<User>): Promise<ApiResponse<User>> => {
    return fetchApi('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  /**
   * Change password
   * PUT /auth/password
   */
  changePassword: async (currentPassword: string, newPassword: string): Promise<ApiResponse<void>> => {
    return fetchApi('/auth/password', {
      method: 'PUT',
      body: JSON.stringify({ currentPassword, newPassword }),
    });
  },
};

// ============================================
// BOOKS API
// ============================================

export const booksApi = {
  /**
   * Get all books with optional filtering and pagination
   * GET /books?search=&category=&page=&pageSize=
   */
  getBooks: async (params?: {
    search?: string;
    category?: string;
    page?: number;
    pageSize?: number;
  }): Promise<ApiResponse<PaginatedResponse<Book>>> => {
    const queryParams = new URLSearchParams();
    if (params?.search) queryParams.append('search', params.search);
    if (params?.category) queryParams.append('category', params.category);
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.pageSize) queryParams.append('pageSize', params.pageSize.toString());

    const query = queryParams.toString();
    return fetchApi(`/books${query ? `?${query}` : ''}`);
  },

  /**
   * Get single book by ID
   * GET /books/:id
   */
  getBook: async (id: string): Promise<ApiResponse<Book>> => {
    return fetchApi(`/books/${id}`);
  },

  /**
   * Add new book
   * POST /books
   */
  addBook: async (book: Omit<Book, 'id' | 'availableCopies'>): Promise<ApiResponse<Book>> => {
    return fetchApi('/books', {
      method: 'POST',
      body: JSON.stringify(book),
    });
  },

  /**
   * Update existing book
   * PUT /books/:id
   */
  updateBook: async (id: string, book: Partial<Book>): Promise<ApiResponse<Book>> => {
    return fetchApi(`/books/${id}`, {
      method: 'PUT',
      body: JSON.stringify(book),
    });
  },

  /**
   * Delete book
   * DELETE /books/:id
   */
  deleteBook: async (id: string): Promise<ApiResponse<void>> => {
    return fetchApi(`/books/${id}`, { method: 'DELETE' });
  },

  /**
   * Get book categories
   * GET /books/categories
   */
  getCategories: async (): Promise<ApiResponse<string[]>> => {
    return fetchApi('/books/categories');
  },
};

// ============================================
// BOOK COPIES API
// ============================================

export const bookCopiesApi = {
  /**
   * Get all copies of a specific book
   * GET /books/:bookId/copies
   */
  getBookCopies: async (bookId: string): Promise<ApiResponse<BookCopy[]>> => {
    return fetchApi(`/books/${bookId}/copies`);
  },

  /**
   * Add new copy to a book
   * POST /books/:bookId/copies
   */
  addBookCopy: async (
    bookId: string,
    copy: Omit<BookCopy, 'id' | 'bookId' | 'addedDate'>
  ): Promise<ApiResponse<BookCopy>> => {
    return fetchApi(`/books/${bookId}/copies`, {
      method: 'POST',
      body: JSON.stringify(copy),
    });
  },

  /**
   * Update book copy status
   * PUT /book-copies/:id
   */
  updateBookCopy: async (id: string, data: Partial<BookCopy>): Promise<ApiResponse<BookCopy>> => {
    return fetchApi(`/book-copies/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  /**
   * Delete book copy
   * DELETE /book-copies/:id
   */
  deleteBookCopy: async (id: string): Promise<ApiResponse<void>> => {
    return fetchApi(`/book-copies/${id}`, { method: 'DELETE' });
  },
};

// ============================================
// MEMBERS API
// ============================================

export const membersApi = {
  /**
   * Get all members with optional filtering
   * GET /members?search=&status=&page=&pageSize=
   */
  getMembers: async (params?: {
    search?: string;
    status?: string;
    page?: number;
    pageSize?: number;
  }): Promise<ApiResponse<PaginatedResponse<Member>>> => {
    const queryParams = new URLSearchParams();
    if (params?.search) queryParams.append('search', params.search);
    if (params?.status) queryParams.append('status', params.status);
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.pageSize) queryParams.append('pageSize', params.pageSize.toString());

    const query = queryParams.toString();
    return fetchApi(`/members${query ? `?${query}` : ''}`);
  },

  /**
   * Get single member by ID
   * GET /members/:id
   */
  getMember: async (id: string): Promise<ApiResponse<Member>> => {
    return fetchApi(`/members/${id}`);
  },

  /**
   * Add new member
   * POST /members
   */
  addMember: async (member: Omit<Member, 'id' | 'currentBorrowed'>): Promise<ApiResponse<Member>> => {
    return fetchApi('/members', {
      method: 'POST',
      body: JSON.stringify(member),
    });
  },

  /**
   * Update existing member
   * PUT /members/:id
   */
  updateMember: async (id: string, member: Partial<Member>): Promise<ApiResponse<Member>> => {
    return fetchApi(`/members/${id}`, {
      method: 'PUT',
      body: JSON.stringify(member),
    });
  },

  /**
   * Delete member
   * DELETE /members/:id
   */
  deleteMember: async (id: string): Promise<ApiResponse<void>> => {
    return fetchApi(`/members/${id}`, { method: 'DELETE' });
  },
};

// ============================================
// LOANS (ISSUE/RETURN) API
// ============================================

export const loansApi = {
  /**
   * Issue a book to a member
   * POST /loans/issue
   */
  issueBook: async (data: {
    bookCopyId: string;
    memberId: string;
    dueDate: string;
  }): Promise<ApiResponse<Loan>> => {
    return fetchApi('/loans/issue', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  /**
   * Return a book
   * POST /loans/return
   */
  returnBook: async (loanId: string): Promise<ApiResponse<Loan>> => {
    return fetchApi('/loans/return', {
      method: 'POST',
      body: JSON.stringify({ loanId }),
    });
  },

  /**
   * Get all loans with filtering
   * GET /loans?memberId=&status=&page=&pageSize=
   */
  getLoans: async (params?: {
    memberId?: string;
    status?: string;
    page?: number;
    pageSize?: number;
  }): Promise<ApiResponse<PaginatedResponse<Loan>>> => {
    const queryParams = new URLSearchParams();
    if (params?.memberId) queryParams.append('memberId', params.memberId);
    if (params?.status) queryParams.append('status', params.status);
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.pageSize) queryParams.append('pageSize', params.pageSize.toString());

    const query = queryParams.toString();
    return fetchApi(`/loans${query ? `?${query}` : ''}`);
  },

  /**
   * Get loans by member ID
   * GET /members/:memberId/loans
   */
  getLoansByMember: async (memberId: string): Promise<ApiResponse<Loan[]>> => {
    return fetchApi(`/members/${memberId}/loans`);
  },

  /**
   * Get overdue loans
   * GET /loans/overdue
   */
  getOverdueLoans: async (): Promise<ApiResponse<Loan[]>> => {
    return fetchApi('/loans/overdue');
  },
};

// ============================================
// RESERVATIONS API
// ============================================

export const reservationsApi = {
  /**
   * Get all reservations
   * GET /reservations?memberId=&status=&page=&pageSize=
   */
  getReservations: async (params?: {
    memberId?: string;
    status?: string;
    page?: number;
    pageSize?: number;
  }): Promise<ApiResponse<PaginatedResponse<Reservation>>> => {
    const queryParams = new URLSearchParams();
    if (params?.memberId) queryParams.append('memberId', params.memberId);
    if (params?.status) queryParams.append('status', params.status);
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.pageSize) queryParams.append('pageSize', params.pageSize.toString());

    const query = queryParams.toString();
    return fetchApi(`/reservations${query ? `?${query}` : ''}`);
  },

  /**
   * Add new reservation
   * POST /reservations
   */
  addReservation: async (data: {
    bookId: string;
    memberId: string;
  }): Promise<ApiResponse<Reservation>> => {
    return fetchApi('/reservations', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  /**
   * Cancel reservation
   * DELETE /reservations/:id
   */
  cancelReservation: async (id: string): Promise<ApiResponse<void>> => {
    return fetchApi(`/reservations/${id}`, { method: 'DELETE' });
  },

  /**
   * Fulfill reservation (convert to loan)
   * POST /reservations/:id/fulfill
   */
  fulfillReservation: async (id: string): Promise<ApiResponse<Loan>> => {
    return fetchApi(`/reservations/${id}/fulfill`, { method: 'POST' });
  },
};

// ============================================
// DASHBOARD API
// ============================================

export const dashboardApi = {
  /**
   * Get dashboard statistics
   * GET /dashboard/stats
   */
  getStats: async (): Promise<ApiResponse<DashboardStats>> => {
    return fetchApi('/dashboard/stats');
  },

  /**
   * Get recent activity
   * GET /dashboard/activity
   */
  getRecentActivity: async (): Promise<ApiResponse<Array<{
    id: string;
    type: 'ISSUE' | 'RETURN' | 'RESERVATION' | 'NEW_MEMBER';
    description: string;
    timestamp: string;
  }>>> => {
    return fetchApi('/dashboard/activity');
  },
};

// Export all APIs as a single object for convenience
export const api = {
  auth: authApi,
  books: booksApi,
  bookCopies: bookCopiesApi,
  members: membersApi,
  loans: loansApi,
  reservations: reservationsApi,
  dashboard: dashboardApi,
};

export default api;
