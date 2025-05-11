'use client';

interface ProgressBarProps {
  current: number;
  total: number;
}

export const ProgressBar = ({ current, total }: ProgressBarProps) => {
  const percentage = total > 0 ? Math.round((current / total) * 100) : 0;

  return (
    <div className="w-full bg-gray-200 rounded-full h-4">
      <div
        className="bg-indigo-600 h-4 rounded-full transition-all duration-300"
        style={{ width: `${percentage}%` }}
      ></div>
      <div className="text-xs text-gray-600 mt-1 text-center">
        {current} of {total} completed ({percentage}%)
      </div>
    </div>
  );
};