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
      className="p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
    >
      <h3 className="font-medium text-gray-900">{course.title}</h3>
      <p className="text-sm text-gray-500 mt-1">Complexity: {course.complexity}</p>
    </div>
  );
};