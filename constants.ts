// constants.ts
import { UserRole, Election, Application, User } from './types'; // Import new type

export const ADMIN_USERNAME = 'admin'; // Kept for default/initial admin
export const ADMIN_PASSWORD = 'password'; // Kept for default/initial admin

export const STUDENT_USERNAME = 'student'; // Kept for default/initial student
export const STUDENT_PASSWORD = 'password'; // Kept for default/initial student

// Default users for initial app load if localStorage is empty
export const DEFAULT_USERS: User[] = [
  { id: 'admin_1', username: ADMIN_USERNAME, password: ADMIN_PASSWORD, role: UserRole.ADMIN, votedElections: [] },
  { id: 'student_1', username: STUDENT_USERNAME, password: STUDENT_PASSWORD, role: UserRole.STUDENT, rollNumber: '1001', votedElections: [] },
];


// Dummy election data for Student Body President (without candidates initially)
export const DUMMY_ELECTION_TEMPLATE: Omit<Election, 'candidates'> = {
  id: 'student_body_president_2024',
  title: 'Student Body President Election 2024',
  description: 'Electing the next student body president to lead the student council.',
};

// Initial empty applications array
export const DEFAULT_APPLICATIONS: Application[] = [];