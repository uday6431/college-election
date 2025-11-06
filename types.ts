// types.ts
export enum UserRole {
  ADMIN = 'admin',
  STUDENT = 'student',
  GUEST = 'guest',
}

export interface User {
  id: string; // Unique ID for the user
  username: string;
  password?: string; // Optional for safety when passing, but stored for login check
  role: UserRole;
  rollNumber?: string; // For students
  votedElections?: string[]; // New: Stores IDs of elections the user has voted in
}

export interface Candidate {
  id: string; // Candidate's ID (which is usually the student's ID)
  name: string;
  votes: number;
}

export enum ApplicationStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
}

export interface Application {
  id: string; // Unique ID for the application
  studentId: string; // ID of the student applying
  studentName: string; // Name of the student applying
  electionId: string; // For which election they are applying to be a candidate
  status: ApplicationStatus;
}

export interface Election {
  id: string;
  title: string;
  description: string;
  candidates: Candidate[];
}

export interface QRCodeEntry {
  qrCode: string;
  used: boolean;
  electionId: string; // To link QR code to a specific election
}