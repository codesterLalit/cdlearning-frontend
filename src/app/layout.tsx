'use client';

import { Toaster } from 'react-hot-toast';
import { AuthProvider } from '@/context/AuthContext';
import './globals.css';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          {children}
          <Toaster 
            position="top-right"
            toastOptions={{
              // Default options
              duration: 4000,
              style: {
                background: '#363636',
                color: '#fff',
              },
              // Success variant
              success: {
                duration: 3000,
                style: {
                  background: '#4BB543', // Green color for success
                  color: '#fff',
                },
              },
              // Error variant
              error: {
                duration: 5000,
                style: {
                  background: '#FF3333', // Red color for error
                  color: '#fff',
                },
              }
            }}
          />
        </AuthProvider>
      </body>
    </html>
  );
}