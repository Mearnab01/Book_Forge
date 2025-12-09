export type UserRole = 'ADMIN' | 'LIBRARIAN' | 'MEMBER';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  membershipDate?: string;
  phone?: string;
  address?: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

// Book Types
export interface Book {
  id: string;
  isbn: string;
  title: string;
  author: string;
  publisher: string;
  publishedYear: number;
  category: string;
  description?: string;
  coverImage?: string;
  totalCopies: number;
  availableCopies: number;
}

export interface BookCopy {
  id: string;
  bookId: string;
  copyNumber: string;
  status: 'AVAILABLE' | 'ISSUED' | 'RESERVED' | 'DAMAGED' | 'LOST';
  location: string;
  addedDate: string;
}

// Member Types
export interface Member {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  membershipDate: string;
  membershipType: 'STANDARD' | 'PREMIUM' | 'STUDENT';
  status: 'ACTIVE' | 'SUSPENDED' | 'EXPIRED';
  maxBooksAllowed: number;
  currentBorrowed: number;
}

// Loan/Issue Types
export interface Loan {
  id: string;
  bookCopyId: string;
  memberId: string;
  issueDate: string;
  dueDate: string;
  returnDate?: string;
  status: 'ISSUED' | 'RETURNED' | 'OVERDUE';
  fineAmount?: number;
  book?: Book;
  member?: Member;
}

// Reservation Types
export interface Reservation {
  id: string;
  bookId: string;
  memberId: string;
  reservationDate: string;
  expiryDate: string;
  status: 'PENDING' | 'FULFILLED' | 'CANCELLED' | 'EXPIRED';
  bookTitle?: Book;
  memberName?: Member;
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// Dashboard Stats
export interface DashboardStats {
  totalBooks: number;
  availableBooks: number;
  totalMembers: number;
  activeLoans: number;
  overdueLoans: number;
  pendingReservations: number;
  todayReturns: number;
  todayIssues: number;
}
