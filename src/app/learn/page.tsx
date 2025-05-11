'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { ComplexityLevel, Course } from '@/lib/types';
import { createCourse, getAvailableCourses, getEnrolledCourses, enrollCourse } from '@/lib/api';
import { ComplexitySelect } from '@/components/ComplexitySelect';
import { CourseCard } from '@/components/CourseCard';
import { toast } from 'react-hot-toast';

export default function LearnPage() {
  const [topic, setTopic] = useState('');
  const [complexity, setComplexity] = useState<ComplexityLevel>(ComplexityLevel.SURFACE);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [enrolledCourses, setEnrolledCourses] = useState<Course[]>([]);
  const [availableCourses, setAvailableCourses] = useState<Course[]>([]);
  const [coursesLoading, setCoursesLoading] = useState(true);
  const router = useRouter();
  const { token } = useAuth();

  useEffect(() => {
    if (!token) return;

    const fetchCourses = async () => {
      try {
        setCoursesLoading(true);
        const [enrolled, available] = await Promise.all([
          getEnrolledCourses(token),
          getAvailableCourses(token)
        ]);
        setEnrolledCourses(enrolled);
        setAvailableCourses(available);
      } catch (err) {
        console.error('Failed to fetch courses', err);
      } finally {
        setCoursesLoading(false);
      }
    };

    fetchCourses();
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim()) return;

    setIsLoading(true);
    setError('');

    try {
      const data = await createCourse(topic, complexity, token!);
      // Refresh courses after creation
      const [enrolled, available] = await Promise.all([
        getEnrolledCourses(token!),
        getAvailableCourses(token!)
      ]);
      setEnrolledCourses(enrolled);
      setAvailableCourses(available);
      router.push(`/learn/${data.course.courseId}`);
    } catch (err) {
      setError('Failed to create course. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEnroll = async (courseId: string) => {
    try {
      const response = await enrollCourse(courseId, token!);
      if (response.success) {
        toast.success('Successfully enrolled in course!');
        // Refresh courses after enrollment
        const [enrolled, available] = await Promise.all([
          getEnrolledCourses(token!),
          getAvailableCourses(token!)
        ]);
        setEnrolledCourses(enrolled);
        setAvailableCourses(available);
      }
    } catch (err: any) {
      if (err.message.includes('already enrolled')) {
        toast.error('You are already enrolled in this course');
      } else if (err.message.includes('not found')) {
        toast.error('Course not found');
      } else {
        toast.error('Failed to enroll in course');
      }
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8 shadow">
      <div className="bg-sky-50 p-6 rounded-lg shadow">
        <h1 className="text-2xl font-bold mb-6">Create a New Course</h1>
        {error && <div className="mb-4 text-red-500">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="topic" className="block text-sm font-medium text-gray-700">
              Topic
            </label>
            <input
              id="topic"
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              required
            />
          </div>
          <div>
            <label htmlFor="complexity" className="block text-sm font-medium text-gray-700">
              Complexity Level
            </label>
            <ComplexitySelect value={complexity} onChange={setComplexity} />
          </div>
          <button
            type="submit"
            disabled={isLoading || !topic.trim()}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
          >
            {isLoading ? 'Creating...' : 'Create Course'}
          </button>
        </form>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Your Enrolled Courses</h2>
          {coursesLoading ? (
            <div className="text-center py-4">Loading...</div>
          ) : enrolledCourses.length > 0 ? (
            <div className="space-y-3">
              {enrolledCourses.map((course) => (
                <div key={course.courseId} className="flex flex-col">
                  <CourseCard
                    course={course}
                    onClick={() => router.push(`/learn/${course.courseId}`)}
                  />
                  <button
                    onClick={() => router.push(`/learn/${course.courseId}`)}
                    className="mt-2 w-full py-1 px-3 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 text-sm"
                  >
                    Learn
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">You haven't enrolled in any courses yet.</p>
          )}
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Available Courses</h2>
          {coursesLoading ? (
            <div className="text-center py-4">Loading...</div>
          ) : availableCourses.length > 0 ? (
            <div className="space-y-3">
              {availableCourses.map((course) => (
                <div key={course.courseId} className="flex flex-col">
                  <CourseCard
                    course={course}
                    onClick={() => router.push(`/learn/${course.courseId}`)}
                  />
                  <button
                    onClick={() => handleEnroll(course.courseId)}
                    className="mt-2 w-full py-1 px-3 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm"
                  >
                    Enroll
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No available courses at the moment.</p>
          )}
        </div>
      </div>
    </div>
  );
}