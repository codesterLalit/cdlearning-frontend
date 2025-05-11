'use client';

import { useAuth } from "@/context/AuthContext";

// import { useAuth } from '../context/AuthContext';

export const useAuthRedirect = (shouldRedirect: boolean, redirectPath: string = '/') => {
  const { isAuthenticated } = useAuth();

  if (typeof window !== 'undefined' && shouldRedirect && !isAuthenticated) {
    window.location.href = redirectPath;
  }

  return { isAuthenticated };
};