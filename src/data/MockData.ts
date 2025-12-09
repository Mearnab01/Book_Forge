import type { User, Book, BookCopy, Member, Loan, Reservation, DashboardStats } from '@/types';

// ============================================
// MOCK USERS (for login testing)
// ============================================

export const mockUsers: Array<User & { password: string }> = [
  {
    id: 'usr-001',
    email: 'admin@library.com',
    password: 'admin123',
    name: 'Arnab Administrator',
    role: 'ADMIN',
    phone: '+1 (555) 100-0001',
    address: '100 Admin Street, Library City',
    membershipDate: '2020-01-15',
  },
  {
    id: 'usr-002',
    email: 'librarian@library.com',
    password: 'lib123',
    name: 'Sarah Librarian',
    role: 'LIBRARIAN',
    phone: '+1 (555) 200-0002',
    address: '200 Librarian Lane, Book Town',
    membershipDate: '2021-03-20',
  },
  {
    id: 'usr-003',
    email: 'member@library.com',
    password: 'member123',
    name: 'Mike Member',
    role: 'MEMBER',
    phone: '+1 (555) 300-0003',
    address: '300 Reader Road, Story Village',
    membershipDate: '2023-06-10',
  },
];

// ============================================
// MOCK BOOKS
// ============================================

export const mockBooks: Book[] = [
  {
    id: 'book-001',
    isbn: '978-0-06-112008-4',
    title: 'To Kill a Mockingbird',
    author: 'Harper Lee',
    publisher: 'J. B. Lippincott & Co.',
    publishedYear: 1960,
    category: 'Fiction',
    description: 'A novel about racial injustice and moral growth in the American South.',
    coverImage: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=300&h=400&fit=crop',
    totalCopies: 5,
    availableCopies: 3,
  },
  {
    id: 'book-002',
    isbn: '978-0-452-28423-4',
    title: '1984',
    author: 'George Orwell',
    publisher: 'Secker & Warburg',
    publishedYear: 1949,
    category: 'Dystopian',
    description: 'A dystopian social science fiction novel about totalitarianism.',
    coverImage: 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=300&h=400&fit=crop',
    totalCopies: 4,
    availableCopies: 2,
  },
  {
    id: 'book-003',
    isbn: '978-0-7432-7356-5',
    title: 'The Great Gatsby',
    author: 'F. Scott Fitzgerald',
    publisher: 'Charles Scribner\'s Sons',
    publishedYear: 1925,
    category: 'Classic',
    description: 'A novel about the American Dream during the Roaring Twenties.',
    coverImage: 'https://images.unsplash.com/photo-1589998059171-988d887df646?w=300&h=400&fit=crop',
    totalCopies: 3,
    availableCopies: 1,
  },
  {
    id: 'book-004',
    isbn: '978-0-316-76948-0',
    title: 'The Catcher in the Rye',
    author: 'J.D. Salinger',
    publisher: 'Little, Brown and Company',
    publishedYear: 1951,
    category: 'Fiction',
    description: 'A story about teenage angst and alienation.',
    coverImage: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=300&h=400&fit=crop',
    totalCopies: 4,
    availableCopies: 4,
  },
  {
    id: 'book-005',
    isbn: '978-0-14-028329-7',
    title: 'Pride and Prejudice',
    author: 'Jane Austen',
    publisher: 'T. Egerton, Whitehall',
    publishedYear: 1813,
    category: 'Romance',
    description: 'A romantic novel that charts the emotional development of Elizabeth Bennet.',
    coverImage: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=300&h=400&fit=crop',
    totalCopies: 6,
    availableCopies: 5,
  },
  {
    id: 'book-006',
    isbn: '978-0-06-093546-7',
    title: 'To Kill a Kingdom',
    author: 'Alexandra Christo',
    publisher: 'Feiwel & Friends',
    publishedYear: 2018,
    category: 'Fantasy',
    description: 'A dark and romantic fantasy about sirens and pirates.',
    coverImage: 'https://images.unsplash.com/photo-1495446815901-a7297e633e8d?w=300&h=400&fit=crop',
    totalCopies: 3,
    availableCopies: 2,
  },
  {
    id: 'book-007',
    isbn: '978-0-385-33348-1',
    title: 'The Hobbit',
    author: 'J.R.R. Tolkien',
    publisher: 'George Allen & Unwin',
    publishedYear: 1937,
    category: 'Fantasy',
    description: 'A fantasy novel about the adventures of Bilbo Baggins.',
    coverImage: 'https://images.unsplash.com/photo-1507842217343-583bb7270b66?w=300&h=400&fit=crop',
    totalCopies: 5,
    availableCopies: 3,
  },
  {
    id: 'book-008',
    isbn: '978-0-14-028329-8',
    title: 'The Art of War',
    author: 'Sun Tzu',
    publisher: 'Various',
    publishedYear: -500,
    category: 'Philosophy',
    description: 'An ancient Chinese military treatise on warfare and strategy.',
    coverImage: 'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=300&h=400&fit=crop',
    totalCopies: 2,
    availableCopies: 2,
  },
];

// ============================================
// MOCK BOOK COPIES
// ============================================

export const mockBookCopies: BookCopy[] = [
  { id: 'copy-001', bookId: 'book-001', copyNumber: 'TKM-001', status: 'AVAILABLE', location: 'Shelf A1', addedDate: '2022-01-15' },
  { id: 'copy-002', bookId: 'book-001', copyNumber: 'TKM-002', status: 'ISSUED', location: 'Shelf A1', addedDate: '2022-01-15' },
  { id: 'copy-003', bookId: 'book-001', copyNumber: 'TKM-003', status: 'AVAILABLE', location: 'Shelf A1', addedDate: '2022-03-20' },
  { id: 'copy-004', bookId: 'book-001', copyNumber: 'TKM-004', status: 'RESERVED', location: 'Shelf A1', addedDate: '2022-06-10' },
  { id: 'copy-005', bookId: 'book-001', copyNumber: 'TKM-005', status: 'AVAILABLE', location: 'Shelf A2', addedDate: '2023-01-05' },
  { id: 'copy-006', bookId: 'book-002', copyNumber: '1984-001', status: 'AVAILABLE', location: 'Shelf B1', addedDate: '2022-02-10' },
  { id: 'copy-007', bookId: 'book-002', copyNumber: '1984-002', status: 'ISSUED', location: 'Shelf B1', addedDate: '2022-02-10' },
  { id: 'copy-008', bookId: 'book-002', copyNumber: '1984-003', status: 'ISSUED', location: 'Shelf B1', addedDate: '2022-05-15' },
  { id: 'copy-009', bookId: 'book-002', copyNumber: '1984-004', status: 'AVAILABLE', location: 'Shelf B2', addedDate: '2023-02-20' },
  { id: 'copy-010', bookId: 'book-003', copyNumber: 'GG-001', status: 'AVAILABLE', location: 'Shelf C1', addedDate: '2022-03-01' },
  { id: 'copy-011', bookId: 'book-003', copyNumber: 'GG-002', status: 'ISSUED', location: 'Shelf C1', addedDate: '2022-03-01' },
  { id: 'copy-012', bookId: 'book-003', copyNumber: 'GG-003', status: 'DAMAGED', location: 'Repair', addedDate: '2022-04-15' },
];

// ============================================
// MOCK MEMBERS
// ============================================

export const mockMembers: Member[] = [
  {
    id: 'mem-001',
    name: 'Alice Johnson',
    email: 'alice.johnson@email.com',
    phone: '+1 (555) 111-1111',
    address: '123 Oak Street, Springfield',
    membershipDate: '2022-01-10',
    membershipType: 'PREMIUM',
    status: 'ACTIVE',
    maxBooksAllowed: 10,
    currentBorrowed: 2,
  },
  {
    id: 'mem-002',
    name: 'Bob Smith',
    email: 'bob.smith@email.com',
    phone: '+1 (555) 222-2222',
    address: '456 Maple Avenue, Riverdale',
    membershipDate: '2022-03-15',
    membershipType: 'STANDARD',
    status: 'ACTIVE',
    maxBooksAllowed: 5,
    currentBorrowed: 1,
  },
  {
    id: 'mem-003',
    name: 'Carol Williams',
    email: 'carol.w@university.edu',
    phone: '+1 (555) 333-3333',
    address: '789 Pine Road, Collegetown',
    membershipDate: '2023-09-01',
    membershipType: 'STUDENT',
    status: 'ACTIVE',
    maxBooksAllowed: 7,
    currentBorrowed: 3,
  },
  {
    id: 'mem-004',
    name: 'David Brown',
    email: 'david.brown@email.com',
    phone: '+1 (555) 444-4444',
    address: '321 Elm Street, Lakewood',
    membershipDate: '2021-06-20',
    membershipType: 'PREMIUM',
    status: 'ACTIVE',
    maxBooksAllowed: 10,
    currentBorrowed: 0,
  },
  {
    id: 'mem-005',
    name: 'Emma Davis',
    email: 'emma.davis@email.com',
    phone: '+1 (555) 555-5555',
    address: '654 Cedar Lane, Hillside',
    membershipDate: '2023-01-05',
    membershipType: 'STANDARD',
    status: 'SUSPENDED',
    maxBooksAllowed: 5,
    currentBorrowed: 2,
  },
  {
    id: 'mem-006',
    name: 'Frank Miller',
    email: 'frank.m@email.com',
    phone: '+1 (555) 666-6666',
    address: '987 Birch Boulevard, Westside',
    membershipDate: '2020-11-10',
    membershipType: 'PREMIUM',
    status: 'EXPIRED',
    maxBooksAllowed: 10,
    currentBorrowed: 0,
  },
];

// ============================================
// MOCK LOANS
// ============================================

export const mockLoans: Loan[] = [
  {
    id: 'loan-001',
    bookCopyId: 'copy-002',
    memberId: 'mem-001',
    issueDate: '2024-11-01',
    dueDate: '2024-11-15',
    status: 'OVERDUE',
    book: mockBooks[0],
    member: mockMembers[0],
  },
  {
    id: 'loan-002',
    bookCopyId: 'copy-007',
    memberId: 'mem-001',
    issueDate: '2024-11-20',
    dueDate: '2024-12-04',
    status: 'ISSUED',
    book: mockBooks[1],
    member: mockMembers[0],
  },
  {
    id: 'loan-003',
    bookCopyId: 'copy-008',
    memberId: 'mem-002',
    issueDate: '2024-11-25',
    dueDate: '2024-12-09',
    status: 'ISSUED',
    book: mockBooks[1],
    member: mockMembers[1],
  },
  {
    id: 'loan-004',
    bookCopyId: 'copy-011',
    memberId: 'mem-003',
    issueDate: '2024-11-10',
    dueDate: '2024-11-24',
    status: 'OVERDUE',
    book: mockBooks[2],
    member: mockMembers[2],
  },
  {
    id: 'loan-005',
    bookCopyId: 'copy-001',
    memberId: 'mem-003',
    issueDate: '2024-10-01',
    dueDate: '2024-10-15',
    returnDate: '2024-10-14',
    status: 'RETURNED',
    book: mockBooks[0],
    member: mockMembers[2],
  },
  {
    id: 'loan-006',
    bookCopyId: 'copy-006',
    memberId: 'mem-004',
    issueDate: '2024-09-15',
    dueDate: '2024-09-29',
    returnDate: '2024-09-28',
    status: 'RETURNED',
    fineAmount: 0,
    book: mockBooks[1],
    member: mockMembers[3],
  },
];

// ============================================
// MOCK RESERVATIONS
// ============================================

export const mockReservations: Reservation[] = [
  {
    id: 'res-001',
    bookId: 'book-001',
    memberId: 'mem-002',
    reservationDate: '2024-11-28',
    expiryDate: '2024-12-05',
    status: 'PENDING',
    bookTitle: mockBooks[0],
    memberName: mockMembers[1],
  },
  {
    id: 'res-002',
    bookId: 'book-003',
    memberId: 'mem-004',
    reservationDate: '2024-11-25',
    expiryDate: '2024-12-02',
    status: 'PENDING',
    bookTitle: mockBooks[2],
    memberName: mockMembers[3],
  },
  {
    id: 'res-003',
    bookId: 'book-002',
    memberId: 'mem-003',
    reservationDate: '2024-11-20',
    expiryDate: '2024-11-27',
    status: 'EXPIRED',
    bookTitle: mockBooks[1],
    memberName: mockMembers[2],
  },
  {
    id: 'res-004',
    bookId: 'book-005',
    memberId: 'mem-001',
    reservationDate: '2024-11-15',
    expiryDate: '2024-11-22',
    status: 'FULFILLED',
    bookTitle: mockBooks[4],
    memberName: mockMembers[0],
  },
];

// ============================================
// MOCK DASHBOARD STATS
// ============================================

export const mockDashboardStats: DashboardStats = {
 totalBooks: 12548,
  availableBooks: 9876,
  totalMembers: 3421,
  activeLoans: 2672,
  overdueLoans: 145,
  pendingReservations: 89,
  todayReturns: 34,
  todayIssues: 67,
};

// ============================================
// MOCK CATEGORIES
// ============================================

export const mockCategories: string[] = [
  'Fiction',
  'Non-Fiction',
  'Classic',
  'Fantasy',
  'Dystopian',
  'Romance',
  'Philosophy',
  'Science',
  'History',
  'Biography',
];

// ============================================
// MOCK RECENT ACTIVITY
// ============================================

export const mockRecentActivity = [
  { id: 'act-001', type: 'ISSUE' as const, description: 'Alice Johnson borrowed "1984"', timestamp: '2024-12-01T10:30:00Z' },
  { id: 'act-002', type: 'RETURN' as const, description: 'Bob Smith returned "The Hobbit"', timestamp: '2024-12-01T09:15:00Z' },
  { id: 'act-003', type: 'RESERVATION' as const, description: 'Carol Williams reserved "Pride and Prejudice"', timestamp: '2024-11-30T16:45:00Z' },
  { id: 'act-004', type: 'NEW_MEMBER' as const, description: 'New member registered: Emma Davis', timestamp: '2024-11-30T14:20:00Z' },
  { id: 'act-005', type: 'ISSUE' as const, description: 'David Brown borrowed "The Art of War"', timestamp: '2024-11-30T11:00:00Z' },
];