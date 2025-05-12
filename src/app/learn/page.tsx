'use client';

import { useState, useEffect, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { ComplexityLevel, Course } from '@/lib/types';
import {
  createCourse,
  getAvailableCourses,
  getEnrolledCourses,
  enrollCourse,
} from '@/lib/api';
import { ComplexitySelect } from '@/components/ComplexitySelect';
import { CourseCard } from '@/components/CourseCard';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'react-hot-toast';

export default function LearnPage() {
  const router = useRouter();
  const { token } = useAuth();

  const [topic, setTopic] = useState('');
  const [complexity, setComplexity] = useState<ComplexityLevel>(ComplexityLevel.SURFACE);
  const [isCreating, setIsCreating] = useState(false);
  const [enrolledCourses, setEnrolledCourses] = useState<Course[]>([]);
  const [availableCourses, setAvailableCourses] = useState<Course[]>([]);
  const [coursesLoading, setCoursesLoading] = useState(true);
  const [showCompleted, setShowCompleted] = useState(false);

  useEffect(() => {
    if (!token) return;
    fetchCourses();
  }, [token]);

  const fetchCourses = async () => {
    try {
      setCoursesLoading(true);
      const [enrolled, available] = await Promise.all([
        getEnrolledCourses(token!),
        getAvailableCourses(token!),
      ]);
      setEnrolledCourses(enrolled);
      setAvailableCourses(available);
    } catch (err) {
      console.error('Failed to fetch courses', err);
    } finally {
      setCoursesLoading(false);
    }
  };

  const handleCreateCourse = async (e: FormEvent) => {
    e.preventDefault();
    if (!topic.trim()) return;

    setIsCreating(true);
    try {
      const { course } = await createCourse(topic, complexity, token!);
      await fetchCourses();
      router.push(`/learn/${course.courseId}`);
    } catch (err) {
      toast.error('Failed to create course. Please try again.');
    } finally {
      setIsCreating(false);
    }
  };

  const handleEnroll = async (courseId: string) => {
    try {
      const response = await enrollCourse(courseId, token!);
      if (response.success) {
        toast.success('Successfully enrolled!');
        await fetchCourses();
      }
    } catch (err: any) {
      if (err.message.includes('already enrolled')) {
        toast.error('You are already enrolled in this course.');
      } else if (err.message.includes('not found')) {
        toast.error('Course not found.');
      } else {
        toast.error('Enrollment failed. Try again.');
      }
    }
  };

  const resumeCourse = enrolledCourses.find(course => !course.progress.isCompleted);

  return (
    <div className="max-w-6xl mx-auto p-4 space-y-8">
      {/* Create Course Section */}
      <section className="bg-sky-50 p-4 rounded-xl shadow flex items-center space-x-4">
        <form onSubmit={handleCreateCourse} className="flex flex-grow items-center space-x-4">
          <input
            type="text"
            placeholder="Enter topic to create course..."
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            className="flex-grow px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring focus:ring-indigo-200"
            required
          />
          <ComplexitySelect value={complexity} onChange={setComplexity} />
          <button
            type="submit"
            disabled={isCreating || !topic.trim()}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm"
          >
            {isCreating ? 'Creating...' : 'Create'}
          </button>
        </form>
      </section>

      {/* Resume Course Section */}
      {resumeCourse && (
        <section className="bg-white p-4 rounded-xl shadow flex justify-between items-center">
          <CourseCard
            course={resumeCourse}
            onClick={() => router.push(`/learn/${resumeCourse.courseId}`)}
          />
          <button
            className="ml-4 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg"
            onClick={() => router.push(`/learn/${resumeCourse.courseId}`)}
          >
            Resume
          </button>
        </section>
      )}

      {/* Enrolled Courses Section */}
      <section className="bg-white p-6 rounded-lg shadow">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Enrolled Courses</h2>
          <button
            onClick={() => setShowCompleted(!showCompleted)}
            className="text-sm text-indigo-600 hover:underline"
          >
            {showCompleted ? 'Hide Completed' : 'Show Completed'}
          </button>
        </div>

        <Tabs defaultValue="ongoing">
          <TabsList>
            <TabsTrigger value="ongoing">Ongoing</TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
          </TabsList>

          <TabsContent value="ongoing">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {enrolledCourses
                .filter(course => !course.progress.isCompleted)
                .slice(0, 6)
                .map(course => (
                  <CourseCard
                    key={course.courseId}
                    course={course}
                    onClick={() => router.push(`/learn/${course.courseId}`)}
                  />
                ))}
            </div>
          </TabsContent>

          <TabsContent value="completed">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {enrolledCourses
                .filter(course => course.progress.isCompleted)
                .map(course => (
                  <CourseCard
                    key={course.courseId}
                    course={course}
                    onClick={() => router.push(`/learn/${course.courseId}`)}
                  />
                ))}
            </div>
          </TabsContent>
        </Tabs>
      </section>

      {/* Available Courses Section */}
      <section className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">Available Courses</h2>

        {coursesLoading ? (
          <div className="text-center py-4">Loading...</div>
        ) : availableCourses.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {availableCourses.map(course => (
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
      </section>
    </div>
  );
}
