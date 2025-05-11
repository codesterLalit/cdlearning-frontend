import { API_BASE_URL } from './constants';
import {
  AuthResponse,
  RegisterResponse,
  CourseResponse,
  ContentResponse,
  ProgressResponse,
  ComplexityLevel,
  User,
  Course
} from './types';

export const registerUser = async (email: string, username: string, password: string): Promise<RegisterResponse> => {
  const response = await fetch(`${API_BASE_URL}/auth/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, username, password }),
  });
  return response.json();
};

export const loginUser = async (email: string, password: string): Promise<AuthResponse> => {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password }),
  });
  return response.json();
};

export const createCourse = async (topic: string, complexity: ComplexityLevel, token: string): Promise<CourseResponse> => {
  const response = await fetch(`${API_BASE_URL}/courses`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ topic, complexity }),
  });
  return response.json();
};

export const getCourseContent = async (courseId: string, questionId?: string, token?: string): Promise<ContentResponse> => {
  let url = `${API_BASE_URL}/courses/learn/${courseId}`;
  if (questionId) {
    url += `?questionId=${questionId}`;
  }
  
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  const response = await fetch(url, {
    method: 'GET',
    headers,
  });
  return response.json();
};

export const finishContent = async (
  courseId: string,
  contentId: string,
  type: string,
  token: string
): Promise<ProgressResponse> => {
  const response = await fetch(`${API_BASE_URL}/courses/finish-content`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ courseId, contentId, type }),
  });
  return response.json();
};

export const getAvailableCourses = async (token: string): Promise<Course[]> => {
  const response = await fetch(`${API_BASE_URL}/courses/available`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  return response.json();
};

export const getEnrolledCourses = async (token: string): Promise<Course[]> => {
  const response = await fetch(`${API_BASE_URL}/courses/enrolled`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  return response.json();
};

export const enrollCourse = async (courseId: string, token: string): Promise<{ success: boolean }> => {
  const response = await fetch(`${API_BASE_URL}/courses/enroll`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ courseId }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Failed to enroll in course');
  }

  return response.json();
};

export const resetCourseProgress = async (courseId: string, token: string): Promise<void> => {
  const response = await fetch(`${API_BASE_URL}/courses/${courseId}/progress`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error('Failed to reset progress');
  }
};