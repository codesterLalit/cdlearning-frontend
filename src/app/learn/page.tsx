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
import { LoadingScreen } from '@/components/LoadingScreen';

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
    } catch (err:any) {
      console.log(err)
      toast.error(`${err.message?err.message: 'Failed to create course. Please try again.'}`);
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
    <div className="max-w-6xl mx-auto p-3 sm:p-4 space-y-6 sm:space-y-8">
      <LoadingScreen isVisible={isCreating} />
      
      {/* Create Course Section */}
      <form onSubmit={handleCreateCourse} className="flex flex-col sm:flex-row flex-grow items-center gap-3 sm:gap-4">
        <input
          type="text"
          placeholder="Enter topic to create course..."
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          className="flex-grow w-full sm:w-auto px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring focus:ring-indigo-100"
          required
        />
        <div className="w-full sm:w-auto sm:basis-1/5">
          <ComplexitySelect value={complexity} onChange={setComplexity} />
        </div>
        <button
          type="submit"
          disabled={isCreating || !topic.trim()}
          className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm sm:text-base"
        >
          {isCreating ? 'Creating...' : 'Create'}
        </button>
      </form>

      {/* Resume Course Section */}
      {resumeCourse && (
        <section className="bg-white p-3 sm:p-4 rounded-xl shadow flex flex-col sm:flex-row justify-between items-center gap-3 sm:gap-4">
          <CourseCard
            course={resumeCourse}
            onClick={() => router.push(`/learn/${resumeCourse.courseId}`)}
          />
          <button
            className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm sm:text-base"
            onClick={() => router.push(`/learn/${resumeCourse.courseId}`)}
          >
            Resume
          </button>
        </section>
      )}

      {/* Enrolled Courses Section */}
      <section>
        <div className="flex justify-between items-center mb-3 sm:mb-4">
          <h2 className="text-lg sm:text-xl font-semibold">Enrolled Courses</h2>
          <button
            onClick={() => setShowCompleted(!showCompleted)}
            className="text-xs sm:text-sm text-indigo-600 hover:underline"
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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
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
      <section>
        <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">Available Courses</h2>

        {coursesLoading ? (
          <div className="text-center py-4">Loading...</div>
        ) : availableCourses.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {availableCourses.map(course => (
              <div key={course.courseId} className="flex flex-col">
                <CourseCard
                  course={course}
                  onClick={() => console.log('test')}
                />
                <button
                  onClick={() => handleEnroll(course.courseId)}
                  className="mt-2 w-full py-1.5 px-3 bg-green-600 text-white rounded-md hover:bg-green-700 text-xs sm:text-sm"
                >
                  Enroll
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-sm sm:text-base">No available courses at the moment.</p>
        )}
      </section>
    </div>
  );
}
