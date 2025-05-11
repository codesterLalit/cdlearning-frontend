'use client';

import { useState } from 'react';
import { Question } from '../lib/types';

interface QuestionCardProps {
  question: Question;
  onClick: () => void;
}

export const QuestionCard = ({ question, onClick }: QuestionCardProps) => {
  return (
    <div
      onClick={onClick}
      className="p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
    >
      <h3 className="font-medium text-gray-900">{question.text}</h3>
    </div>
  );
};