// @ts-nocheck

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

import {
  mockUsers,
  mockBooks,
  mockBookCopies,
  mockMembers,
  mockLoans,
  mockReservations,
  mockDashboardStats,
  mockCategories,
  mockRecentActivity,
} from '@/data/MockData';

// Toggle this to switch between mock data and real API
const USE_MOCK_DATA = true;

// Simulate network delay for realistic testing
const MOCK_DELAY = 500;

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

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
  login: async (email: string, password: string): Promise<ApiResponse<{ user: User; token: string }>> => {
    if (USE_MOCK_DATA) {
      await delay(MOCK_DELAY);
      const user = mockUsers.find(u => u.email === email && u.password === password);
      if (user) {
        const { password: _, ...userWithoutPassword } = user;
        return {
          success: true,
          data: {
            user: userWithoutPassword,
            token: `mock-jwt-token-${user.id}-${Date.now()}`,
          },
        };
      }
      return { success: false, error: 'Invalid email or password' };
    }
    return fetchApi('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  },

  logout: async (): Promise<ApiResponse<void>> => {
    if (USE_MOCK_DATA) {
      await delay(MOCK_DELAY);
      return { success: true };
    }
    return fetchApi('/auth/logout', { method: 'POST' });
  },

  getCurrentUser: async (): Promise<ApiResponse<User>> => {
    if (USE_MOCK_DATA) {
      await delay(MOCK_DELAY);
      const userJson = localStorage.getItem('user');
      if (userJson) {
        return { success: true, data: JSON.parse(userJson) };
      }
      return { success: false, error: 'Not authenticated' };
    }
    return fetchApi('/auth/me');
  },

  updateProfile: async (data: Partial<User>): Promise<ApiResponse<User>> => {
    if (USE_MOCK_DATA) {
      await delay(MOCK_DELAY);
      const userJson = localStorage.getItem('user');
      if (userJson) {
        const user = { ...JSON.parse(userJson), ...data };
        localStorage.setItem('user', JSON.stringify(user));
        return { success: true, data: user };
      }
      return { success: false, error: 'Not authenticated' };
    }
    return fetchApi('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  changePassword: async (currentPassword: string, newPassword: string): Promise<ApiResponse<void>> => {
    if (USE_MOCK_DATA) {
      await delay(MOCK_DELAY);
      return { success: true };
    }
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
  getBooks: async (params?: {
    search?: string;
    category?: string;
    page?: number;
    pageSize?: number;
  }): Promise<ApiResponse<PaginatedResponse<Book>>> => {
    if (USE_MOCK_DATA) {
      await delay(MOCK_DELAY);
      let filtered = [...mockBooks];
      
      if (params?.search) {
        const search = params.search.toLowerCase();
        filtered = filtered.filter(b => 
          b.title.toLowerCase().includes(search) ||
          b.author.toLowerCase().includes(search) ||
          b.isbn.includes(search)
        );
      }
      
      if (params?.category) {
        filtered = filtered.filter(b => b.category === params.category);
      }
      
      const page = params?.page || 1;
      const pageSize = params?.pageSize || 10;
      const start = (page - 1) * pageSize;
      const paginatedData = filtered.slice(start, start + pageSize);
      
      return {
        success: true,
        data: {
          success: true,
          data: paginatedData,
          total: filtered.length,
          page,
          pageSize,
          totalPages: Math.ceil(filtered.length / pageSize),
        },
      };
    }
    
    const queryParams = new URLSearchParams();
    if (params?.search) queryParams.append('search', params.search);
    if (params?.category) queryParams.append('category', params.category);
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.pageSize) queryParams.append('pageSize', params.pageSize.toString());

    const query = queryParams.toString();
    return fetchApi(`/books${query ? `?${query}` : ''}`);
  },

  getBook: async (id: string): Promise<ApiResponse<Book>> => {
    if (USE_MOCK_DATA) {
      await delay(MOCK_DELAY);
      const book = mockBooks.find(b => b.id === id);
      if (book) return { success: true, data: book };
      return { success: false, error: 'Book not found' };
    }
    return fetchApi(`/books/${id}`);
  },

  addBook: async (book: Omit<Book, 'id' | 'availableCopies'>): Promise<ApiResponse<Book>> => {
    if (USE_MOCK_DATA) {
      await delay(MOCK_DELAY);
      const newBook: Book = {
        ...book,
        id: `book-${Date.now()}`,
        availableCopies: book.totalCopies,
      };
      mockBooks.push(newBook);
      return { success: true, data: newBook };
    }
    return fetchApi('/books', {
      method: 'POST',
      body: JSON.stringify(book),
    });
  },

  updateBook: async (id: string, book: Partial<Book>): Promise<ApiResponse<Book>> => {
    if (USE_MOCK_DATA) {
      await delay(MOCK_DELAY);
      const index = mockBooks.findIndex(b => b.id === id);
      if (index !== -1) {
        mockBooks[index] = { ...mockBooks[index], ...book };
        return { success: true, data: mockBooks[index] };
      }
      return { success: false, error: 'Book not found' };
    }
    return fetchApi(`/books/${id}`, {
      method: 'PUT',
      body: JSON.stringify(book),
    });
  },

  deleteBook: async (id: string): Promise<ApiResponse<void>> => {
    if (USE_MOCK_DATA) {
      await delay(MOCK_DELAY);
      const index = mockBooks.findIndex(b => b.id === id);
      if (index !== -1) {
        mockBooks.splice(index, 1);
        return { success: true };
      }
      return { success: false, error: 'Book not found' };
    }
    return fetchApi(`/books/${id}`, { method: 'DELETE' });
  },

  getCategories: async (): Promise<ApiResponse<string[]>> => {
    if (USE_MOCK_DATA) {
      await delay(MOCK_DELAY);
      return { success: true, data: mockCategories };
    }
    return fetchApi('/books/categories');
  },
};

// ============================================
// BOOK COPIES API
// ============================================

export const bookCopiesApi = {
  getBookCopies: async (bookId: string): Promise<ApiResponse<BookCopy[]>> => {
    if (USE_MOCK_DATA) {
      await delay(MOCK_DELAY);
      const copies = mockBookCopies.filter(c => c.bookId === bookId);
      return { success: true, data: copies };
    }
    return fetchApi(`/books/${bookId}/copies`);
  },

  addBookCopy: async (
    bookId: string,
    copy: Omit<BookCopy, 'id' | 'bookId' | 'addedDate'>
  ): Promise<ApiResponse<BookCopy>> => {
    if (USE_MOCK_DATA) {
      await delay(MOCK_DELAY);
      const newCopy: BookCopy = {
        ...copy,
        id: `copy-${Date.now()}`,
        bookId,
        addedDate: new Date().toISOString().split('T')[0],
      };
      mockBookCopies.push(newCopy);
      return { success: true, data: newCopy };
    }
    return fetchApi(`/books/${bookId}/copies`, {
      method: 'POST',
      body: JSON.stringify(copy),
    });
  },

  updateBookCopy: async (id: string, data: Partial<BookCopy>): Promise<ApiResponse<BookCopy>> => {
    if (USE_MOCK_DATA) {
      await delay(MOCK_DELAY);
      const index = mockBookCopies.findIndex(c => c.id === id);
      if (index !== -1) {
        mockBookCopies[index] = { ...mockBookCopies[index], ...data };
        return { success: true, data: mockBookCopies[index] };
      }
      return { success: false, error: 'Copy not found' };
    }
    return fetchApi(`/book-copies/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  deleteBookCopy: async (id: string): Promise<ApiResponse<void>> => {
    if (USE_MOCK_DATA) {
      await delay(MOCK_DELAY);
      const index = mockBookCopies.findIndex(c => c.id === id);
      if (index !== -1) {
        mockBookCopies.splice(index, 1);
        return { success: true };
      }
      return { success: false, error: 'Copy not found' };
    }
    return fetchApi(`/book-copies/${id}`, { method: 'DELETE' });
  },
};

// ============================================
// MEMBERS API
// ============================================

export const membersApi = {
  getMembers: async (params?: {
    search?: string;
    status?: string;
    page?: number;
    pageSize?: number;
  }): Promise<ApiResponse<PaginatedResponse<Member>>> => {
    if (USE_MOCK_DATA) {
      await delay(MOCK_DELAY);
      let filtered = [...mockMembers];
      
      if (params?.search) {
        const search = params.search.toLowerCase();
        filtered = filtered.filter(m => 
          m.name.toLowerCase().includes(search) ||
          m.email.toLowerCase().includes(search)
        );
      }
      
      if (params?.status) {
        filtered = filtered.filter(m => m.status === params.status);
      }
      
      const page = params?.page || 1;
      const pageSize = params?.pageSize || 10;
      const start = (page - 1) * pageSize;
      const paginatedData = filtered.slice(start, start + pageSize);
      
      return {
        success: true,
        data: {
          success: true,
          data: paginatedData,
          total: filtered.length,
          page,
          pageSize,
          totalPages: Math.ceil(filtered.length / pageSize),
        },
      };
    }
    
    const queryParams = new URLSearchParams();
    if (params?.search) queryParams.append('search', params.search);
    if (params?.status) queryParams.append('status', params.status);
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.pageSize) queryParams.append('pageSize', params.pageSize.toString());

    const query = queryParams.toString();
    return fetchApi(`/members${query ? `?${query}` : ''}`);
  },

  getMember: async (id: string): Promise<ApiResponse<Member>> => {
    if (USE_MOCK_DATA) {
      await delay(MOCK_DELAY);
      const member = mockMembers.find(m => m.id === id);
      if (member) return { success: true, data: member };
      return { success: false, error: 'Member not found' };
    }
    return fetchApi(`/members/${id}`);
  },

  addMember: async (member: Omit<Member, 'id' | 'currentBorrowed'>): Promise<ApiResponse<Member>> => {
    if (USE_MOCK_DATA) {
      await delay(MOCK_DELAY);
      const newMember: Member = {
        ...member,
        id: `mem-${Date.now()}`,
        currentBorrowed: 0,
      };
      mockMembers.push(newMember);
      return { success: true, data: newMember };
    }
    return fetchApi('/members', {
      method: 'POST',
      body: JSON.stringify(member),
    });
  },

  updateMember: async (id: string, member: Partial<Member>): Promise<ApiResponse<Member>> => {
    if (USE_MOCK_DATA) {
      await delay(MOCK_DELAY);
      const index = mockMembers.findIndex(m => m.id === id);
      if (index !== -1) {
        mockMembers[index] = { ...mockMembers[index], ...member };
        return { success: true, data: mockMembers[index] };
      }
      return { success: false, error: 'Member not found' };
    }
    return fetchApi(`/members/${id}`, {
      method: 'PUT',
      body: JSON.stringify(member),
    });
  },

  deleteMember: async (id: string): Promise<ApiResponse<void>> => {
    if (USE_MOCK_DATA) {
      await delay(MOCK_DELAY);
      const index = mockMembers.findIndex(m => m.id === id);
      if (index !== -1) {
        mockMembers.splice(index, 1);
        return { success: true };
      }
      return { success: false, error: 'Member not found' };
    }
    return fetchApi(`/members/${id}`, { method: 'DELETE' });
  },
};

// ============================================
// LOANS API
// ============================================

export const loansApi = {
  issueBook: async (data: {
    bookCopyId: string;
    memberId: string;
    dueDate: string;
  }): Promise<ApiResponse<Loan>> => {
    if (USE_MOCK_DATA) {
      await delay(MOCK_DELAY);
      const copy = mockBookCopies.find(c => c.id === data.bookCopyId);
      const member = mockMembers.find(m => m.id === data.memberId);
      const book = copy ? mockBooks.find(b => b.id === copy.bookId) : undefined;
      
      if (!copy || !member) {
        return { success: false, error: 'Invalid book copy or member' };
      }
      
      const newLoan: Loan = {
        id: `loan-${Date.now()}`,
        bookCopyId: data.bookCopyId,
        memberId: data.memberId,
        issueDate: new Date().toISOString().split('T')[0],
        dueDate: data.dueDate,
        status: 'ISSUED',
        book,
        member,
      };
      
      mockLoans.push(newLoan);
      copy.status = 'ISSUED';
      
      return { success: true, data: newLoan };
    }
    return fetchApi('/loans/issue', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  returnBook: async (loanId: string): Promise<ApiResponse<Loan>> => {
    if (USE_MOCK_DATA) {
      await delay(MOCK_DELAY);
      const loan = mockLoans.find(l => l.id === loanId);
      if (loan) {
        loan.status = 'RETURNED';
        loan.returnDate = new Date().toISOString().split('T')[0];
        
        const copy = mockBookCopies.find(c => c.id === loan.bookCopyId);
        if (copy) copy.status = 'AVAILABLE';
        
        return { success: true, data: loan };
      }
      return { success: false, error: 'Loan not found' };
    }
    return fetchApi('/loans/return', {
      method: 'POST',
      body: JSON.stringify({ loanId }),
    });
  },

  getLoans: async (params?: {
    memberId?: string;
    status?: string;
    page?: number;
    pageSize?: number;
  }): Promise<ApiResponse<PaginatedResponse<Loan>>> => {
    if (USE_MOCK_DATA) {
      await delay(MOCK_DELAY);
      let filtered = [...mockLoans];
      
      if (params?.memberId) {
        filtered = filtered.filter(l => l.memberId === params.memberId);
      }
      
      if (params?.status) {
        filtered = filtered.filter(l => l.status === params.status);
      }
      
      const page = params?.page || 1;
      const pageSize = params?.pageSize || 10;
      const start = (page - 1) * pageSize;
      const paginatedData = filtered.slice(start, start + pageSize);
      
      return {
        success: true,
        data: {
          success: true,
          data: paginatedData,
          total: filtered.length,
          page,
          pageSize,
          totalPages: Math.ceil(filtered.length / pageSize),
        },
      };
    }
    
    const queryParams = new URLSearchParams();
    if (params?.memberId) queryParams.append('memberId', params.memberId);
    if (params?.status) queryParams.append('status', params.status);
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.pageSize) queryParams.append('pageSize', params.pageSize.toString());

    const query = queryParams.toString();
    return fetchApi(`/loans${query ? `?${query}` : ''}`);
  },

  getLoansByMember: async (memberId: string): Promise<ApiResponse<Loan[]>> => {
    if (USE_MOCK_DATA) {
      await delay(MOCK_DELAY);
      const loans = mockLoans.filter(l => l.memberId === memberId);
      return { success: true, data: loans };
    }
    return fetchApi(`/members/${memberId}/loans`);
  },

  getOverdueLoans: async (): Promise<ApiResponse<Loan[]>> => {
    if (USE_MOCK_DATA) {
      await delay(MOCK_DELAY);
      const overdue = mockLoans.filter(l => l.status === 'OVERDUE');
      return { success: true, data: overdue };
    }
    return fetchApi('/loans/overdue');
  },
};

// ============================================
// RESERVATIONS API
// ============================================

export const reservationsApi = {
  getReservations: async (params?: {
    memberId?: string;
    status?: string;
    page?: number;
    pageSize?: number;
  }): Promise<ApiResponse<PaginatedResponse<Reservation>>> => {
    if (USE_MOCK_DATA) {
      await delay(MOCK_DELAY);
      let filtered = [...mockReservations];
      
      if (params?.memberId) {
        filtered = filtered.filter(r => r.memberId === params.memberId);
      }
      
      if (params?.status) {
        filtered = filtered.filter(r => r.status === params.status);
      }
      
      const page = params?.page || 1;
      const pageSize = params?.pageSize || 10;
      const start = (page - 1) * pageSize;
      const paginatedData = filtered.slice(start, start + pageSize);
      
      return {
        success: true,
        data: {
          success: true,
          data: paginatedData,
          total: filtered.length,
          page,
          pageSize,
          totalPages: Math.ceil(filtered.length / pageSize),
        },
      };
    }
    
    const queryParams = new URLSearchParams();
    if (params?.memberId) queryParams.append('memberId', params.memberId);
    if (params?.status) queryParams.append('status', params.status);
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.pageSize) queryParams.append('pageSize', params.pageSize.toString());

    const query = queryParams.toString();
    return fetchApi(`/reservations${query ? `?${query}` : ''}`);
  },

  addReservation: async (data: {
    bookId: string;
    memberId: string;
  }): Promise<ApiResponse<Reservation>> => {
    if (USE_MOCK_DATA) {
      await delay(MOCK_DELAY);
      const book = mockBooks.find(b => b.id === data.bookId);
      const member = mockMembers.find(m => m.id === data.memberId);
      
      if (!book || !member) {
        return { success: false, error: 'Invalid book or member' };
      }
      
      const today = new Date();
      const expiry = new Date(today);
      expiry.setDate(expiry.getDate() + 7);
      
      const newReservation: Reservation = {
        id: `res-${Date.now()}`,
        bookId: data.bookId,
        memberId: data.memberId,
        reservationDate: today.toISOString().split('T')[0],
        expiryDate: expiry.toISOString().split('T')[0],
        status: 'PENDING',
        book,
        member,
      };
      
      mockReservations.push(newReservation);
      return { success: true, data: newReservation };
    }
    return fetchApi('/reservations', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  cancelReservation: async (id: string): Promise<ApiResponse<void>> => {
    if (USE_MOCK_DATA) {
      await delay(MOCK_DELAY);
      const reservation = mockReservations.find(r => r.id === id);
      if (reservation) {
        reservation.status = 'CANCELLED';
        return { success: true };
      }
      return { success: false, error: 'Reservation not found' };
    }
    return fetchApi(`/reservations/${id}`, { method: 'DELETE' });
  },

  fulfillReservation: async (id: string): Promise<ApiResponse<Loan>> => {
    if (USE_MOCK_DATA) {
      await delay(MOCK_DELAY);
      const reservation = mockReservations.find(r => r.id === id);
      if (reservation) {
        reservation.status = 'FULFILLED';
        // Create a mock loan
        const loan: Loan = {
          id: `loan-${Date.now()}`,
          bookCopyId: 'copy-mock',
          memberId: reservation.memberId,
          issueDate: new Date().toISOString().split('T')[0],
          dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          status: 'ISSUED',
          book: reservation.book,
          member: reservation.member,
        };
        mockLoans.push(loan);
        return { success: true, data: loan };
      }
      return { success: false, error: 'Reservation not found' };
    }
    return fetchApi(`/reservations/${id}/fulfill`, { method: 'POST' });
  },
};

// ============================================
// DASHBOARD API
// ============================================

export const dashboardApi = {
  getStats: async (): Promise<ApiResponse<DashboardStats>> => {
    if (USE_MOCK_DATA) {
      await delay(MOCK_DELAY);
      return { success: true, data: mockDashboardStats };
    }
    return fetchApi('/dashboard/stats');
  },

  getRecentActivity: async (): Promise<ApiResponse<Array<{
    id: string;
    type: 'ISSUE' | 'RETURN' | 'RESERVATION' | 'NEW_MEMBER';
    description: string;
    timestamp: string;
  }>>> => {
    if (USE_MOCK_DATA) {
      await delay(MOCK_DELAY);
      return { success: true, data: mockRecentActivity };
    }
    return fetchApi('/dashboard/activity');
  },
};

// Export all APIs
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
