'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { finishContent, getCourseContent, resetCourseProgress } from '@/lib/api';
import { ProgressBar } from '@/components/ProgressBar';
import { QuestionCard } from '@/components/QuestionCard';
import { ContentResponse, ProgressResponse } from '@/lib/types';

export default function CoursePage() {
  const { courseId } = useParams();
  const router = useRouter();
  const { token } = useAuth();
  const [content, setContent] = useState<ContentResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAnswer, setShowAnswer] = useState(false);
  const [progress, setProgress] = useState<ProgressResponse | null>(null);
  const [showRecommendedQuestions, setShowRecommendedQuestions] = useState(false);

  useEffect(() => {
    if (!token) {
      router.push('/auth/login');
      return;
    }

    const fetchContent = async () => {
      try {
        setIsLoading(true);
        const data = await getCourseContent(courseId as string, undefined, token);
        setContent(data);
        setShowRecommendedQuestions(false);
      } catch (err) {
        setError('Failed to load course content');
      } finally {
        setIsLoading(false);
      }
    };

    fetchContent();
  }, [courseId, token, router]);

  const handleQuestionClick = async (questionId: string) => {
    try {
      setIsLoading(true);
      const data = await getCourseContent(courseId as string, questionId, token!);
      setContent(data);
      setShowAnswer(false);
      setShowRecommendedQuestions(false);
    } catch (err) {
      setError('Failed to load question');
    } finally {
      setIsLoading(false);
    }
  };

  const handleComplete = async () => {
    if (!content) return;

    try {
      setIsLoading(true);
      const result = await finishContent(
        courseId as string,
        content.id,
        content.type,
        token!
      );
      setProgress(result);
      
      if (result.completed) {
        return;
      }

      setShowRecommendedQuestions(true);
    } catch (err) {
      setError('Failed to mark as complete');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetProgress = async () => {
    try {
      setIsLoading(true);
      await resetCourseProgress(courseId as string, token!);
      
      // Refresh the course content after reset
      const data = await getCourseContent(courseId as string, undefined, token!);
      setContent(data);
      setProgress(null);
      setShowRecommendedQuestions(false);
    } catch (err) {
      setError('Failed to reset progress');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading && !content) {
    return <div className="text-center py-10">Loading...</div>;
  }

  if (error) {
    return <div className="text-center py-10 text-red-500">{error}</div>;
  }

  // Check both progress.completed and currentProgress vs totalItems
  const isCourseCompleted = progress?.completed || 
    (content && content.currentProgress >= content.totalItems);

    if (isCourseCompleted) {
      return (
        <div className="max-w-2xl mx-auto p-6 text-center">
          <h1 className="text-2xl font-bold mb-4">Course Completed!</h1>
          <p className="mb-6">Congratulations on completing this course.</p>
          <ProgressBar 
            current={content?.totalItems || progress?.progress || 0} 
            total={content?.totalItems || progress?.totalContent || 1} 
          />
          <div className="flex flex-col sm:flex-row gap-4 justify-center mt-6">
            <button
              onClick={handleResetProgress}
              disabled={isLoading}
              className="py-2 px-4 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
            >
              {isLoading ? 'Resetting...' : 'Reset Progress'}
            </button>
            <button
              onClick={() => router.push('/learn')}
              className="py-2 px-4 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
            >
              Go to Dashboard
            </button>
          </div>
        </div>
      );
    }

  if (!content) {
    return <div className="text-center py-10">No content available</div>;
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">{content.title}</h1>
      
      <ProgressBar 
        current={content.currentProgress} 
        total={content.totalItems} 
      />
      
      <div className="mt-6 p-4 bg-white rounded-lg shadow">
        <p className="whitespace-pre-line">{content.text}</p>
        
        {content.requestedQuestion && (
          <div className="mt-6">
            <h2 className="text-lg font-semibold mb-2">Question: {content.requestedQuestion.text}</h2>
            <button
              onClick={() => setShowAnswer(!showAnswer)}
              className="text-indigo-600 hover:text-indigo-800 text-sm font-medium"
            >
              {showAnswer ? 'Hide Answer' : 'Show Answer'}
            </button>
            {showAnswer && (
              <div className="mt-2 p-3 bg-gray-50 rounded">
                <p className="text-gray-800">{content.requestedQuestion.answer}</p>
              </div>
            )}
          </div>
        )}
        
        <div className="mt-6">
          <button
            onClick={handleComplete}
            disabled={isLoading}
            className="w-full py-2 px-4 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50"
          >
            {isLoading ? 'Processing...' : 'Completed (Understood)'}
          </button>
        </div>
      </div>
      
      {showRecommendedQuestions && content.recommendedQuestions.length > 0 && (
        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-4">Recommended Questions</h2>
          <div className="space-y-3">
            {content.recommendedQuestions.map((question) => (
              <QuestionCard
                key={question.id}
                question={question}
                onClick={() => handleQuestionClick(question.id)}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}