"use client";

import Link from 'next/link';
import { useAuth } from "@/context/AuthContext";

export default function Home() {
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-6">Welcome to Learning App</h1>
        {isAuthenticated ? (
          <Link
            href="/learn"
            className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Go to Learning Dashboard
          </Link>
        ) : (
          <div className="space-x-4">
            <Link
              href="auth/login"
              className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Login
            </Link>
            <Link
              href="auth/register"
              className="px-6 py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Register
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}