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

export interface Progress {
  isCompleted: boolean;
  percentage: number;
  total: number;
  completed: number
}

export interface Course {
  courseId: string;
  title: string;
  complexity: ComplexityLevel;
  lastInteracted?:string;
  createdAt?: string
  progress: Progress;
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

export interface CourseHierarchyItem {
  id: string;
  type: string; // "content" or "subcontent"
  title: string;
  serialNumber: number | string;
  current: boolean;
  parentId?: string;
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
  courseHierarchy: CourseHierarchyItem[];
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