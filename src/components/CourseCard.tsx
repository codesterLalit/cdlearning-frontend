'use client';

import { Course } from '../lib/types';

interface CourseCardProps {
  course: Course;
  onClick: () => void;
}

export const CourseCard = ({ course, onClick }: CourseCardProps) => {
  return (
    <div
      onClick={onClick}
      className="p-6 bg-white border border-gray-200 rounded-xl cursor-pointer 
        hover:bg-gray-50 transition-all duration-200 
        shadow-sm hover:shadow-md 
        transform hover:-translate-y-1
        my-4
        min-h-50
        "
    >
      <h3 className="font-medium text-gray-900 text-lg mb-2">{course.title}</h3>
      <div className="space-y-2">
        <p className="text-sm text-gray-500">Complexity: {course.complexity}</p>
        {course.progress && (
          <p className="text-sm text-indigo-600">
            Progress: {course.progress.percentage}% Complete
          </p>
        )}
      </div>
    </div>
  );
};