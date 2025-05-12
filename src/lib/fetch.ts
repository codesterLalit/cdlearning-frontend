import { setGlobalLogout } from './api';

// Create a custom fetch wrapper that handles 401 responses
export const customFetch = async (url: string, options: RequestInit = {}) => {
  try {
    const response = await fetch(url, options);
    
    // Handle 401 Unauthorized responses
    if (response.status === 401) {
      // Call the global logout function
      if (typeof window !== 'undefined') {
        setGlobalLogout(() => {
          // This will be set by AuthContext
          console.log('Logging out due to 401 response');
        });
      }
      throw new Error('Unauthorized');
    }

    // Handle other error responses
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Request failed');
    }

    return response;
  } catch (error) {
    // Re-throw the error to be handled by the caller
    throw error;
  }
}; 