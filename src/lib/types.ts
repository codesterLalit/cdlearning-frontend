export interface User {
  createdAt: string;
  userId: string;
  email: string;
  username: string;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
}

export interface RegisterResponse {
  createdAt: string;
  userId: string;
  email: string;
  username: string;
}

export enum ComplexityLevel {
  SURFACE = 'Surface Level',
  EXPLORING = 'Exploring Level',
  EXPERIMENTER = 'Experimenter Level',
  EXPERT = 'Expert Level',
}

export interface Course {
  courseId: string;
  title: string;
  complexity: ComplexityLevel;
}

export interface CourseResponse {
  message: string;
  course: Course;
  enrolled: boolean;
}

export interface Question {
  id: string;
  text: string;
  answer?: string;
}

export interface ContentResponse {
  type: string;
  id: string;
  title: string;
  text: string;
  recommendedQuestions: Question[];
  requestedQuestion?: Question;
  currentProgress: number;
  totalItems: number;
}

export interface ProgressResponse {
  success: boolean;
  completed: boolean;
  totalContent: number;
  progress: number;
  progressPercentage: number;
}

export interface Question {
  id: string;
  text: string;
  answer?: string;
}