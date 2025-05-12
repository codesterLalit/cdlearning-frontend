'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { finishContent, getCourseContent, resetCourseProgress } from '@/lib/api';
import { QuestionCard } from '@/components/QuestionCard';
import { ContentResponse, ProgressResponse } from '@/lib/types';


interface CircularProgressProps {
  progress: number;
  total: number;
}

// Circular Progress Component
const CircularProgress = ({ progress, total }: CircularProgressProps) => {
  const percentage = Math.round((progress / total) * 100);
  const circumference = 2 * Math.PI * 40; // radius = 40
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="flex flex-col items-center">
      <div className="relative h-24 w-24">
        <svg className="h-24 w-24" viewBox="0 0 100 100">
          {/* Background circle */}
          <circle
            className="text-gray-200"
            strokeWidth="8"
            stroke="currentColor"
            fill="transparent"
            r="40"
            cx="50"
            cy="50"
          />
          {/* Progress circle */}
          <circle
            className="text-indigo-600 transform -rotate-90 origin-center"
            strokeWidth="8"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            stroke="currentColor"
            fill="transparent"
            r="40"
            cx="50"
            cy="50"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-xl font-bold text-indigo-700">{percentage}%</span>
        </div>
      </div>
      <p className="mt-2 text-sm font-medium text-gray-600">
        {progress} of {total} completed
      </p>
    </div>
  );
};

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
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());
  const [sidebarOpen, setSidebarOpen] = useState(true);

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

        // Expand all sections by default
        if (data?.courseHierarchy) {
          const newExpanded = new Set<string>();
          
          // Add all content items to expanded sections
          data.courseHierarchy.forEach(item => {
            if (item.type === 'content') {
              newExpanded.add(item.id);
            }
          });

          console.log('Expanded sections:', Array.from(newExpanded));
          setExpandedSections(newExpanded);
        }
      } catch (err) {
        setError('Failed to load course content');
      } finally {
        setIsLoading(false);
      }
    };

    fetchContent();
  }, [courseId, token, router]);

  const toggleSection = (id: string) => {
    setExpandedSections(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const navigateToContent = (contentId: string, type: string) => {
    router.push(`/learn/${courseId}?contentId=${contentId}&type=${type}`);
  };

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

  const renderSidebar = () => {
    if (!content?.courseHierarchy) return null;

    // Create content map
    const contentMap = new Map<string, any[]>();
    content.courseHierarchy.forEach(item => {
      if (item.type === 'content') {
        contentMap.set(item.id, []);
      }
    });

    // Populate subcontents
    content.courseHierarchy.forEach(item => {
      if (item.type === 'subcontent' && item.parentId) {
        const subContents = contentMap.get(item.parentId) || [];
        subContents.push(item);
        contentMap.set(item.parentId, subContents);
      }
    });

    return (
      <div className="h-full overflow-y-auto bg-white rounded-lg shadow">
        <div className="flex justify-between items-center p-3 border-b">
          <h2 className="text-lg font-bold text-gray-800">Course Contents</h2>
          <button 
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="md:hidden text-gray-500 hover:text-gray-700"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
        
        <div className="p-2">
          {content.courseHierarchy
            .filter(item => item.type === 'content')
            .map((contentItem, index) => {
              const subContents = contentMap.get(contentItem.id) || [];
              const hasCurrentContent = subContents.some(sub => sub.current === true);
              const isCurrentContent = contentItem.current === true;

              return (
                <div key={`content-${contentItem.id}-${index}`} className="border border-gray-200 rounded-lg overflow-hidden mb-2">
                  <div 
                    className={`p-2 flex justify-between items-center cursor-pointer transition-colors ${
                      isCurrentContent || hasCurrentContent
                        ? 'bg-indigo-100 text-indigo-800 border-l-4 border-indigo-600' 
                        : 'hover:bg-gray-50'
                    }`}
                    onClick={() => toggleSection(contentItem.id)}
                  >
                    <span className="font-medium truncate">
                      {contentItem.serialNumber}. {contentItem.title}
                    </span>
                    <svg
                      className={`w-5 h-5 transition-transform ${expandedSections.has(contentItem.id) ? 'rotate-90' : ''}`}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                  
                  {expandedSections.has(contentItem.id) && (
                    <div className="bg-gray-50">
                      {subContents.map((subContent, subIndex) => (
                        <div 
                          key={`subcontent-${subContent.id}-${subIndex}`}
                          className={`pl-4 pr-2 py-2 border-b last:border-b-0 cursor-pointer transition-colors ${
                            subContent.current === true
                              ? 'bg-indigo-50 text-indigo-800 border-l-4 border-indigo-600' 
                              : 'hover:bg-gray-100'
                          }`}
                          onClick={() => navigateToContent(subContent.id, subContent.type)}
                        >
                          <div className="flex justify-between items-center">
                            <span className="text-sm truncate">
                              {subContent.serialNumber}. {subContent.title}
                            </span>
                            {subContent.current === true && (
                              <span className="ml-2 text-xs bg-indigo-100 text-indigo-800 px-2 py-1 rounded-full">
                                Current
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
        </div>
      </div>
    );
  };

  if (isLoading && !content) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center p-6 bg-red-50 rounded-lg border border-red-200">
          <svg className="h-12 w-12 text-red-500 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <p className="text-red-600 font-medium text-lg">{error}</p>
        </div>
      </div>
    );
  }

  const isCourseCompleted = progress?.completed || 
    (content && content.currentProgress >= content.totalItems);

  if (isCourseCompleted) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-6">
        <div className="w-full max-w-2xl bg-white rounded-xl shadow-lg p-8 text-center">
          <div className="mb-6">
            <svg className="w-20 h-20 text-green-500 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-4">Course Completed!</h1>
          <p className="text-lg text-gray-600 mb-6">Congratulations on completing this course.</p>
          
          <div className="mb-8">
            <CircularProgress 
              progress={content?.totalItems || progress?.progress || 0} 
              total={content?.totalItems || progress?.totalContent || 1} 
            />
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={handleResetProgress}
              disabled={isLoading}
              className="py-2 px-6 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 transition-colors"
            >
              {isLoading ? 'Resetting...' : 'Reset Progress'}
            </button>
            <button
              onClick={() => router.push('/learn')}
              className="py-2 px-6 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
            >
              Go to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!content) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-lg text-gray-600">No content available</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile header with course title */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-30 bg-white shadow-sm border-b">
        <div className="flex items-center justify-between p-4">
          <h1 className="text-lg font-semibold text-gray-800 truncate">
            {content?.title}
          </h1>
          <button 
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 text-gray-600 hover:text-indigo-600 focus:outline-none"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </div>
      
      <div className="flex flex-col md:flex-row pt-16 md:pt-0">
        {/* Sidebar */}
        <div className={`
          fixed md:sticky top-0 left-0 h-full md:h-screen w-72 transform transition-transform z-20
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          md:translate-x-0 md:flex md:flex-shrink-0
        `}>
          <div className="flex flex-col h-full overflow-y-auto bg-white border-r border-gray-200 shadow-md">
            <div className="p-4">
              {renderSidebar()}
            </div>
          </div>
        </div>
        
        {/* Backdrop for mobile */}
        {sidebarOpen && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-10 md:hidden" 
            onClick={() => setSidebarOpen(false)}
          />
        )}
        
        {/* Main content area */}
        <div className="flex-1 p-4 md:p-6">
          <div className="flex flex-col lg:flex-row max-w-[1400px] mx-auto gap-6">
            {/* Main Content */}
            <div className="flex-1">
              <div className="bg-white rounded-xl shadow-md p-4 md:p-6 mb-6">
                <h1 className="text-xl md:text-2xl font-bold text-gray-800 mb-4 md:mb-6 border-b pb-4">
                  {content?.title}
                </h1>
                
                <div className="prose max-w-none">
                  <p className="whitespace-pre-line text-gray-700 text-sm md:text-base">
                    {content?.text}
                  </p>
                  
                  {content?.requestedQuestion && (
                    <div className="mt-6 md:mt-8 bg-gray-50 p-4 rounded-lg border border-gray-200">
                      <h2 className="text-base md:text-lg font-semibold text-gray-800 mb-3">
                        Question: {content.requestedQuestion.text}
                      </h2>
                      <button
                        onClick={() => setShowAnswer(!showAnswer)}
                        className="text-indigo-600 hover:text-indigo-800 text-sm font-medium flex items-center"
                      >
                        {showAnswer ? (
                          <>
                            <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                            </svg>
                            Hide Answer
                          </>
                        ) : (
                          <>
                            <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                            Show Answer
                          </>
                        )}
                      </button>
                      {showAnswer && (
                        <div className="mt-3 p-4 bg-white rounded border border-gray-200">
                          <p className="text-gray-800 text-sm md:text-base">
                            {content.requestedQuestion.answer}
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                  
                  <div className="mt-6 md:mt-8">
                    <button
                      onClick={handleComplete}
                      disabled={isLoading}
                      className="w-full py-3 px-4 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors flex items-center justify-center text-sm md:text-base"
                    >
                      {isLoading ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Processing...
                        </>
                      ) : (
                        <>
                          <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          Completed (Understood)
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
              
              {showRecommendedQuestions && content?.recommendedQuestions.length > 0 && (
                <div className="bg-white rounded-xl shadow-md p-4 md:p-6 mb-6">
                  <h2 className="text-lg md:text-xl font-semibold text-gray-800 mb-4">Recommended Questions</h2>
                  <div className="space-y-3">
                    {content.recommendedQuestions.map((question) => (
                      <div 
                        key={question.id}
                        className="p-3 md:p-4 border border-gray-200 rounded-lg hover:bg-indigo-50 transition-colors cursor-pointer"
                        onClick={() => handleQuestionClick(question.id)}
                      >
                        <h3 className="font-medium text-gray-900 text-sm md:text-base">{question.text}</h3>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            {/* Progress Circle - Right Column */}
            <div className="lg:w-64 mb-6 lg:mb-0">
              <div className="sticky top-6 bg-white rounded-xl shadow-md p-4 md:p-6 text-center">
                <h2 className="text-base md:text-lg font-semibold text-gray-800 mb-4">Your Progress</h2>
                <CircularProgress 
                  progress={content?.currentProgress || 0} 
                  total={content?.totalItems || 1} 
                />
                <div className="mt-4 md:mt-6 text-sm text-gray-600">
                  Keep going to complete the course!
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}